// Real Wrangler + generated OpenNext + static-assets routing. No network mocks.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// Do not inherit account credentials or personal dotenv files into local tests.
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
const assetRoot = path.resolve(".open-next/assets");
const files = readdirSync(assetRoot, { recursive: true }).map(String);
const js = files.find(
  (p) =>
    p.replaceAll("\\", "/").startsWith("_next/static/") && p.endsWith(".js"),
);
const css = files.find((p) => p.endsWith(".css"));
const manifest = JSON.parse(
  readFileSync(path.join(assetRoot, "_geo/manifest.json"), "utf8"),
);
const shard =
  Object.keys(manifest.files).find((name) => name.startsWith("detail/")) ??
  Object.keys(manifest.files)[0];
assert.ok(js && css, "Built JS and CSS fixtures must exist");
assert.ok(shard, "A real registered geography shard must exist");
const routes = [
  "/",
  "/search?q=00601",
  "/icon.svg",
  "/opengraph-image",
  "/_geo/manifest.json",
  `/_geo/${shard}`,
  ...[js, css].map((p) => `/${p.replaceAll("\\", "/")}`),
];
const buildId = "b".repeat(64);
let checks = 0;
const checkHeaders = (response) => {
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(
    response.headers.get("x-robots-tag"),
    "noindex, nofollow, noarchive",
  );
  assert.equal(response.headers.get("x-okelom-build-id"), buildId);
};
async function start(secret, entry = config.main) {
  return unstable_dev(entry, {
    config: "wrangler.jsonc",
    ip: "127.0.0.1",
    port: 0,
    inspectorPort: 0,
    local: true,
    persist: false,
    logLevel: "error",
    vars: {
      ...(secret === undefined ? {} : { PREVIEW_AUTH_PASSWORD: secret }),
      PREVIEW_BUILD_ID: buildId,
    },
    experimental: {
      forceLocal: true,
      disableExperimentalWarning: true,
      disableDevRegistry: true,
      watch: false,
      showInteractiveDevSession: false,
    },
  });
}
async function request(server, route, authorization, method = "GET") {
  return fetch(`http://127.0.0.1:${server.port}${route}`, {
    method,
    redirect: "manual",
    headers: authorization ? { authorization } : {},
  });
}
for (const configured of [false, true]) {
  // Disposable local-only random credential: never persisted, printed or used remotely.
  const secret = configured ? randomBytes(32).toString("hex") : undefined;
  const server = await start(secret);
  try {
    for (const route of [
      ...routes,
      "/fonts/not-present.woff2",
      "/missing-route",
      "/_next/image?url=%2Ficon.svg&w=64&q=75",
    ]) {
      const response = await request(server, route);
      assert.equal(
        response.status,
        configured ? 401 : 503,
        `Unauthenticated ${route}`,
      );
      checkHeaders(response);
      assert.equal(
        await response.text(),
        configured ? "Unauthorized" : "Service Unavailable",
      );
      if (configured)
        assert.equal(
          response.headers.get("www-authenticate"),
          'Basic realm="OKELOM Preview"',
        );
      checks++;
    }
    if (configured) {
      const credential = (value) =>
        `Basic ${Buffer.from(value).toString("base64")}`;
      for (const invalid of [
        credential("founder:wrong"),
        credential(`other:${secret}`),
        "Bearer ignored",
        "Basic !!!",
        credential("founder"),
        `${credential(`founder:${secret}`)}, Basic ignored`,
      ]) {
        const response = await request(server, "/", invalid);
        assert.equal(response.status, 401, "Bad or malformed credential");
        checkHeaders(response);
        await response.arrayBuffer();
        checks++;
      }
      for (const route of routes) {
        const response = await request(
          server,
          route,
          credential(`founder:${secret}`),
        );
        assert.equal(response.status, 200, `Authorized ${route}`);
        checkHeaders(response);
        const bytes = new Uint8Array(await response.arrayBuffer());
        assert.ok(bytes.byteLength > 0, `Actual content returned for ${route}`);
        const body = new TextDecoder().decode(bytes);
        assert.ok(
          !body.includes(secret),
          "Credential must not appear in response",
        );
        if (route === "/") assert.match(body, /OKELOM/);
        if (route === "/search?q=00601") assert.match(body, /00601/);
        if (route === "/_geo/manifest.json")
          assert.equal(
            JSON.parse(body).sourceSha256,
            "2e100f671f3a84997b30627ababbfc94e049f7c2d2cf8d328c42c6006a2778c5",
          );
        checks++;
      }
      for (const method of ["HEAD", "OPTIONS", "POST"]) {
        const response = await request(
          server,
          "/_geo/manifest.json",
          undefined,
          method,
        );
        assert.equal(
          response.status,
          401,
          `Method ${method} cannot bypass authentication`,
        );
        checkHeaders(response);
        await response.arrayBuffer();
        checks++;
      }
      const after = await request(server, "/_geo/manifest.json");
      assert.equal(
        after.status,
        401,
        "Authorized fetch must not prime a public cache",
      );
      checkHeaders(after);
      await after.arrayBuffer();
      checks++;
    }
  } finally {
    await server.stop();
  }
}
// Verify workerd's process.env exposure, not a Node mock: platform compatibility
// flags must keep the secret out of globally populated environment variables.
{
  const secret = randomBytes(32).toString("hex");
  const server = await start(
    secret,
    "tests/fixtures/preview-auth-env-worker.ts",
  );
  try {
    const response = await request(
      server,
      "/",
      `Basic ${Buffer.from(`founder:${secret}`).toString("base64")}`,
    );
    const result = await response.json();
    assert.equal(result.applicationStatus, 200);
    assert.equal(
      result.runtimeSecretVisible,
      false,
      "OpenNext must never receive the secret via process.env",
    );
    assert.equal(
      result.runtimeBuildIdVisible,
      false,
      "OpenNext must never receive the diagnostic build id via process.env",
    );
    assert.equal(
      result.previewStage,
      "preview",
      "Sanitized application variables must still be populated",
    );
    checks++;
  } finally {
    await server.stop();
  }
}
console.log(
  JSON.stringify({
    checks,
    result: "PASS",
    scope: "LOCAL_WRANGLER_REAL_ROUTING",
    remoteDeployment: false,
  }),
);
