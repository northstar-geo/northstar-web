import type { Metadata } from "next";
export function configuredSiteOrigin() {
  const value = process.env.SITE_URL?.trim();
  if (!value) return undefined;
  const url = new URL(value);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "SITE_URL must be an HTTP(S) origin without a path or credentials",
    );
  return url.origin;
}
export function siteOrigin() {
  const origin = configuredSiteOrigin();
  if (!origin) throw new Error("SITE_URL is required for public site output");
  if (!origin.startsWith("https://"))
    throw new Error("SITE_URL must use HTTPS for public site output");
  return origin;
}
export function indexingEnabled() {
  return process.env.INDEXING_ENABLED === "true" && !!configuredSiteOrigin()?.startsWith("https://");
}
export function pageMetadata(
  title: string,
  description: string,
  route: string,
  valuable = true,
): Metadata {
  const configuredOrigin = configuredSiteOrigin();
  return {
    title,
    description,
    alternates: { canonical: route },
    robots: { index: indexingEnabled() && valuable, follow: true },
    openGraph: {
      title: `${title} | Zipora`,
      description,
      url: route,
      type: "website",
      siteName: "Zipora",
      ...(configuredOrigin
        ? { images: [{ url: "/opengraph-image", width: 1200, height: 630 }] }
        : {}),
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
