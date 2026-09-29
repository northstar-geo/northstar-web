import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const root = fileURLToPath(new URL("../data/raw/", import.meta.url));
await mkdir(root, { recursive: true });
const gaz =
  "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2025_Gazetteer";
const rel = "https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520";
const files = [
  ...["state", "counties", "place", "zcta"].map((kind) => [
    `gaz-${kind}.zip`,
    `${gaz}/2025_Gaz_${kind}_national.zip`,
  ]),
  ...["county", "place"].map((kind) => [
    `relationship-${kind}.txt`,
    `${rel}/tab20_zcta520_${kind}20_natl.txt`,
  ]),
  ...["b01003", "b01002", "b19013", "b25077", "b25064"].map((table) => [
    `acs2024-${table}.dat`,
    `https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-${table}.dat`,
  ]),
  [
    "acs2023-b01003.dat",
    "https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b01003.dat",
  ],
];
for (const [name, url] of files) {
  const target = `${root}/${name}`;
  try {
    const saved = JSON.parse(await readFile(`${target}.json`, "utf8"));
    const b = await readFile(target);
    if (saved.sha256 === createHash("sha256").update(b).digest("hex")) {
      console.log(`cached ${name}`);
      continue;
    }
  } catch {}
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`fetch ${name} attempt ${attempt}`);
      let bytes;
      if (process.platform === "win32") {
        await promisify(execFile)(
          "powershell.exe",
          [
            "-NoProfile",
            "-Command",
            `$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing -Uri '${url}' -OutFile '${target.replaceAll("'", "''")}.partial' -TimeoutSec 180`,
          ],
          { windowsHide: true, timeout: 200000 },
        );
        bytes = await readFile(`${target}.partial`);
      } else {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(180000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        bytes = Buffer.from(await response.arrayBuffer());
      }
      if (
        bytes.length < 100 ||
        bytes.subarray(0, 200).toString().includes("<html")
      )
        throw new Error("Unexpected source format");
      await writeFile(`${target}.partial`, bytes);
      await rename(`${target}.partial`, target);
      await writeFile(
        `${target}.json`,
        JSON.stringify(
          {
            url,
            fetchedAt: new Date().toISOString(),
            bytes: bytes.length,
            sha256: createHash("sha256").update(bytes).digest("hex"),
          },
          null,
          2,
        ),
      );
      console.log(`saved ${name} ${bytes.length} bytes`);
      break;
    } catch (e) {
      console.error(`${name}: ${e.message}`);
      if (attempt === 3) process.exitCode = 1;
    }
  }
}
