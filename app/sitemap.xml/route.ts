import { sitemapCount, escapeXml } from "@/lib/sitemap";
import { indexingEnabled, siteOrigin } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function GET() {
  const count = indexingEnabled() ? await sitemapCount() : 0;
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    Array.from(
      { length: count },
      (_, i) =>
        `<sitemap><loc>${escapeXml(siteOrigin())}/sitemaps/${i}.xml</loc></sitemap>`,
    ).join("") +
    "</sitemapindex>";
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
