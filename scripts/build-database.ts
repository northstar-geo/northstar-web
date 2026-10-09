import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { canonicalSnapshot as data } from "./canonical-snapshot";
const db = new DatabaseSync("data/geography.sqlite");
db.exec(readFileSync("data/migrations/001-geography.sql", "utf8"));
if (
  !db.prepare("SELECT version FROM schema_migrations WHERE version=2").get()
) {
  db.exec("BEGIN");
  try {
    db.exec(readFileSync("data/migrations/002-observation-bounds.sql", "utf8"));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    db.close();
    throw error;
  }
}
const snapshot = data();
db.exec("BEGIN");
try {
  const receipt = db.prepare(
    "INSERT OR IGNORE INTO data_imports VALUES (?,?,?)",
  );
  // Updating a source must not delete it while observations still reference it.
  const upsertSource = db.prepare(
    "INSERT INTO data_sources VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET url=excluded.url,license=excluded.license",
  );
  for (const s of snapshot.sources) {
    upsertSource.run(s.id, s.url, "US-GOVERNMENT-PUBLIC-DATA");
    receipt.run(s.sha256, s.fetchedAt, s.id);
  }
  db.exec(
    "DELETE FROM geographic_relationships; DELETE FROM observations; DELETE FROM postal_code_zcta_mapping; DELETE FROM postal_codes; DELETE FROM geographies; DELETE FROM data_vintages;",
  );
  const geo = db.prepare("INSERT INTO geographies VALUES (?,?,?,?,?,?,?,?)");
  const obs = db.prepare(
    "INSERT OR REPLACE INTO observations VALUES (?,?,?,?,?,?,?,?,?,?)",
  );
  const vintage = db.prepare(
    "INSERT OR IGNORE INTO data_vintages VALUES (?,?)",
  );
  for (const g of snapshot.geographies) {
    geo.run(
      g.id,
      g.kind,
      g.code,
      g.name,
      g.state ?? null,
      g.latitude,
      g.longitude,
      g.landSqMi,
    );
    for (const [key, value] of [
      ...Object.entries(g.metrics),
      ...g.populationHistory.map((v) => ["population", v] as const),
    ]) {
      if (!value) continue;
      obs.run(
        g.id,
        key,
        value.vintage,
        value.value,
        value.moe,
        value.source,
        value.variable,
        value.limitation ?? null,
        value.bound ?? null,
        value.rawValue ?? null,
      );
      vintage.run(value.source, value.vintage);
    }
  }
  const edge = db.prepare(
    "INSERT INTO geographic_relationships VALUES (?,?,?,?,?)",
  );
  for (const r of snapshot.relationships)
    edge.run(r.from, r.to, r.source, r.vintage, r.landOverlapSqM);
  if (db.prepare("PRAGMA foreign_key_check").all().length)
    throw new Error("Foreign key check failed");
  db.exec("COMMIT");
  console.log(
    JSON.stringify({
      integrity: db.prepare("PRAGMA integrity_check").get(),
      geographies: db
        .prepare("SELECT COUNT(*) AS count FROM geographies")
        .get(),
      observations: db
        .prepare("SELECT COUNT(*) AS count FROM observations")
        .get(),
    }),
  );
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
