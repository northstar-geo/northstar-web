import { defineConfig, devices } from "@playwright/test";

const firefoxValidationEnabled = process.env.PLAYWRIGHT_FIREFOX === "true";
const workerValidationEnabled = process.env.PLAYWRIGHT_RUNTIME === "worker";
const localTestPassword = process.env.OKELOM_LOCAL_TEST_PASSWORD;
if (workerValidationEnabled && !localTestPassword) {
  throw new Error(
    "Use node scripts/validate-preview.mjs worker-browser for an ephemeral local credential",
  );
}

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  outputDir: workerValidationEnabled
    ? "test-results/worker"
    : "test-results/next",
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: workerValidationEnabled
          ? "test-results/worker-results.json"
          : "test-results/results.json",
      },
    ],
  ],
  use: {
    baseURL: "http://127.0.0.1:43177",
    // Authenticated traces can retain Authorization headers; never record them.
    trace: workerValidationEnabled ? "off" : "retain-on-failure",
    httpCredentials: workerValidationEnabled
      ? { username: "founder", password: localTestPassword!, send: "always" }
      : undefined,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: "msedge" },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        channel: "msedge",
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      // The browser binary is intentionally opt-in so the standard local
      // suite stays runnable on machines that have not installed Firefox.
      testMatch: firefoxValidationEnabled ? undefined : /$^/,
    },
  ],
  webServer: {
    command: workerValidationEnabled
      ? "node scripts/local-worker-preview.mjs"
      : "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 43177",
    url: "http://127.0.0.1:43177",
    reuseExistingServer: false,
    env: { INDEXING_ENABLED: "false", SITE_URL: "http://localhost:43177" },
    timeout: 60000,
  },
});
