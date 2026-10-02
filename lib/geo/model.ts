export type GeographyKind = "nation" | "state" | "county" | "city" | "zcta";
export type MetricKey = "population" | "income" | "homeValue" | "rent" | "age";
export type Observation = {
  value: number | null;
  moe: number | null;
  source: string;
  vintage: number;
  variable: string;
  bound?: "at-least" | "less-than";
  rawValue?: string;
  limitation?: string;
};
export type Geography = {
  id: string;
  kind: GeographyKind;
  code: string;
  name: string;
  state?: string;
  slug: string;
  latitude: number;
  longitude: number;
  landSqMi: number;
  metrics: Partial<Record<MetricKey, Observation>>;
  populationHistory: Observation[];
};
export type Relationship = {
  from: string;
  to: string;
  landOverlapSqM: number;
  source: string;
  vintage: number;
};
// Postal delivery codes are not Census areas. No synthetic postal records are created.
export type PostalCode = {
  zip: string;
  source: string;
  vintage: string;
  deliveryStatus: "verified" | "unknown";
};
export type PostalMapping = {
  zip: string;
  zcta: string;
  source: string;
  method: string;
  confidence: "verified" | "approximate";
};
export type SourceReceipt = {
  id: string;
  url: string;
  sha256: string;
  fetchedAt: string;
  bytes: number;
};
export type GeoSnapshot = {
  schemaVersion: 1;
  importedAt: string;
  sources: SourceReceipt[];
  geographies: Geography[];
  relationships: Relationship[];
  postalCodes: PostalCode[];
  postalMappings: PostalMapping[];
};

export const metricDefinitions: Record<
  MetricKey,
  {
    label: string;
    table: string;
    unit: "number" | "currency" | "decimal";
    universe: string;
  }
> = {
  population: {
    label: "Population",
    table: "B01003",
    unit: "number",
    universe: "Total population",
  },
  income: {
    label: "Median household income",
    table: "B19013",
    unit: "currency",
    universe: "Households; 2024 inflation-adjusted dollars",
  },
  homeValue: {
    label: "Median home value",
    table: "B25077",
    unit: "currency",
    universe: "Owner-occupied housing units",
  },
  rent: {
    label: "Median gross rent",
    table: "B25064",
    unit: "currency",
    universe: "Renter-occupied units paying cash rent; monthly",
  },
  age: {
    label: "Median age",
    table: "B01002",
    unit: "decimal",
    universe: "Total population; years",
  },
};

export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function numericCell(value: string | undefined): number | null {
  if (
    value === undefined ||
    !value.trim() ||
    !/^\d+(\.\d+)?$/.test(value.trim())
  )
    return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
export function observation(
  value: string | undefined,
  moe: string | undefined,
  source: string,
  vintage: number,
  variable: string,
): Observation {
  const n = numericCell(value);
  // Census 2024 Jam Values: thresholds are table-specific, never population codes.
  const bounds: Record<string, [number, number, number, number]> = {
    B19013_001E: [2499, 2500, 250001, 250000],
    B25064_001E: [99, 100, 3501, 3500],
    B25077_001E: [9999, 10000, 2000001, 2000000],
    B01002_001E: [0, 1, 101, 100],
  };
  const limits = bounds[variable];
  const lower = limits && n === limits[0];
  const upper = limits && n === limits[2];
  return {
    value: lower ? limits[1] : upper ? limits[3] : n,
    moe: numericCell(moe),
    source,
    vintage,
    variable,
    ...(n === null
      ? { limitation: "Estimate unavailable or suppressed by Census." }
      : {}),
    ...(lower || upper
      ? {
          bound: upper ? ("at-least" as const) : ("less-than" as const),
          rawValue: value,
          limitation: `Census ${upper ? "top-coded" : "bottom-coded"} estimate; displayed value is a reporting threshold, not an exact median.`,
        }
      : {}),
  };
}
export function formatObservation(
  value: Observation | undefined,
  key: MetricKey,
): string {
  const prefix =
    value?.bound === "at-least"
      ? "≥ "
      : value?.bound === "less-than"
        ? "< "
        : "";
  return prefix + formatMetric(value?.value, key);
}
export function routeFor(g: Geography): string {
  if (g.kind === "nation") return "/";
  if (g.kind === "zcta") return `/zip/${g.code}`;
  if (g.kind === "state") return `/state/${g.state?.toLowerCase()}`;
  return `/${g.kind}/${g.state?.toLowerCase()}/${g.slug}`;
}
export function hasDataValue(g: Geography): boolean {
  return (
    g.kind !== "nation" &&
    !!g.id &&
    g.landSqMi > 0 &&
    (g.metrics.population?.value ?? 0) > 0 &&
    Object.values(g.metrics).filter(
      (m) => m.value !== null && m.source && m.vintage,
    ).length >= 3
  );
}
export function distanceMiles(
  a: Pick<Geography, "latitude" | "longitude">,
  b: Pick<Geography, "latitude" | "longitude">,
): number {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.latitude - a.latitude) * rad) / 2) ** 2 +
    Math.cos(a.latitude * rad) *
      Math.cos(b.latitude * rad) *
      Math.sin(((b.longitude - a.longitude) * rad) / 2) ** 2;
  return 3958.7613 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
export function formatMetric(
  value: number | null | undefined,
  key: MetricKey,
): string {
  if (value === undefined || value === null) return "Not available";
  const unit = metricDefinitions[key].unit;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: unit === "decimal" ? 1 : 0,
    ...(unit === "currency" ? { style: "currency", currency: "USD" } : {}),
  }).format(value);
}
