import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { canonicalSnapshot } from "./canonical-snapshot";
import {
  hasDataValue,
  routeFor,
  type GeoSnapshot,
  type Relationship,
} from "../lib/geo/model";
import {
  bucket,
  link,
  MAX_ASSET_BYTES,
  SEARCH_PART_BYTES,
  type Detail,
  type Manifest,
  type SearchRow,
} from "../lib/geo/shard-format";

const sha = (s: string | Buffer) =>
  createHash("sha256").update(s).digest("hex");
export function generateAssets(snapshot: GeoSnapshot, sourceSha256: string) {
  const artifacts = new Map<string, string>();
  const files: Manifest["files"] = {};
  const emit = (name: string, value: unknown) => {
    const text = JSON.stringify(value);
    const bytes = Buffer.byteLength(text);
    if (bytes > MAX_ASSET_BYTES)
      throw new Error(`Oversize geography asset: ${name} (${bytes})`);
    artifacts.set(name, text);
    files[name] = { bytes, sha256: sha(text) };
  };
  const geos = new Map(snapshot.geographies.map((g) => [g.id, g]));
  const routes = new Set(snapshot.geographies.map(routeFor));
  if (geos.size !== snapshot.geographies.length || routes.size !== geos.size)
    throw new Error("Duplicate geography identity");
  const edges = new Map<string, Relationship[]>();
  for (const edge of snapshot.relationships) {
    if (!geos.has(edge.from) || !geos.has(edge.to))
      throw new Error("Unresolved relationship");
    for (const id of [edge.from, edge.to]) {
      const group = edges.get(id) ?? [];
      group.push(edge);
      edges.set(id, group);
    }
  }
  const indexable = (id: string) => {
    const g = geos.get(id)!;
    return (
      hasDataValue(g) &&
      !!g.state &&
      (g.kind !== "zcta" || (edges.get(id)?.length ?? 0) > 0)
    );
  };
  const detailBuckets = new Map<string, Record<string, Detail>>();
  const routeBuckets = new Map<string, Record<string, string>>();
  const statePages: Manifest["statePages"] = {};
  for (const g of snapshot.geographies) {
    const related =
      g.kind === "state"
        ? []
        : [
            ...new Set(
              (edges.get(g.id) ?? [])
                .sort((a, b) => b.landOverlapSqM - a.landOverlapSqM)
                .map((e) => (e.from === g.id ? e.to : e.from)),
            ),
          ].map((id) => link(geos.get(id)!));
    const key = bucket(g.id),
      group = detailBuckets.get(key) ?? {};
    group[g.id] = { geography: g, related, indexable: indexable(g.id) };
    detailBuckets.set(key, group);
    const route = routeFor(g),
      rk = bucket(route),
      routeGroup = routeBuckets.get(rk) ?? {};
    routeGroup[route] = g.id;
    routeBuckets.set(rk, routeGroup);
    if (g.kind === "state") {
      // Existing state page displays cities/counties only, in canonical source order.
      const children = snapshot.geographies
        .filter(
          (v) => v.state === g.state && v.kind !== "state" && v.kind !== "zcta",
        )
        .map(link);
      const pages: string[] = [];
      for (let i = 0; i < children.length; i += 300) {
        const name = `state/${g.state}/${i / 300}.json`;
        emit(name, children.slice(i, i + 300));
        pages.push(name);
      }
      statePages[g.id] = { count: children.length, pages };
    }
  }
  for (const [key, value] of detailBuckets) emit(`detail/${key}.json`, value);
  for (const [key, value] of routeBuckets) emit(`route/${key}.json`, value);
  const searchParts: string[] = [];
  const rows: SearchRow[] = snapshot.geographies
    .filter((g) => g.kind !== "nation")
    .sort(
      (a, b) =>
        (b.metrics.population?.value ?? 0) -
          (a.metrics.population?.value ?? 0) || a.id.localeCompare(b.id),
    )
    .map((g) => [
      g.id,
      g.kind,
      g.code,
      g.name,
      g.state ?? "",
      g.slug,
      g.metrics.population?.value ?? null,
      g.latitude,
      g.longitude,
      indexable(g.id),
    ]);
  let part: SearchRow[] = [],
    bytes = 2;
  const flush = () => {
    if (part.length) {
      const name = `search/${searchParts.length}.json`;
      emit(name, part);
      searchParts.push(name);
      part = [];
      bytes = 2;
    }
  };
  for (const row of rows) {
    const size = Buffer.byteLength(JSON.stringify(row)) + 1;
    if (bytes + size > SEARCH_PART_BYTES) flush();
    part.push(row);
    bytes += size;
  }
  flush();
  const sitemapParts: string[] = [];
  const paths = [
    "/",
    "/about",
    "/methodology",
    "/data-sources",
    ...snapshot.geographies.filter((g) => indexable(g.id)).map(routeFor),
  ];
  for (let i = 0; i < paths.length; i += 10000) {
    const name = `sitemap/${i / 10000}.json`;
    emit(name, paths.slice(i, i + 10000));
    sitemapParts.push(name);
  }
  const counts: Manifest["counts"] = {
    nation: 0,
    state: 0,
    county: 0,
    city: 0,
    zcta: 0,
    relationships: snapshot.relationships.length,
  };
  for (const g of snapshot.geographies) counts[g.kind]++;
  const manifest: Manifest = {
    schemaVersion: 1,
    sourceSha256,
    importedAt: snapshot.importedAt,
    sources: snapshot.sources,
    counts,
    states: snapshot.geographies.filter((g) => g.kind === "state"),
    nation: geos.get("nation:US")!,
    searchParts,
    statePages,
    sitemapParts,
    files,
  };
  const text = JSON.stringify(manifest);
  if (Buffer.byteLength(text) > 256 * 1024)
    throw new Error("Oversize manifest");
  artifacts.set("manifest.json", text);
  return { manifest, artifacts };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const source = await readFile("data/geography.json.gz");
  const receipt = JSON.parse(
    await readFile("data/import-receipt.json", "utf8"),
  );
  if (sha(source) !== receipt.sha256)
    throw new Error("Canonical snapshot digest mismatch");
  const { artifacts, manifest } = generateAssets(
    canonicalSnapshot(),
    sha(source),
  );
  for (const [name, text] of artifacts) {
    const target = resolve("public/_geo", name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, text);
  }
  console.log(
    JSON.stringify({
      sourceSha256: manifest.sourceSha256,
      counts: manifest.counts,
      files: artifacts.size,
      searchParts: manifest.searchParts.length,
      largestAssetBytes: Math.max(
        ...Object.values(manifest.files).map((f) => f.bytes),
      ),
      manifestBytes: Buffer.byteLength(artifacts.get("manifest.json")!),
    }),
  );
}
