import test from "node:test";
import assert from "node:assert/strict";
import * as current from "../lib/geo/repository";

test("search preserves absent population rather than inventing zero", async () => {
  const result = await current.search("5127252");
  const fallsRun = result.results.find((g) => g.code === "5127252");
  assert.ok(fallsRun);
  assert.equal(fallsRun.population, null);
});

test("a detail lookup does not allocate the nationwide dataset", async () => {
  const before = process.memoryUsage().heapUsed;
  const result = await current.geography("zcta:10001");
  assert.equal(result?.id, "zcta:10001");
  assert.ok(
    process.memoryUsage().heapUsed - before < 32 * 1024 * 1024,
    "one detail must use bounded assets, not parse the full snapshot",
  );
});
