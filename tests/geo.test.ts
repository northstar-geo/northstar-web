import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  data,
  geography,
  geographyByRoute,
  search,
  nearby,
  related,
  allIndexable,
} from "../lib/geo/repository";
import {
  numericCell,
  observation,
  routeFor,
  distanceMiles,
  hasDataValue,
  formatObservation,
} from "../lib/geo/model";
import { sitemapEntries, sitemapShard } from "../lib/sitemap";
import { indexingEnabled, jsonLd } from "../lib/seo";
test("Census sentinels, blanks and nonnumbers never become zero", () => {
  for (const value of ["", " ", "-666666666", "null", "NaN", undefined])
    assert.equal(numericCell(value), null);
  assert.equal(numericCell("0"), 0);
  assert.equal(numericCell("34.5"), 34.5);
  assert.equal(
    observation("250001", "-555555555", "test", 2024, "B19013_001E").moe,
    null,
  );
  assert.match(
    observation("250001", "4", "test", 2024, "B19013_001E").limitation!,
    /top-coded/,
  );
});

test("median reporting thresholds do not alter population counts", () => {
  assert.equal(
    observation("4001", "100", "test", 2024, "B01003_001E").limitation,
    undefined,
  );
  assert.equal(
    observation("250001", "100", "test", 2024, "B01003_001E").value,
    250001,
  );
  assert.equal(
    observation("250001", "-555555555", "test", 2024, "B19013_001E").value,
    250000,
  );
  assert.equal(
    observation("2499", "-555555555", "test", 2024, "B19013_001E").value,
    2500,
  );
  assert.match(
    observation("2499", "-555555555", "test", 2024, "B19013_001E").limitation!,
    /bottom-coded/,
  );
  assert.equal(
    formatObservation(
      observation("3501", "-333333333", "test", 2024, "B25064_001E"),
      "rent",
    ),
    "≥ $3,500",
  );
  assert.equal(
    formatObservation(
      observation("99", "-333333333", "test", 2024, "B25064_001E"),
      "rent",
    ),
    "< $100",
  );
  assert.equal(
    formatObservation(
      observation("2000001", "-333333333", "test", 2024, "B25077_001E"),
      "homeValue",
    ),
    "≥ $2,000,000",
  );
  assert.equal(
    formatObservation(
      observation("0", "-333333333", "test", 2024, "B01002_001E"),
      "age",
    ),
    "< 1",
  );
});
test("national snapshot integrity and unique identifiers/routes", () => {
  const receipt = JSON.parse(readFileSync("data/import-receipt.json", "utf8"));
  assert.equal(
    createHash("sha256")
      .update(readFileSync("data/geography.json.gz"))
      .digest("hex"),
    receipt.sha256,
  );
  const all = data().geographies;
  assert.ok(all.length > 60000);
  assert.equal(new Set(all.map((g) => g.id)).size, all.length);
  assert.equal(new Set(all.map(routeFor)).size, all.length);
  for (const g of all) {
    assert.ok(Number.isFinite(g.latitude) && Math.abs(g.latitude) <= 90);
    assert.ok(Number.isFinite(g.longitude) && Math.abs(g.longitude) <= 180);
    for (const v of Object.values(g.metrics))
      assert.ok(v.value === null || v.value >= 0);
  }
});
test("ZIP and ZCTA remain distinct, preserving leading zeroes", () => {
  assert.ok(geography("zcta:00601"));
  assert.equal(data().postalCodes.length, 0);
  assert.equal(data().postalMappings.length, 0);
  assert.equal(geography("postal:00601"), undefined);
  assert.equal(geography("zcta:601"), undefined);
  assert.equal(routeFor(geography("zcta:00601")!), "/zip/00601");
});
test("search covers codes, names, abbreviations, pagination and hostile strings", () => {
  assert.equal(search("10001").results[0]?.id, "zcta:10001");
  assert.ok(search("Austin TX").results.some((g) => g.name === "Austin city"));
  assert.ok(
    search("Los Angeles County").results.some((g) => g.kind === "county"),
  );
  assert.equal(search("   ").total, 0);
  assert.equal(search("<script>alert(1)</script>").total, 0);
  assert.equal(search("CA", -1).page, 1);
  assert.ok(search("CA", 99999).results.length);
  assert.ok(search("CA", 1, "zcta").results.every((g) => g.kind === "zcta"));
});

test("state abbreviations match the state, not substrings in ZCTA labels", () => {
  const result = search("CT", 1, "zcta");
  assert.ok(result.total > 100 && result.total < 1000);
  assert.ok(result.results.every((g) => g.state === "CT"));
  assert.equal(geography("zcta:06103")?.state, "CT");
  assert.ok(
    search("Austin Texas").results.some(
      (g) => g.name === "Austin city" && g.state === "TX",
    ),
  );
});

test("place-name words like La do not become conflicting state filters", () => {
  assert.ok(
    search("La Mesa CA").results.some(
      (g) => g.name === "La Mesa city" && g.state === "CA",
    ),
  );
  assert.ok(
    search("La Crosse WI").results.some(
      (g) => g.name === "La Crosse city" && g.state === "WI",
    ),
  );
});
test("all relationships resolve and preserve provenance", () => {
  for (const r of data().relationships) {
    assert.ok(geography(r.from));
    assert.ok(geography(r.to));
    assert.ok(r.landOverlapSqM > 0);
    assert.equal(r.vintage, 2020);
  }
  assert.ok(
    related(geography("zcta:10001")!).some((g) => g.name === "New York County"),
  );
});
test("nearby geographies ordered by great-circle distance, excluding self", () => {
  const g = geography("zcta:10001")!;
  const points = nearby(g);
  assert.equal(distanceMiles(g, g), 0);
  assert.equal(points.length, 6);
  for (let i = 0; i < points.length; i++) {
    assert.notEqual(points[i].geography.id, g.id);
    if (i) assert.ok(points[i].distance >= points[i - 1].distance);
  }
});
test("statistics retain source, vintage, MOE and historical periods", () => {
  const g = geography("zcta:10001")!;
  assert.ok((g.metrics.population?.value ?? 0) > 10000);
  assert.deepEqual(
    g.populationHistory.map((p) => p.vintage).sort(),
    [2023, 2024],
  );
  for (const v of Object.values(g.metrics))
    assert.ok(data().sources.some((s) => s.id === v.source));
});
test("indexing gate rejects low-value profiles and preview indexing", () => {
  assert.equal(
    hasDataValue({ ...geography("zcta:10001")!, metrics: {} }),
    false,
  );
  assert.ok(
    allIndexable().every(
      (g) => hasDataValue(g) && geographyByRoute(routeFor(g)),
    ),
  );
  const old = process.env.INDEXING_ENABLED;
  delete process.env.INDEXING_ENABLED;
  assert.equal(indexingEnabled(), false);
  if (old !== undefined) process.env.INDEXING_ENABLED = old;
  assert.ok(!sitemapEntries().includes("/search"));
  assert.ok(!sitemapEntries().includes("/compare"));
  assert.ok((sitemapShard(0).match(/<url>/g) ?? []).length <= 10000);
  assert.ok(!jsonLd({ name: "</script>" }).includes("</script>"));
});
