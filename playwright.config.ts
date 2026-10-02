import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: { baseURL: "http://127.0.0.1:43177", trace: "retain-on-failure" },
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
  ],
  webServer: {
    command:
      "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 43177",
    url: "http://127.0.0.1:43177",
    reuseExistingServer: false,
    env: { INDEXING_ENABLED: "false", SITE_URL: "http://localhost:43177" },
    timeout: 60000,
  },
});
