import { allIndexable, data } from "./geo/repository";
import { routeFor } from "./geo/model";
import { siteOrigin } from "./seo";
export const SITEMAP_SIZE = 10000;
export function sitemapEntries() {
  return [
    "/",
    "/about",
    "/methodology",
    "/data-sources",
    ...allIndexable().map(routeFor),
  ];
}
export function escapeXml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
export function sitemapShard(id: number) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    sitemapEntries()
      .slice(id * SITEMAP_SIZE, (id + 1) * SITEMAP_SIZE)
      .map(
        (p) =>
          `<url><loc>${escapeXml(siteOrigin() + p)}</loc><lastmod>${data().importedAt.slice(0, 10)}</lastmod></url>`,
      )
      .join("") +
    "</urlset>"
  );
}
