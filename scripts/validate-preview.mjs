// Reproducible local validation using existing dependencies, without personal
// dotenv/npm configs, Cloudflare credentials, remote commands or secret files.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createWriteStream, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) =>
    /^(PATH|SYSTEMROOT|WINDIR|COMSPEC|PATHEXT|TEMP|TMP|APPDATA|LOCALAPPDATA|USERPROFILE|PROCESSOR_ARCHITECTURE|NUMBER_OF_PROCESSORS)$/i.test(
      key,
    ),
  ),
);
const npm = path.join(
  path.dirname(process.execPath),
  "node_modules/npm/bin/npm-cli.js",
);
const root = process.cwd();
if (
  readdirSync(root).some(
    (name) =>
      /^(\.env($|\.)|\.dev\.vars($|\.))/.test(name) && name !== ".env.example",
  )
) {
  throw new Error(
    "Local validation requires a checkout without private dotenv or dev.vars files",
  );
}
const artifactDir = ".artifacts/preview-auth";
mkdirSync(artifactDir, { recursive: true });
Object.assign(env, {
  NEXT_TELEMETRY_DISABLED: "1",
  WRANGLER_SEND_METRICS: "false",
  WRANGLER_WRITE_LOGS: "false",
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "false",
  CLOUDFLARE_INCLUDE_PROCESS_ENV: "false",
  CI: "1",
  RELEASE_STAGE: "preview",
  INDEXING_ENABLED: "false",
  SITE_URL: "http://localhost:43177",
  NPM_CONFIG_USERCONFIG: path.join(root, artifactDir, "unused-user.config"),
  NPM_CONFIG_GLOBALCONFIG: path.join(root, artifactDir, "unused-global.config"),
  NPM_CONFIG_UPDATE_NOTIFIER: "false",
  NPM_CONFIG_FUND: "false",
});
const mode = process.argv[2];
if (mode === "worker-browser") {
  env.PLAYWRIGHT_RUNTIME = "worker";
  env.OKELOM_LOCAL_TEST_PASSWORD = randomBytes(32).toString("hex");
}
const commands = {
  build: ["node_modules/@opennextjs/cloudflare/dist/cli/index.js", "build"],
  lint: [npm, "run", "lint"],
  typecheck: [npm, "run", "typecheck"],
  test: [npm, "test"],
  browser: [npm, "run", "test:e2e"],
  "worker-browser": [npm, "run", "test:e2e"],
  security: ["--test", "scripts/verify-security-exception.test.mjs"],
  auth: ["scripts/test-preview-auth.mjs"],
};
if (!Object.hasOwn(commands, mode))
  throw new Error("Unknown local validation mode");
const log = createWriteStream(path.join(artifactDir, `${mode}.log`));
async function run(args) {
  const child = spawn(process.execPath, args, {
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (data) => {
      log.write(data);
      process.stdout.write(data);
    });
  return await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}
// Match OpenNext's official preview lifecycle: build alone does not copy the
// read-only prerender cache into static assets. This is local-only preparation.
let code = 0;
if (mode === "auth" || mode === "worker-browser") {
  code = await run([
    "node_modules/@opennextjs/cloudflare/dist/cli/index.js",
    "populateCache",
    "local",
  ]);
}
if (code === 0) code = await run(commands[mode]);
log.end();
process.exitCode = code;
