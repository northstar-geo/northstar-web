// Local-only test server. Never reads account credentials or writes a secret file.
const password = process.env.OKELOM_LOCAL_TEST_PASSWORD;
const allowed =
  /^(PATH|SYSTEMROOT|WINDIR|COMSPEC|PATHEXT|TEMP|TMP|APPDATA|LOCALAPPDATA|USERPROFILE|PROCESSOR_ARCHITECTURE|NUMBER_OF_PROCESSORS)$/i;
for (const key of Object.keys(process.env)) {
  if (!allowed.test(key)) delete process.env[key];
}
Object.assign(process.env, {
  WRANGLER_SEND_METRICS: "false",
  WRANGLER_WRITE_LOGS: "false",
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "false",
  CLOUDFLARE_INCLUDE_PROCESS_ENV: "false",
  NEXT_TELEMETRY_DISABLED: "1",
});
const { unstable_dev, unstable_readConfig } = await import("wrangler");
const config = unstable_readConfig({ config: "wrangler.jsonc" });
const server = await unstable_dev(config.main, {
  config: "wrangler.jsonc",
  ip: "127.0.0.1",
  port: 43177,
  inspectorPort: 43178,
  local: true,
  persist: false,
  logLevel: "error",
  vars: password ? { PREVIEW_AUTH_PASSWORD: password } : {},
  experimental: {
    forceLocal: true,
    disableExperimentalWarning: true,
    disableDevRegistry: true,
    watch: false,
    showInteractiveDevSession: false,
  },
});
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await server.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
console.log("Local protected diagnostic Worker listening on loopback");
await server.waitUntilExit();
