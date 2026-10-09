import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  geography,
  geographyByRoute,
  search,
  nearby,
  relatedPage,
} from "../lib/geo/repository";
import {
  numericCell,
  observation,
  routeFor,
  distanceMiles,
  hasDataValue,
  formatObservation,
} from "../lib/geo/model";
import { sitemapShard } from "../lib/sitemap";
import { canonicalSnapshot } from "../scripts/canonical-snapshot";
const snapshot = canonicalSnapshot();
const data = () => snapshot;
import { indexingEnabled, jsonLd } from "../lib/seo";
import { geographyJsonLd } from "../lib/geo/page";
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
test("ZIP and ZCTA remain distinct, preserving leading zeroes", async () => {
  assert.ok(await geography("zcta:00601"));
  assert.equal(data().postalCodes.length, 0);
  assert.equal(data().postalMappings.length, 0);
  assert.equal(await geography("postal:00601"), undefined);
  assert.equal(await geography("zcta:601"), undefined);
  assert.equal(routeFor((await geography("zcta:00601"))!), "/zip/00601");
});
test("search covers codes, names, abbreviations, pagination and hostile strings", async () => {
  assert.equal((await search("10001")).results[0]?.id, "zcta:10001");
  assert.ok(
    (await search("Austin TX")).results.some((g) => g.name === "Austin city"),
  );
  assert.ok(
    (await search("Los Angeles County")).results.some(
      (g) => g.kind === "county",
    ),
  );
  assert.equal((await search("   ")).total, 0);
  assert.equal((await search("<script>alert(1)</script>")).total, 0);
  assert.equal((await search("CA", -1)).page, 1);
  assert.ok((await search("CA", 99999)).results.length);
  assert.ok(
    (await search("CA", 1, "zcta")).results.every((g) => g.kind === "zcta"),
  );
});

test("state abbreviations match the state, not substrings in ZCTA labels", async () => {
  const result = await search("CT", 1, "zcta");
  assert.ok(result.total > 100 && result.total < 1000);
  assert.ok(result.results.every((g) => g.state === "CT"));
  assert.equal((await geography("zcta:06103"))?.state, "CT");
  assert.ok(
    (await search("Austin Texas")).results.some(
      (g) => g.name === "Austin city" && g.state === "TX",
    ),
  );
});

test("place-name words like La do not become conflicting state filters", async () => {
  assert.ok(
    (await search("La Mesa CA")).results.some(
      (g) => g.name === "La Mesa city" && g.state === "CA",
    ),
  );
  assert.ok(
    (await search("La Crosse WI")).results.some(
      (g) => g.name === "La Crosse city" && g.state === "WI",
    ),
  );
});
test("all relationships resolve and preserve provenance", async () => {
  const ids = new Set(data().geographies.map((g) => g.id));
  for (const r of data().relationships) {
    assert.ok(ids.has(r.from));
    assert.ok(ids.has(r.to));
    assert.ok(r.landOverlapSqM > 0);
    assert.equal(r.vintage, 2020);
  }
  assert.ok(
    (await relatedPage((await geography("zcta:10001"))!)).results.some(
      (g) => g.name === "New York County",
    ),
  );
});
test("nearby geographies ordered by great-circle distance, excluding self", async () => {
  const g = (await geography("zcta:10001"))!;
  const points = await nearby(g);
  assert.equal(distanceMiles(g, g), 0);
  assert.equal(points.length, 6);
  for (let i = 0; i < points.length; i++) {
    assert.notEqual(points[i].geography.id, g.id);
    if (i) assert.ok(points[i].distance >= points[i - 1].distance);
  }
});
test("statistics retain source, vintage, MOE and historical periods", async () => {
  const g = (await geography("zcta:10001"))!;
  assert.ok((g.metrics.population?.value ?? 0) > 10000);
  assert.deepEqual(
    g.populationHistory.map((p) => p.vintage).sort(),
    [2023, 2024],
  );
  for (const v of Object.values(g.metrics))
    assert.ok(data().sources.some((s) => s.id === v.source));
});
test("indexing gate rejects low-value profiles and preview indexing", async () => {
  assert.equal(
    hasDataValue({ ...(await geography("zcta:10001"))!, metrics: {} }),
    false,
  );
  assert.equal((await geographyByRoute("/zip/10001"))?.id, "zcta:10001");
  const old = process.env.INDEXING_ENABLED;
  delete process.env.INDEXING_ENABLED;
  assert.equal(indexingEnabled(), false);
  if (old !== undefined) process.env.INDEXING_ENABLED = old;
  assert.equal(
    geographyJsonLd([{ name: "United States", url: "/" }]),
    undefined,
  );
  const oldUrl = process.env.SITE_URL;
  process.env.SITE_URL = "https://zipora.example";
  try {
    const xml = await sitemapShard(0);
    assert.ok((xml.match(/<url>/g) ?? []).length <= 10000);
    assert.ok(
      !xml.includes("/search</loc>") && !xml.includes("/compare</loc>"),
    );
  } finally {
    if (oldUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = oldUrl;
  }
  assert.ok(!jsonLd({ name: "</script>" }).includes("</script>"));
});
