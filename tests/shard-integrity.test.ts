import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { canonicalSnapshot } from "../scripts/canonical-snapshot";
import { generateAssets } from "../scripts/generate-geo-assets";
import { routeFor, hasDataValue, type Relationship } from "../lib/geo/model";
import {
  link,
  type Detail,
  type Manifest,
  type SearchRow,
} from "../lib/geo/shard-format";
import { createRepository } from "../lib/geo/shard-repository";
import { readAsset } from "../lib/geo/asset-loader";

test("all 69416 entities and 99406 relationships survive generated projections exactly", async () => {
  const s = canonicalSnapshot(),
    original = new Map(s.geographies.map((g) => [g.id, g]));
  assert.equal(original.size, 69416);
  assert.equal(s.relationships.length, 99406);
  const raw = await readFile("data/geography.json.gz");
  const { manifest, artifacts } = generateAssets(
    s,
    createHash("sha256").update(raw).digest("hex"),
  );
  const seen = new Set<string>(),
    adjacency = new Map<string, Relationship[]>();
  for (const e of s.relationships)
    for (const id of [e.from, e.to]) {
      const list = adjacency.get(id) ?? [];
      list.push(e);
      adjacency.set(id, list);
    }
  for (const [name, text] of artifacts) {
    assert.equal(await readAsset(name), text, `deterministic asset ${name}`);
    if (!name.startsWith("detail/")) continue;
    for (const entry of Object.values(
      JSON.parse(text) as Record<string, Detail>,
    )) {
      const g = entry.geography;
      assert.deepEqual(g, original.get(g.id));
      assert.ok(!seen.has(g.id));
      seen.add(g.id);
      const expected =
        g.kind === "state"
          ? []
          : [
              ...new Set(
                (adjacency.get(g.id) ?? [])
                  .sort((a, b) => b.landOverlapSqM - a.landOverlapSqM)
                  .map((e) => (e.from === g.id ? e.to : e.from)),
              ),
            ].map((id) => link(original.get(id)!));
      assert.deepEqual(entry.related, JSON.parse(JSON.stringify(expected)));
      assert.equal(
        entry.indexable,
        hasDataValue(g) &&
          !!g.state &&
          (g.kind !== "zcta" || expected.length > 0),
      );
    }
  }
  assert.equal(seen.size, 69416);
  const routeIds = new Set<string>();
  for (const [name, text] of artifacts)
    if (name.startsWith("route/"))
      for (const [route, id] of Object.entries(
        JSON.parse(text) as Record<string, string>,
      )) {
        assert.equal(route, routeFor(original.get(id)!));
        routeIds.add(id);
      }
  assert.equal(routeIds.size, 69416);
  for (const state of manifest.states) {
    const projected = manifest.statePages[state.id].pages.flatMap((name) =>
      JSON.parse(artifacts.get(name)!),
    );
    const expected = s.geographies
      .filter(
        (g) =>
          g.state === state.state && g.kind !== "state" && g.kind !== "zcta",
      )
      .map(link);
    assert.deepEqual(projected, JSON.parse(JSON.stringify(expected)));
  }
  const searchIds = new Set<string>();
  for (const name of manifest.searchParts)
    for (const row of JSON.parse(artifacts.get(name)!) as SearchRow[]) {
      const g = original.get(row[0])!;
      assert.ok(!searchIds.has(g.id));
      searchIds.add(g.id);
      assert.equal(row[6], g.metrics.population?.value ?? null);
      assert.equal(row[7], g.latitude);
      assert.equal(row[8], g.longitude);
    }
  assert.equal(searchIds.size, 69415);
});

test("detail and compare read only requested buckets; missing/corrupt assets fail closed", async () => {
  const reads: string[] = [];
  const repo = createRepository(async (name) => {
    reads.push(name);
    return readAsset(name);
  });
  const a = await repo.geography("zcta:10001"),
    b = await repo.geography("zcta:90210");
  assert.equal(a?.code, "10001");
  assert.equal(b?.code, "90210");
  assert.equal(reads.length, 3);
  assert.equal(reads.filter((n) => n.startsWith("detail/")).length, 2);
  assert.equal(await repo.geography("../../private"), undefined);
  const broken = createRepository(async (name) =>
    name === "manifest.json" ? readAsset(name) : "{}",
  );
  await assert.rejects(broken.geography("zcta:10001"), /size mismatch/);
  const missing = createRepository(async (name) => {
    if (name !== "manifest.json") throw new Error("missing");
    return readAsset(name);
  });
  await assert.rejects(missing.geography("zcta:10001"), /missing/);
});

test("broad search retains only a page, including last-page clamp, without detail hydration", async () => {
  const names: string[] = [];
  const repo = createRepository(async (name) => {
    names.push(name);
    return readAsset(name);
  });
  const m: Manifest = await repo.data();
  const result = await repo.search("ZCTA", 999999);
  assert.equal(result.total, 33791);
  assert.equal(result.page, 1127);
  assert.equal(result.results.length, 11);
  assert.ok(
    names.every((n) => n === "manifest.json" || n.startsWith("search/")),
  );
  assert.equal(names.length, 1 + m.searchParts.length * 2);
  const tx = m.states.find((s) => s.state === "TX")!;
  names.length = 0;
  const page = await repo.relatedPage(tx, 10);
  assert.equal(page.results.length, 30);
  assert.equal(names.length, 1);
  assert.match(names[0], /^state\/TX\//);
});
