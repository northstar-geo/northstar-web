import { mkdir, writeFile, access } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const port = Number(process.env.RELEASE_LAB_PORT || 43179);
const origin = `http://127.0.0.1:${port}`;
const routes = ["/", "/search?q=Austin+TX", "/zip/10001", "/state/ca", "/compare?left=10001&right=90210"];
const timeoutMs = 60_000;

async function waitForServer() {
  const startedAt = performance.now();
  while (performance.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) return performance.now() - startedAt;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

async function request(path) {
  const startedAt = performance.now();
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30_000) });
  await response.arrayBuffer();
  return { path, status: response.status, durationMs: Math.round(performance.now() - startedAt) };
}

function residentMemoryMiB(pid) {
  if (process.platform !== "win32") return null;
  const command = `(Get-Process -Id ${pid} -ErrorAction Stop).WorkingSet64 / 1MB`;
  const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", command], { encoding: "utf8" });
  const value = Number(result.stdout.trim());
  return Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
}

async function main() {
  await access(".next/BUILD_ID");
  if (!process.env.SITE_URL) throw new Error("SITE_URL must be supplied for release-lab metadata validation");
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, INDEXING_ENABLED: "false", SITE_URL: process.env.SITE_URL },
    stdio: "pipe",
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  try {
    const coldStartMs = Math.round(await waitForServer());
    const steady = [];
    for (const route of routes) steady.push(await request(route));
    const concurrency = {};
    for (const level of [2, 4, 8]) {
      const samples = await Promise.all(Array.from({ length: level }, () => request("/zip/10001")));
      concurrency[level] = samples;
    }
    const all = [...steady, ...Object.values(concurrency).flat()];
    const failures = all.filter((sample) => sample.status >= 500);
    const report = {
      schemaVersion: 1,
      kind: "LOCAL_RELEASE_LAB",
      origin,
      coldStartMs,
      steady,
      concurrency,
      serverRssMiB: residentMemoryMiB(child.pid),
      status: failures.length ? "FAIL" : "PASS",
      fiveXxCount: failures.length,
      limitations: [
        "Local process measurements are not hosting capacity guarantees.",
        "No field traffic, real-user metrics, or production provider logging is included.",
      ],
    };
    await mkdir("test-results", { recursive: true });
    await writeFile("test-results/release-lab.json", `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    child.kill();
    if (!child.killed) child.kill("SIGKILL");
    if (output.includes("Error:")) console.error(output);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
