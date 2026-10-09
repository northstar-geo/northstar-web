import { geographyByRoute, indexable } from "./repository";
import { indexingEnabled, jsonLd, pageMetadata, siteOrigin } from "../seo";

export function geographyJsonLd(
  breadcrumbs: Array<{ name: string; url: string }>,
) {
  if (!indexingEnabled()) return undefined;
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: `${siteOrigin()}${breadcrumb.url}`,
    })),
  });
}

export async function geographyMetadata(route: string) {
  const g = await geographyByRoute(route);
  return g
    ? pageMetadata(
        `${g.name} — population, income & housing`,
        `Explore ${g.name}${g.state ? `, ${g.state}` : ""}: Census population, income, rent, home values, related areas and transparent data sources.`,
        route,
        await indexable(g),
      )
    : pageMetadata(
        "Geography not found",
        "No matching geography in the imported dataset.",
        route,
        false,
      );
}
