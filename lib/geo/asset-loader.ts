import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MAX_ASSET_BYTES } from "./shard-format";

// Sync context lookup never starts Wrangler or contacts a public origin.
// Node prerendering has no Worker context and reads the same generated assets.
export async function readAssetBytes(name: string) {
  if (!/^[A-Za-z0-9-]+(?:\/[A-Za-z0-9-]+)*\.json$/.test(name))
    throw new Error("Invalid asset path");
  let context: ReturnType<typeof getCloudflareContext> | undefined;
  try {
    context = getCloudflareContext();
  } catch (error) {
    if (process.env.GEO_ASSET_TRANSPORT === "cloudflare") throw error;
  }
  if (context) {
    const assets = context.env.ASSETS;
    if (!assets) throw new Error("Missing ASSETS binding");
    const response: Response = await assets.fetch(
      new Request(`http://assets.local/_geo/${name}`, { redirect: "manual" }),
    );
    if (response.status !== 200 || !response.body) {
      await response.body?.cancel();
      throw new Error(`Geography asset response ${response.status}`);
    }
    if (Number(response.headers.get("content-length")) > MAX_ASSET_BYTES) {
      await response.body.cancel();
      throw new Error("Oversize geography asset");
    }
    const reader = response.body.getReader();
    let bytes = 0;
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_ASSET_BYTES)
          throw new Error("Oversize geography asset");
        chunks.push(value);
      }
      if (chunks.length === 1) return chunks[0];
      const buffer = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return buffer;
    } finally {
      await reader.cancel();
      reader.releaseLock();
    }
  }
  const path = join(process.cwd(), "public/_geo", name);
  if ((await stat(path)).size > MAX_ASSET_BYTES)
    throw new Error("Oversize geography asset");
  return readFile(path);
}

// Text consumers (build tools and diagnostics) retain the existing interface.
export async function readAsset(name: string) {
  return new TextDecoder("utf-8", { fatal: true }).decode(
    await readAssetBytes(name),
  );
}
