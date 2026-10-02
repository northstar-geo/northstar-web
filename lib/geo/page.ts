import { geographyByRoute, indexable } from "./repository";
import { pageMetadata } from "../seo";
export function geographyMetadata(route: string) {
  const g = geographyByRoute(route);
  return g
    ? pageMetadata(
        `${g.name} — population, income & housing`,
        `Explore ${g.name}${g.state ? `, ${g.state}` : ""}: Census population, income, rent, home values, related areas and transparent data sources.`,
        route,
        indexable(g),
      )
    : pageMetadata(
        "Geography not found",
        "No matching geography in the imported dataset.",
        route,
        false,
      );
}
