import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { protectedPreview } from "../lib/preview-auth";

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
    { PREVIEW_AUTH_PASSWORD: secret, ASSETS: "binding" },
    async (incoming, env) => {
      assert.ok(
        incoming.headers.get("authorization") === null,
        "Authorization must be removed",
      );
      assert.equal("PREVIEW_AUTH_PASSWORD" in env, false);
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
