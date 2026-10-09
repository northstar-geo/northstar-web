import { distanceMiles, type Geography } from "./model";
import {
  bucket,
  rowLink,
  MAX_ASSET_BYTES,
  PAGE_SIZE,
  type Detail,
  type GeoLink,
  type Manifest,
  type SearchRow,
} from "./shard-format";

export type AssetReader = (
  name: string,
) => Promise<string | Uint8Array<ArrayBuffer>>;
export function createRepository(read: AssetReader) {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const encoder = new TextEncoder();
  // Only the bounded manifest survives a request. Never cache shards or indexes.
  let manifestPromise: Promise<Manifest> | undefined;
  async function data(): Promise<Manifest> {
    if (!manifestPromise)
      manifestPromise = (async () => {
        const raw = await read("manifest.json");
        const bytes = typeof raw === "string" ? encoder.encode(raw) : raw;
        if (bytes.byteLength > 256 * 1024) throw new Error("Oversize manifest");
        const m = JSON.parse(
          typeof raw === "string" ? raw : decoder.decode(bytes),
        ) as Manifest;
        if (m.schemaVersion !== 1 || !m.files || !m.states || !m.searchParts)
          throw new Error("Invalid geography manifest");
        return m;
      })().catch((error) => {
        manifestPromise = undefined;
        throw error;
      });
    return manifestPromise;
  }
  async function asset<T>(name: string): Promise<T> {
    const descriptor = (await data()).files[name];
    if (!descriptor || descriptor.bytes > MAX_ASSET_BYTES)
      throw new Error("Unregistered geography asset");
    const raw = await read(name),
      bytes = typeof raw === "string" ? encoder.encode(raw) : raw;
    if (bytes.length !== descriptor.bytes)
      throw new Error("Geography asset size mismatch");
    const digest = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (b) => b.toString(16).padStart(2, "0"),
    ).join("");
    if (digest !== descriptor.sha256)
      throw new Error("Geography asset digest mismatch");
    return JSON.parse(
      typeof raw === "string" ? raw : decoder.decode(bytes),
    ) as T;
  }
  async function detail(id: string) {
    if (!/^(zcta|city|county|state|nation):[A-Za-z0-9-]+$/.test(id))
      return undefined;
    const name = `detail/${bucket(id)}.json`;
    if (!(await data()).files[name]) return undefined;
    return (await asset<Record<string, Detail>>(name))[id];
  }
  async function geography(id: string) {
    return (await detail(id))?.geography;
  }
  async function geographyByRoute(route: string) {
    if (route.length > 200 || !/^\/[a-z0-9/-]*$/.test(route)) return undefined;
    const name = `route/${bucket(route)}.json`;
    if (!(await data()).files[name]) return undefined;
    const id = (await asset<Record<string, string>>(name))[route];
    return id ? geography(id) : undefined;
  }
  async function relatedPage(g: Geography, page = 1) {
    const m = await data();
    if (g.kind === "state") {
      const group = m.statePages[g.id],
        total = group?.count ?? 0,
        pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const current = Math.max(
          1,
          Math.min(Number.isFinite(page) ? Math.floor(page) : 1, pages),
        ),
        start = (current - 1) * PAGE_SIZE;
      const entries = total
        ? await asset<GeoLink[]>(group.pages[Math.floor(start / 300)])
        : [];
      return {
        results: entries.slice(start % 300, (start % 300) + PAGE_SIZE),
        total,
        pages,
        page: current,
      };
    }
    const entries = (await detail(g.id))?.related ?? [],
      pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
    const current = Math.max(
      1,
      Math.min(Number.isFinite(page) ? Math.floor(page) : 1, pages),
    );
    return {
      results: entries.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
      total: entries.length,
      pages,
      page: current,
    };
  }
  async function stateFor(g: Geography) {
    return (await data()).states.find((s) => s.state === g.state);
  }
  async function indexable(g: Geography) {
    return (await detail(g.id))?.indexable ?? false;
  }
  async function search(query: string, page = 1, kind?: string) {
    const q = query.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 100);
    const empty = {
      results: [] as Array<GeoLink & { population: number | null }>,
      total: 0,
      pages: 0,
      page: 1,
    };
    if (!q) return empty;
    const m = await data(),
      states = new Map(
        m.states.map((g) => [g.state!.toLowerCase(), g.name.toLowerCase()]),
      );
    const tokens = q.split(/[ ,]+/).filter(Boolean),
      state = states.has(tokens.at(-1)!) ? tokens.at(-1) : undefined;
    const names = state ? tokens.slice(0, -1) : tokens;
    function rank(r: SearchRow) {
      if ((kind && r[1] !== kind) || (state && r[4].toLowerCase() !== state))
        return -1;
      const text =
        `${r[3]} ${r[2]} ${states.get(r[4].toLowerCase()) ?? ""}`.toLowerCase();
      if (!names.every((t) => text.includes(t))) return -1;
      return (
        Number(r[1] === "zcta" && r[2] === q) * 4 +
        Number(r[2] === q) * 2 +
        Number(r[3].toLowerCase() === q)
      );
    }
    const counts = Array<number>(8).fill(0);
    for (const name of m.searchParts)
      for (const row of await asset<SearchRow[]>(name)) {
        const r = rank(row);
        if (r >= 0) counts[r]++;
      }
    const total = counts.reduce((a, b) => a + b, 0);
    if (!total) return empty;
    const pages = Math.ceil(total / PAGE_SIZE),
      current = Math.max(
        1,
        Math.min(Number.isFinite(page) ? Math.floor(page) : 1, pages),
      );
    const offsets = Array<number>(8).fill(0);
    for (let r = 6; r >= 0; r--) offsets[r] = offsets[r + 1] + counts[r + 1];
    const start = (current - 1) * PAGE_SIZE,
      selected: Array<{ position: number; row: SearchRow }> = [];
    for (const name of m.searchParts)
      for (const row of await asset<SearchRow[]>(name)) {
        const r = rank(row);
        if (r < 0) continue;
        const position = offsets[r]++;
        if (position >= start && position < start + PAGE_SIZE)
          selected.push({ position, row });
      }
    return {
      results: selected
        .sort((a, b) => a.position - b.position)
        .map(({ row }) => ({ ...rowLink(row), population: row[6] })),
      total,
      pages,
      page: current,
    };
  }
  async function nearby(g: Geography, limit = 6) {
    const count = Math.max(
      0,
      Math.min(Number.isFinite(limit) ? Math.floor(limit) : 6, 30),
    );
    if (!count) return [];
    const best: Array<{
      geography: GeoLink & { latitude: number; longitude: number };
      distance: number;
    }> = [];
    // Scan coordinates without allocating a display object for every rejected
    // candidate. Only the bounded winners receive their own immutable copy.
    const point = { latitude: 0, longitude: 0 };
    for (const name of (await data()).searchParts)
      for (const row of await asset<SearchRow[]>(name)) {
        if (row[1] !== "zcta" || row[0] === g.id) continue;
        point.latitude = row[7];
        point.longitude = row[8];
        const distance = distanceMiles(g, point);
        if (best.length < count || distance < best[best.length - 1].distance) {
          best.push({ geography: { ...rowLink(row), ...point }, distance });
          best.sort((a, b) => a.distance - b.distance);
          if (best.length > count) best.pop();
        }
      }
    return best;
  }
  return {
    data,
    geography,
    geographyByRoute,
    relatedPage,
    stateFor,
    indexable,
    search,
    nearby,
    asset,
  };
}
