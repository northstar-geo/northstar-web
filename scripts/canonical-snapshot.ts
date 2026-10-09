// Build/test only. Never import this module into app/, components/ or lib/.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import type { GeoSnapshot } from "../lib/geo/model";
export function canonicalSnapshot(): GeoSnapshot {
  return JSON.parse(
    gunzipSync(readFileSync("data/geography.json.gz")).toString(),
  );
}
