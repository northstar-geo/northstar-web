import { mkdir, writeFile, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const port = Number(process.env.RELEASE_VITALS_PORT || 43180);
const origin = `http://127.0.0.1:${port}`;
const routes = ["/", "/search?q=Austin+TX", "/zip/10001", "/state/ca", "/compare?left=10001&right=90210"];

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(origin, { signal: AbortSignal.timeout(1_000) })).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Local production server did not become ready within 60000ms");
}

async function main() {
  await access(".next/BUILD_ID");
  if (!process.env.SITE_URL) throw new Error("SITE_URL must be supplied for release web-vitals metadata validation");
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, INDEXING_ENABLED: "false", SITE_URL: process.env.SITE_URL },
    stdio: "ignore",
  });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ channel: "msedge" });
    const measurements = [];
    for (const path of routes) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__ziporaVitals = { lcp: null, cls: 0, shifts: [] };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) window.__ziporaVitals.lcp = Math.round(entry.startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;
            window.__ziporaVitals.cls += entry.value;
            window.__ziporaVitals.shifts.push({
              value: Number(entry.value.toFixed(4)),
              sources: entry.sources.map((source) => source.node?.tagName + (source.node?.id ? `#${source.node.id}` : "") + (source.node?.className ? `.${String(source.node.className).replaceAll(" ", ".")}` : "")),
            });
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      const response = await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const values = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        return {
          lcpMs: window.__ziporaVitals.lcp,
          cls: Number(window.__ziporaVitals.cls.toFixed(4)),
          shifts: window.__ziporaVitals.shifts,
          ttfbMs: navigation ? Math.round(navigation.responseStart) : null,
          inp: "NOT_AVAILABLE_NO_REAL_USER_INTERACTION",
        };
      });
      measurements.push({ path, status: response?.status() ?? null, ...values });
      await context.close();
    }
    const report = {
      schemaVersion: 1,
      kind: "LOCAL_LAB_WEB_VITALS",
      browser: "Microsoft Edge via Playwright",
      measurements,
      fieldCoreWebVitals: "NOT_AVAILABLE_PRE_LAUNCH",
      limitations: [
        "This is a local lab run, not field Core Web Vitals.",
        "INP requires real user interaction and is not represented by this scripted navigation run.",
        "Results vary by local machine, browser, cache state, and selected hosting platform.",
      ],
    };
    await mkdir("test-results", { recursive: true });
    await writeFile("test-results/release-web-vitals.json", `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report, null, 2));
    if (measurements.some((measurement) => measurement.status !== 200)) process.exitCode = 1;
  } finally {
    await browser?.close();
    server.kill();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
