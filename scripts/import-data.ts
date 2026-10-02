import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { unzipSync, strFromU8 } from "fflate";
import { metricDefinitions, observation, slugify } from "../lib/geo/model";
import type {
  Geography,
  GeoSnapshot,
  MetricKey,
  SourceReceipt,
} from "../lib/geo/model";

const root = new URL("../data/", import.meta.url);
const sources: SourceReceipt[] = [];
async function source(name: string) {
  const bytes = await readFile(new URL(`raw/${name}`, root));
  const receipt = JSON.parse(
    await readFile(new URL(`raw/${name}.json`, root), "utf8"),
  );
  if (createHash("sha256").update(bytes).digest("hex") !== receipt.sha256)
    throw new Error(`Checksum mismatch: ${name}`);
  sources.push({ id: name, ...receipt });
  return bytes;
}
function rows(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/);
  const delimiter = lines[0].includes("|") ? "|" : "\t";
  const header = lines
    .shift()!
    .split(delimiter)
    .map((v) => v.trim());
  return lines.map((line) =>
    Object.fromEntries(
      line.split(delimiter).map((v, i) => [header[i], v.trim()]),
    ),
  );
}
const geographies = new Map<string, Geography>();
for (const [name, kind] of [
  ["state", "state"],
  ["counties", "county"],
  ["place", "city"],
  ["zcta", "zcta"],
] as const) {
  const archive = unzipSync(await source(`gaz-${name}.zip`));
  const entry = Object.entries(archive).find(([n]) => n.endsWith(".txt"));
  if (!entry) throw new Error(`Missing gazetteer text: ${name}`);
  for (const r of rows(strFromU8(entry[1]))) {
    if (!r.GEOID || !Number.isFinite(Number(r.INTPTLAT)))
      throw new Error("Invalid geography");
    const id = `${kind}:${r.GEOID}`;
    const label = r.NAME || `ZCTA ${r.GEOID}`;
    geographies.set(id, {
      id,
      kind,
      code: r.GEOID,
      name: label,
      state: r.USPS,
      slug: slugify(label),
      latitude: Number(r.INTPTLAT),
      longitude: Number(r.INTPTLONG),
      landSqMi: Number(r.ALAND_SQMI),
      metrics: {},
      populationHistory: [],
    });
  }
}
geographies.set("nation:US", {
  id: "nation:US",
  kind: "nation",
  code: "US",
  name: "United States",
  slug: "united-states",
  latitude: 39,
  longitude: -98,
  landSqMi: 0,
  metrics: {},
  populationHistory: [],
});
// Census can publish distinct same-named places in one state. Disambiguate URLs with the stable GEOID.
const slugGroups = new Map<string, Geography[]>();
for (const g of geographies.values()) {
  if (!["city", "county"].includes(g.kind)) continue;
  const key = `${g.kind}/${g.state}/${g.slug}`;
  const group = slugGroups.get(key) ?? [];
  group.push(g);
  slugGroups.set(key, group);
}
for (const group of slugGroups.values())
  if (group.length > 1) for (const g of group) g.slug += `-${g.code}`;
const stateByFips = new Map(
  [...geographies.values()]
    .filter((g) => g.kind === "state")
    .map((g) => [g.code, g.state]),
);
const relationships: GeoSnapshot["relationships"] = [];
const largestCountyOverlap = new Map<string, number>();
let unmatchedRelationships = 0;
for (const [name, kind, field] of [
  ["county", "county", "COUNTY"],
  ["place", "city", "PLACE"],
] as const) {
  for (const r of rows(
    (await source(`relationship-${name}.txt`)).toString("utf8"),
  )) {
    if (
      !r.GEOID_ZCTA5_20 ||
      !r[`GEOID_${field}_20`] ||
      Number(r.AREALAND_PART) <= 0
    )
      continue;
    const from = `zcta:${r.GEOID_ZCTA5_20}`;
    const to = `${kind}:${r[`GEOID_${field}_20`]}`;
    // A retired county can still supply its stable state FIPS prefix. Do not
    // discard valid state context when excluding old Connecticut county links.
    const state =
      kind === "county"
        ? stateByFips.get(r.GEOID_COUNTY_20.slice(0, 2))
        : undefined;
    if (
      state &&
      geographies.has(from) &&
      Number(r.AREALAND_PART) > (largestCountyOverlap.get(from) ?? -1)
    ) {
      geographies.get(from)!.state = state;
      largestCountyOverlap.set(from, Number(r.AREALAND_PART));
    }
    if (!geographies.has(from) || !geographies.has(to)) {
      unmatchedRelationships++;
      continue;
    }
    relationships.push({
      from,
      to,
      landOverlapSqM: Number(r.AREALAND_PART),
      source: `relationship-${name}.txt`,
      vintage: 2020,
    });
  }
}
function matchGeo(id: string): string | undefined {
  const match =
    /^(0100000US|0400000US|0500000US|1600000US|860Z200US)(\d*)$/.exec(id);
  if (!match) return;
  const kind = {
    "0100000US": "nation",
    "0400000US": "state",
    "0500000US": "county",
    "1600000US": "city",
    "860Z200US": "zcta",
  }[match[1]];
  return `${kind}:${match[2] || "US"}`;
}
for (const year of [2024, 2023]) {
  for (const key of (year === 2024
    ? Object.keys(metricDefinitions)
    : ["population"]) as MetricKey[]) {
    const table = metricDefinitions[key].table;
    const name = `acs${year}-${table.toLowerCase()}.dat`;
    const text = (await source(name)).toString("utf8");
    const lines = text
      .replace(/^\uFEFF/, "")
      .trim()
      .split(/\r?\n/);
    const header = lines.shift()!.split("|");
    const e = header.indexOf(`${table}_E001`),
      m = header.indexOf(`${table}_M001`);
    if (e < 0 || m < 0) throw new Error(`Unexpected ACS header: ${name}`);
    for (const line of lines) {
      const cells = line.split("|");
      const g = geographies.get(matchGeo(cells[0]) ?? "");
      if (!g) continue;
      const value = observation(
        cells[e],
        cells[m],
        name,
        year,
        `${table}_001E`,
      );
      if (year === 2024) g.metrics[key] = value;
      if (key === "population") g.populationHistory.push(value);
    }
  }
}
// Preserve source timestamps, so re-importing the same inputs is byte-for-byte deterministic.
const snapshot: GeoSnapshot = {
  schemaVersion: 1,
  importedAt: sources
    .map((s) => s.fetchedAt)
    .sort()
    .at(-1)!,
  sources,
  geographies: [...geographies.values()].sort((a, b) =>
    a.id.localeCompare(b.id),
  ),
  relationships: relationships.sort((a, b) =>
    `${a.from}/${a.to}`.localeCompare(`${b.from}/${b.to}`),
  ),
  postalCodes: [],
  postalMappings: [],
};
const counts = Object.fromEntries(
  ["state", "county", "city", "zcta"].map((kind) => [
    kind,
    snapshot.geographies.filter((g) => g.kind === kind).length,
  ]),
);
if (
  counts.zcta < 30000 ||
  counts.state < 50 ||
  snapshot.geographies.filter((g) => g.metrics.population?.value !== undefined)
    .length < 60000
)
  throw new Error("Incomplete national import");
const bytes = gzipSync(JSON.stringify(snapshot), { level: 9 });
await mkdir(root, { recursive: true });
await writeFile(new URL("geography.json.gz.next", root), bytes);
await rename(
  new URL("geography.json.gz.next", root),
  new URL("geography.json.gz", root),
);
const receipt = {
  schemaVersion: 1,
  importedAt: snapshot.importedAt,
  sha256: createHash("sha256").update(bytes).digest("hex"),
  counts,
  relationships: relationships.length,
  unmatchedRelationships,
  sources,
  postalVerification: "UNAVAILABLE",
  warnings: [
    "2020 relationships joined to 2025 gazetteer: unmatched changed geographies excluded.",
    "2023 and 2024 ACS five-year windows overlap; trend is descriptive, not a significance test.",
  ],
};
await writeFile(
  new URL("import-receipt.json", root),
  JSON.stringify(receipt, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      counts,
      relationships: relationships.length,
      unmatchedRelationships,
      bytes: bytes.length,
      sha256: receipt.sha256,
    },
    null,
    2,
  ),
);
