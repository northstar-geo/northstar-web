import { sitemapShard, sitemapEntries, SITEMAP_SIZE } from "@/lib/sitemap";
import { indexingEnabled } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!indexingEnabled() || !/^\d+\.xml$/.test(id))
    return new Response("Not found", { status: 404 });
  const n = Number(id.slice(0, -4));
  if (n >= Math.ceil(sitemapEntries().length / SITEMAP_SIZE))
    return new Response("Not found", { status: 404 });
  return new Response(sitemapShard(n), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
