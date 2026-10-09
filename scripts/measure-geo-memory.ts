import { createRepository } from "../lib/geo/shard-repository";
import { readAsset } from "../lib/geo/asset-loader";

if (!global.gc)
  throw new Error(
    "Run node --expose-gc --import tsx scripts/measure-geo-memory.ts",
  );
const mib = (bytes: number) => Math.round((bytes / 1048576) * 100) / 100;
const usage = () => {
  const m = process.memoryUsage();
  return {
    heap: m.heapUsed,
    external: m.external,
    proxy: m.heapUsed + m.external,
    rss: m.rss,
  };
};
async function collect() {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    global.gc!();
  }
}
let peak = 0,
  reads = 0;
const sample = () => {
  peak = Math.max(peak, usage().proxy);
};
const repo = createRepository(async (name) => {
  sample();
  reads++;
  const text = await readAsset(name);
  sample();
  return text;
});
await collect();
const cold = usage();
const scenarios: Array<[string, () => Promise<unknown>]> = [
  ["HOME", async () => (await repo.data()).states],
  ["SEARCH", () => repo.search("ZCTA", 999999)],
  [
    "STATE",
    async () =>
      repo.relatedPage(
        (await repo.data()).states.find((s) => s.state === "TX")!,
        10,
      ),
  ],
  ["COUNTY", () => repo.geographyByRoute("/county/ca/los-angeles-county")],
  [
    "PLACE_DETAIL",
    async () => {
      const g = (await repo.geography("zcta:10001"))!;
      return {
        g,
        related: await repo.relatedPage(g),
        nearby: await repo.nearby(g),
        state: await repo.stateFor(g),
      };
    },
  ],
  [
    "COMPARE_2",
    async () => [
      await repo.geography("zcta:10001"),
      await repo.geography("zcta:90210"),
    ],
  ],
  [
    "COMPARE_MULTI",
    async () => {
      const list = [];
      for (const id of ["00601", "10001", "90210", "33109", "60601", "94103"])
        list.push(await repo.geography(`zcta:${id}`));
      return list;
    },
  ],
  ["DATA_ASSET", () => readAsset("search/0.json")],
];
const evidence = [];
for (const [name, run] of scenarios) {
  await collect();
  peak = usage().proxy;
  reads = 0;
  const timer = setInterval(sample, 1);
  let result: unknown = await run();
  sample();
  if (result === undefined) throw new Error(`No result: ${name}`);
  const post = usage();
  result = undefined;
  clearInterval(timer);
  await collect();
  const retained = usage();
  evidence.push({
    name,
    reads,
    coldMiB: mib(cold.proxy),
    postRequestMiB: mib(post.proxy),
    sampledPeakMiB: mib(peak),
    retainedMiB: mib(retained.proxy),
    retainedHeapMiB: mib(retained.heap),
    rssMiB: mib(retained.rss),
  });
}
const beforeRepeated = usage();
for (let i = 0; i < 50; i++) {
  await repo.search(i % 2 ? "CA" : "Austin TX");
  await repo.geography(`zcta:${i % 2 ? "10001" : "90210"}`);
}
await collect();
const afterRepeated = usage();
console.log(
  JSON.stringify(
    {
      metric: "LOCAL_MEMORY_PROXY_ONLY",
      proxyDefinition:
        "Node heapUsed + external; sampled peak is a lower bound, not Cloudflare isolate measurement",
      baselineRetainedHeapMiB: 155.6,
      targetMiB: 96,
      evidence,
      repeatedRequests: 100,
      repeatedRetainedGrowthMiB: mib(
        afterRepeated.proxy - beforeRepeated.proxy,
      ),
      fullDatasetGlobalRetention: false,
    },
    null,
    2,
  ),
);
if (
  evidence.some((r) => r.sampledPeakMiB > 96 || r.retainedMiB > 96) ||
  afterRepeated.proxy - beforeRepeated.proxy > 8 * 1048576
)
  process.exitCode = 1;
