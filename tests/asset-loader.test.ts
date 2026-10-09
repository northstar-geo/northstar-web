import test from "node:test";
import assert from "node:assert/strict";
import { readAsset } from "../lib/geo/asset-loader";
import { MAX_ASSET_BYTES } from "../lib/geo/shard-format";

// Emulate only OpenNext's runtime boundary; exercise the real loader and streams.
const contextKey = Symbol.for("__cloudflare-context__");
const globals = globalThis as unknown as Record<symbol, unknown>;
async function inWorker(
  fetchAsset: ((request: Request) => Promise<Response>) | undefined,
  action: () => Promise<void>,
) {
  const previous = globals[contextKey];
  globals[contextKey] = {
    env: { ASSETS: fetchAsset && { fetch: fetchAsset } },
  };
  try {
    await action();
  } finally {
    if (previous === undefined) delete globals[contextKey];
    else globals[contextKey] = previous;
  }
}

test("Worker reads the internal asset binding instead of the local manifest", async () => {
  await inWorker(
    async (request) => {
      assert.equal(request.url, "http://assets.local/_geo/manifest.json");
      assert.equal(request.redirect, "manual");
      return Response.json({ source: "internal-binding" });
    },
    async () => {
      assert.deepEqual(JSON.parse(await readAsset("manifest.json")), {
        source: "internal-binding",
      });
    },
  );
});

test("Worker missing ASSETS fails instead of using the Node filesystem", async () => {
  await inWorker(undefined, async () => {
    await assert.rejects(readAsset("manifest.json"), /Missing ASSETS binding/);
  });
});

test("Worker asset errors never fall back to the local manifest", async () => {
  for (const status of [302, 404, 500]) {
    await inWorker(
      async () => new Response(null, { status }),
      async () => {
        await assert.rejects(
          readAsset("manifest.json"),
          /Geography asset response/,
        );
      },
    );
  }
});

test("Worker enforces the byte limit even without a truthful content length", async () => {
  for (const length of [undefined, "1"]) {
    let cancelled = false;
    let chunks = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        chunks++;
        controller.enqueue(new Uint8Array(MAX_ASSET_BYTES / 2));
      },
      cancel() {
        cancelled = true;
      },
    });
    await inWorker(
      async () =>
        new Response(stream, {
          headers: length ? { "content-length": length } : undefined,
        }),
      async () => {
        await assert.rejects(
          readAsset("manifest.json"),
          /Oversize geography asset/,
        );
        assert.equal(cancelled, true);
        assert.ok(
          chunks <= 4,
          "stop consuming at the bound, not after buffering all data",
        );
      },
    );
  }
});

test("Worker rejects a declared oversize body before reading it", async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    cancel() {
      cancelled = true;
    },
  });
  await inWorker(
    async () =>
      new Response(stream, {
        headers: { "content-length": String(MAX_ASSET_BYTES + 1) },
      }),
    async () => {
      await assert.rejects(
        readAsset("manifest.json"),
        /Oversize geography asset/,
      );
      assert.equal(cancelled, true);
    },
  );
});

test("asset transport rejects paths outside generated relative JSON assets", async () => {
  for (const name of [
    "../manifest.json",
    "/manifest.json",
    "https://evil.test/x.json",
    "details//00.json",
    "manifest.json?x=1",
  ]) {
    await assert.rejects(readAsset(name), /Invalid asset path/);
  }
});
