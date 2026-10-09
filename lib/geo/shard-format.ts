import type { Geography, GeographyKind, SourceReceipt } from "./model";

export const BUCKET_COUNT = 256;
export const MAX_ASSET_BYTES = 1024 * 1024;
export const SEARCH_PART_BYTES = 512 * 1024;
export const PAGE_SIZE = 30;
export type GeoLink = Pick<
  Geography,
  "id" | "kind" | "code" | "name" | "state" | "slug"
>;
export type SearchRow = [
  string,
  GeographyKind,
  string,
  string,
  string,
  string,
  number | null,
  number,
  number,
  boolean,
];
export type Detail = {
  geography: Geography;
  related: GeoLink[];
  indexable: boolean;
};
export type Descriptor = { bytes: number; sha256: string };
export type Manifest = {
  schemaVersion: 1;
  sourceSha256: string;
  importedAt: string;
  sources: SourceReceipt[];
  counts: Record<GeographyKind | "relationships", number>;
  states: Geography[];
  nation: Geography;
  searchParts: string[];
  statePages: Record<string, { count: number; pages: string[] }>;
  sitemapParts: string[];
  files: Record<string, Descriptor>;
};
// Stable FNV-1a partitioning: never use user-controlled paths as filenames.
export function bucket(key: string): string {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++)
    hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
  return ((hash >>> 0) % BUCKET_COUNT).toString(16).padStart(2, "0");
}
export function link(g: GeoLink): GeoLink {
  return {
    id: g.id,
    kind: g.kind,
    code: g.code,
    name: g.name,
    state: g.state,
    slug: g.slug,
  };
}
export function rowLink(r: SearchRow): GeoLink {
  return {
    id: r[0],
    kind: r[1],
    code: r[2],
    name: r[3],
    state: r[4] || undefined,
    slug: r[5],
  };
}
