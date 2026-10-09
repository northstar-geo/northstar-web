import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { MAX_ASSET_BYTES } from "./shard-format";
// Node build/local transport; the Cloudflare build replaces only this transport.
export async function readAsset(name: string) {
  if (!/^[A-Za-z0-9/-]+\.json$/.test(name) || name.includes(".."))
    throw new Error("Invalid asset path");
  const path = join(process.cwd(), "public/_geo", name);
  if ((await stat(path)).size > MAX_ASSET_BYTES)
    throw new Error("Oversize geography asset");
  return readFile(path, "utf8");
}
