import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import {
  PreviewRuntimeFailure,
  protectedPreview,
} from "../lib/preview-auth";
import { createProtectedWorker } from "../lib/preview-worker";

const secret = randomBytes(32).toString("hex");
const basic = (value: string) =>
  `Basic ${Buffer.from(value).toString("base64")}`;
const request = (authorization?: string) =>
  new Request("https://preview.invalid/", {
    headers: authorization ? { authorization } : {},
  });
const never = async () => {
  assert.fail("Rejected requests must never enter the application or assets");
};
function protectedHeaders(response: Response) {
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(
    response.headers.get("x-robots-tag"),
    "noindex, nofollow, noarchive",
  );
}

const buildId = "a".repeat(64);

test("missing or blank preview secret denies even a supplied credential before forwarding", async () => {
  for (const value of [undefined, "", " "]) {
    const response = await protectedPreview(
      request(basic(`founder:${secret}`)),
      { PREVIEW_AUTH_PASSWORD: value },
      never,
    );
    assert.equal(response.status, 503);
    assert.equal(await response.text(), "Service Unavailable");
    protectedHeaders(response);
  }
});

test("invalid credentials deny without forwarding and never reflect input", async () => {
  for (const value of [
    undefined,
    "Basic !!!",
    "Basic Zg==",
    "Bearer ignored",
    basic("founder:wrong"),
    basic(`wrong:${secret}`),
    `${basic(`founder:${secret}`)}, Basic bad`,
    "Basic " + "a".repeat(9000),
  ]) {
    const response = await protectedPreview(
      request(value),
      { PREVIEW_AUTH_PASSWORD: secret },
      never,
    );
    assert.equal(response.status, 401);
    assert.equal(await response.text(), "Unauthorized");
    assert.equal(
      response.headers.get("www-authenticate"),
      'Basic realm="OKELOM Preview"',
    );
    protectedHeaders(response);
  }
});

test("correct credentials forward the request without credentials or secret and protect returned headers", async () => {
  const response = await protectedPreview(
    request(basic(`founder:${secret}`)),
    {
      PREVIEW_AUTH_PASSWORD: secret,
      PREVIEW_BUILD_ID: buildId,
      ASSETS: "binding",
    },
    async (incoming, env) => {
      assert.ok(
        incoming.headers.get("authorization") === null,
        "Authorization must be removed",
      );
      assert.equal("PREVIEW_AUTH_PASSWORD" in env, false);
      assert.equal("PREVIEW_BUILD_ID" in env, false);
      assert.equal(env.ASSETS, "binding");
      return new Response("application content", {
        headers: {
          "cache-control": "public, max-age=1000",
          "x-robots-tag": "index",
          "cdn-cache-control": "public",
          "cloudflare-cdn-cache-control": "public",
        },
      });
    },
  );
  assert.equal(await response.text(), "application content");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-okelom-build-id"), buildId);
  protectedHeaders(response);
  assert.equal(response.headers.get("cdn-cache-control"), "no-store");
  assert.equal(
    response.headers.get("cloudflare-cdn-cache-control"),
    "no-store",
  );
});

test("stage and false flags cannot turn this diagnostic wrapper into public production", async () => {
  for (const stage of [undefined, "preview", "production", "misspelled"]) {
    const response = await protectedPreview(
      request(),
      {
        PREVIEW_AUTH_PASSWORD: secret,
        RELEASE_STAGE: stage,
        PREVIEW_AUTH_REQUIRED: "false",
        INDEXING_ENABLED: "true",
      },
      never,
    );
    assert.equal(response.status, 401);
    protectedHeaders(response);
  }
});

test("downstream failures produce a generic protected response without leaking error details", async () => {
  const response = await protectedPreview(
    request(basic(`founder:${secret}`)),
    { PREVIEW_AUTH_PASSWORD: secret },
    async () => {
      throw new Error("Internal diagnostic must stay private");
    },
  );
  assert.equal(response.status, 500);
  assert.equal(await response.text(), "Internal Server Error");
  protectedHeaders(response);
});

test("safe runtime failure phases and a valid content-derived build id are observable without details", async () => {
  for (const phase of [
    "auth-runtime",
    "application-import",
    "application-fetch",
  ] as const) {
    const response = await protectedPreview(
      request(basic(`founder:${secret}`)),
      { PREVIEW_AUTH_PASSWORD: secret, PREVIEW_BUILD_ID: buildId },
      async () => {
        throw new PreviewRuntimeFailure(phase);
      },
    );
    assert.equal(response.status, 500);
    assert.equal(await response.text(), "Internal Server Error");
    assert.equal(response.headers.get("x-okelom-diagnostic-phase"), phase);
    assert.equal(response.headers.get("x-okelom-build-id"), buildId);
    assert.equal(response.headers.get("authorization"), null);
    protectedHeaders(response);
  }
});

test("Web Crypto and timing-safe comparison failures map to auth-runtime", async () => {
  for (const authRuntime of [
    {
      digest: async () => {
        throw new Error("private digest failure");
      },
      timingSafeEqual: async () => true,
    },
    {
      digest: async () => new ArrayBuffer(32),
      timingSafeEqual: async () => {
        throw new Error("private comparison failure");
      },
    },
  ]) {
    const response = await protectedPreview(
      request(basic(`founder:${secret}`)),
      { PREVIEW_AUTH_PASSWORD: secret, PREVIEW_BUILD_ID: buildId },
      async () => new Response("must not forward"),
      { authRuntime },
    );
    assert.equal(response.status, 500);
    assert.equal(await response.text(), "Internal Server Error");
    assert.equal(
      response.headers.get("x-okelom-diagnostic-phase"),
      "auth-runtime",
    );
    protectedHeaders(response);
  }
});

test("invalid build ids are omitted rather than reflected", async () => {
  const response = await protectedPreview(
    request(),
    {
      PREVIEW_AUTH_PASSWORD: secret,
      PREVIEW_BUILD_ID: "not-a-content-digest\r\nx-leak: value",
    },
    never,
  );
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("x-okelom-build-id"), null);
  protectedHeaders(response);
});

test("application module loading is deferred until after authentication", async () => {
  let loads = 0;
  const worker = createProtectedWorker(async () => {
    loads++;
    return { fetch: async () => new Response("application") };
  });
  const response = await worker.fetch(
    request(),
    { PREVIEW_AUTH_PASSWORD: secret, PREVIEW_BUILD_ID: buildId },
    {},
  );
  assert.equal(response.status, 401);
  assert.equal(loads, 0);
  assert.equal(response.headers.get("x-okelom-build-id"), buildId);
});

test("application import and fetch failures expose only fixed diagnostic phases", async () => {
  const importFailure = createProtectedWorker(async () => {
    throw new Error("private import detail");
  });
  const importResponse = await importFailure.fetch(
    request(basic(`founder:${secret}`)),
    { PREVIEW_AUTH_PASSWORD: secret, PREVIEW_BUILD_ID: buildId },
    {},
  );
  assert.equal(importResponse.status, 500);
  assert.equal(
    importResponse.headers.get("x-okelom-diagnostic-phase"),
    "application-import",
  );
  assert.equal(await importResponse.text(), "Internal Server Error");

  const fetchFailure = createProtectedWorker(async () => ({
    fetch: async () => {
      throw new Error("private fetch detail");
    },
  }));
  const fetchResponse = await fetchFailure.fetch(
    request(basic(`founder:${secret}`)),
    { PREVIEW_AUTH_PASSWORD: secret, PREVIEW_BUILD_ID: buildId },
    {},
  );
  assert.equal(fetchResponse.status, 500);
  assert.equal(
    fetchResponse.headers.get("x-okelom-diagnostic-phase"),
    "application-fetch",
  );
  assert.equal(await fetchResponse.text(), "Internal Server Error");

  const returnedFailure = createProtectedWorker(async () => ({
    fetch: async () =>
      new Response("private returned failure", {
        status: 503,
        headers: {
          "X-Okelom-Diagnostic-Phase": "forged-phase",
          "X-Okelom-Build-Id": "c".repeat(64),
        },
      }),
  }));
  const returnedResponse = await returnedFailure.fetch(
    request(basic(`founder:${secret}`)),
    { PREVIEW_AUTH_PASSWORD: secret, PREVIEW_BUILD_ID: buildId },
    {},
  );
  assert.equal(returnedResponse.status, 500);
  assert.equal(await returnedResponse.text(), "Internal Server Error");
  assert.equal(
    returnedResponse.headers.get("x-okelom-diagnostic-phase"),
    "application-fetch",
  );
  assert.equal(returnedResponse.headers.get("x-okelom-build-id"), buildId);
});
