import { asset, data } from "./geo/repository";
import { siteOrigin } from "./seo";
export const SITEMAP_SIZE = 10000;
export async function sitemapCount() {
  return (await data()).sitemapParts.length;
}
export function escapeXml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
export async function sitemapShard(id: number) {
  const manifest = await data();
  const paths = manifest.sitemapParts[id]
    ? await asset<string[]>(manifest.sitemapParts[id])
    : [];
  return (
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    paths
      .map(
        (p) =>
          `<url><loc>${escapeXml(siteOrigin() + p)}</loc><lastmod>${manifest.importedAt.slice(0, 10)}</lastmod></url>`,
      )
      .join("") +
    "</urlset>"
  );
}
