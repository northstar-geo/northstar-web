import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import { distanceMiles, hasDataValue, routeFor } from "./model";
import type {
  Geography,
  GeoSnapshot,
  GeographyKind,
  Relationship,
} from "./model";

let snapshot: GeoSnapshot | undefined;
let byId: Map<string, Geography>;
let byRoute: Map<string, Geography>;
let edges: Map<string, Relationship[]>;
export function data(): GeoSnapshot {
  if (!snapshot) {
    snapshot = JSON.parse(
      gunzipSync(
        readFileSync(path.join(process.cwd(), "data/geography.json.gz")),
      ).toString(),
    ) as GeoSnapshot;
    if (snapshot.schemaVersion !== 1)
      throw new Error("Unsupported geography snapshot");
    byId = new Map(snapshot.geographies.map((g) => [g.id, g]));
    byRoute = new Map(snapshot.geographies.map((g) => [routeFor(g), g]));
    edges = new Map();
    for (const edge of snapshot.relationships) {
      for (const id of [edge.from, edge.to]) {
        const list = edges.get(id) ?? [];
        list.push(edge);
        edges.set(id, list);
      }
    }
  }
  return snapshot;
}
export function geography(id: string) {
  data();
  return byId.get(id);
}
export function geographyByRoute(route: string) {
  data();
  return byRoute.get(route);
}
export function related(g: Geography, kind?: GeographyKind): Geography[] {
  data();
  if (g.kind === "state")
    return snapshot!.geographies.filter(
      (v) =>
        v.state === g.state && v.kind !== "state" && (!kind || v.kind === kind),
    );
  return [
    ...new Set(
      (edges.get(g.id) ?? [])
        .sort((a, b) => b.landOverlapSqM - a.landOverlapSqM)
        .map((e) => (e.from === g.id ? e.to : e.from)),
    ),
  ]
    .map((id) => byId.get(id)!)
    .filter((v) => v && (!kind || v.kind === kind));
}
export function stateFor(g: Geography) {
  return data().geographies.find(
    (v) => v.kind === "state" && v.state === g.state,
  );
}
export function nearby(g: Geography, limit = 6) {
  return data()
    .geographies.filter((v) => v.kind === "zcta" && v.id !== g.id)
    .map((v) => ({ geography: v, distance: distanceMiles(g, v) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
export function search(query: string, page = 1, kind?: string) {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 100);
  if (!q) return { results: [] as Geography[], total: 0, page: 1, pages: 0 };
  const tokens = q.split(/[ ,]+/).filter(Boolean);
  const stateNames = new Map(
    data()
      .geographies.filter((g) => g.kind === "state")
      .map((g) => [g.state!.toLowerCase(), g.name.toLowerCase()]),
  );
  // Only a standalone or trailing state abbreviation is a structured filter.
  // Name words such as "La" in "La Mesa CA" must remain ordinary name tokens.
  const trailingState = stateNames.has(tokens.at(-1)!)
    ? tokens.at(-1)
    : undefined;
  const nameTokens = trailingState ? tokens.slice(0, -1) : tokens;
  const found = data().geographies.filter(
    (g) =>
      g.kind !== "nation" &&
      (!kind || g.kind === kind) &&
      (!trailingState || g.state?.toLowerCase() === trailingState) &&
      nameTokens.every((t) =>
        `${g.name} ${g.code} ${stateNames.get(g.state?.toLowerCase() ?? "") ?? ""}`
          .toLowerCase()
          .includes(t),
      ),
  );
  found.sort(
    (a, b) =>
      Number(b.kind === "zcta" && b.code === q) -
        Number(a.kind === "zcta" && a.code === q) ||
      Number(b.code === q) - Number(a.code === q) ||
      Number(b.name.toLowerCase() === q) - Number(a.name.toLowerCase() === q) ||
      (b.metrics.population?.value ?? 0) - (a.metrics.population?.value ?? 0) ||
      a.id.localeCompare(b.id),
  );
  const pages = Math.ceil(found.length / 30);
  const current = Math.max(
    1,
    Math.min(Number.isFinite(page) ? Math.floor(page) : 1, pages || 1),
  );
  return {
    results: found.slice((current - 1) * 30, current * 30),
    total: found.length,
    page: current,
    pages,
  };
}
export function indexable(g: Geography) {
  return (
    hasDataValue(g) && !!g.state && (g.kind !== "zcta" || related(g).length > 0)
  );
}
export function allIndexable() {
  return data().geographies.filter(indexable);
}
