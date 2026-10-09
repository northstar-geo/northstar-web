import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import { search } from "@/lib/geo/repository";
import { formatMetric, routeFor } from "@/lib/geo/model";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Explore places",
  "Search Census ZIP areas, cities, counties and states.",
  "/search",
  false,
);
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const query = (typeof p.q === "string" ? p.q : "").slice(0, 100);
  const kind =
    typeof p.kind === "string" &&
    ["zcta", "city", "county", "state"].includes(p.kind)
      ? p.kind
      : "";
  const result = await search(query, Number(p.page || 1), kind);
  const url = (page: number, type = kind) =>
    `/search?${new URLSearchParams({ q: query, page: String(page), ...(type ? { kind: type } : {}) })}`;
  return (
    <div className="wrap page">
      <div className="page-heading">
        <p className="eyebrow">FIND YOUR PERSPECTIVE</p>
        <h1>Explore a place.</h1>
        <p>
          Search a five-digit code, city, county or state. Census area coverage;
          not postal address validation.
        </p>
      </div>
      <SearchForm query={query} />
      <nav className="filter-row" aria-label="Geography filters">
        {[
          ["", "All places"],
          ["zcta", "ZIP areas"],
          ["city", "Cities"],
          ["county", "Counties"],
          ["state", "States"],
        ].map(([type, label]) => (
          <Link
            key={type}
            href={url(1, type)}
            aria-current={kind === type ? "page" : undefined}
          >
            {label}
            {kind === type ? " •" : ""}
          </Link>
        ))}
      </nav>
      {!query.trim() ? (
        <div className="empty">
          <h2>Your next discovery starts here.</h2>
          <p>Try 10001, Austin TX, or Los Angeles County.</p>
          <Link href="/#states" className="source-link">
            Browse all states →
          </Link>
        </div>
      ) : !result.total ? (
        <div className="empty">
          <h2>No matching geography</h2>
          <p>
            Try a city, state abbreviation or five-digit code. A missing ZCTA
            does not mean a ZIP code is invalid. Street addresses and USPS-only
            codes are not covered.
          </p>
        </div>
      ) : (
        <>
          <p className="small">
            {result.total.toLocaleString("en-US")} results for “{query}”
          </p>
          <div className="result-list">
            {result.results.map((g) => (
              <Link className="result" key={g.id} href={routeFor(g)}>
                <div>
                  <span className="badge">
                    {g.kind === "zcta"
                      ? "Census ZIP area · not delivery verification"
                      : g.kind}{" "}
                    · {g.state}
                  </span>
                  <h2>{g.name}</h2>
                  <p>
                    Population {formatMetric(g.population, "population")} · ACS
                    2020–2024
                  </p>
                </div>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
          <nav className="pager" aria-label="Search pages">
            {result.page > 1 ? (
              <Link href={url(result.page - 1)}>← Previous</Link>
            ) : (
              <span />
            )}
            <span>
              Page {result.page} of {result.pages}
            </span>
            {result.page < result.pages && (
              <Link href={url(result.page + 1)}>Next →</Link>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
