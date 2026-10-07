import Link from "next/link";
import {
  data,
  geography,
  nearby,
  related,
  stateFor,
} from "@/lib/geo/repository";
import {
  formatMetric,
  formatObservation,
  metricDefinitions,
  routeFor,
} from "@/lib/geo/model";
import type { Geography, MetricKey } from "@/lib/geo/model";
import { geographyJsonLd } from "@/lib/geo/page";
import MetricCard from "./MetricCard";
import PointMap from "./PointMap";

const keys = Object.keys(metricDefinitions) as MetricKey[];
export default function GeographyPage({
  geo,
  page = 1,
}: {
  geo: Geography;
  page?: number;
}) {
  const state = stateFor(geo),
    nation = geography("nation:US");
  const neighbors = geo.kind === "zcta" ? nearby(geo) : [];
  const relations = related(geo);
  const children = relations.filter((g) =>
    geo.kind === "state" ? g.kind !== "zcta" : true,
  );
  const pages = Math.max(1, Math.ceil(children.length / 30));
  const current = Math.max(
    1,
    Math.min(Number.isFinite(page) ? Math.floor(page) : 1, pages),
  );
  const title = geo.kind === "zcta" ? `${geo.code}: a closer look` : geo.name;
  const breadcrumbs = [
    { name: "United States", url: "/" },
    ...(state && geo.kind !== "state"
      ? [{ name: state.name, url: routeFor(state) }]
      : []),
    {
      name: geo.kind === "zcta" ? `ZCTA ${geo.code}` : geo.name,
      url: routeFor(geo),
    },
  ];
  const population = geo.metrics.population?.value;
  const structuredData = geographyJsonLd(breadcrumbs);
  const history = [...geo.populationHistory].sort(
    (a, b) => a.vintage - b.vintage,
  );
  const maxPopulation = Math.max(1, ...history.map((v) => v.value ?? 0));
  return (
    <div className="wrap page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        {breadcrumbs.map((b, i) => (
          <span key={b.url}>
            {i > 0 && " / "}
            {i === breadcrumbs.length - 1 ? (
              <span aria-current="page">{b.name}</span>
            ) : (
              <Link href={b.url}>{b.name}</Link>
            )}
          </span>
        ))}
      </nav>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}
      <div className="page-heading">
        <p className="eyebrow">
          {geo.kind === "zcta" ? "CENSUS ZIP AREA" : geo.kind.toUpperCase()} ·{" "}
          {geo.state || "UNITED STATES"}
        </p>
        <h1>{title}</h1>
        <p>
          Understand the people and housing behind this place. Statistics are
          ACS 2020–2024 five-year estimates, not live counts.
        </p>
      </div>
      {geo.kind === "zcta" && (
        <aside className="notice">
          <strong>ZIP code ≠ Census area.</strong> This is ZCTA {geo.code}, a
          Census statistical geography associated with a five-digit ZIP code.
          Current USPS delivery status and ZIP-to-ZCTA mapping are unverified.{" "}
          <Link href="/methodology">How to use these numbers →</Link>
        </aside>
      )}
      <div className="metric-grid">
        {keys.map((key) => (
          <MetricCard key={key} metric={key} value={geo.metrics[key]} />
        ))}
        <article className="metric">
          <h3>Population density</h3>
          <strong>
            {population != null && geo.landSqMi > 0
              ? Math.round(population / geo.landSqMi).toLocaleString("en-US")
              : "Not available"}
          </strong>
          <span className="small">People per land square mile</span>
          <details>
            <summary>Method & geography</summary>
            <p>
              Derived: 2020–2024 estimated population ÷{" "}
              {geo.landSqMi.toLocaleString("en-US")} land square miles from the
              2025 Gazetteer. Mixed vintages; approximate density.
            </p>
            <Link className="source-link" href="/data-sources">
              Sources & licenses
            </Link>
          </details>
        </article>
      </div>
      <section className="content-section">
        <h2>A little perspective</h2>
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Same-period comparison table"
        >
          <table>
            <caption>Same-period comparison · 2020–2024 ACS</caption>
            <thead>
              <tr>
                <th scope="col">Measure</th>
                <th scope="col">This area</th>
                {state && state.id !== geo.id && (
                  <th scope="col">{state.name}</th>
                )}
                <th scope="col">United States</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key}>
                  <th scope="row">{metricDefinitions[key].label}</th>
                  <td>{formatObservation(geo.metrics[key], key)}</td>
                  {state && state.id !== geo.id && (
                    <td>{formatObservation(state.metrics[key], key)}</td>
                  )}
                  <td>{formatObservation(nation?.metrics[key], key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small">
          Differences are descriptive, not a statistical significance test. U.S.
          estimates exclude Puerto Rico. See each source for uncertainty and
          reporting limits.
        </p>
      </section>
      <section className="content-section">
        <h2>Population over time</h2>
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Population history table"
        >
          <table>
            <caption>Overlapping five-year estimates</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Population</th>
                <th scope="col">90% margin of error</th>
                <th scope="col">Relative size</th>
              </tr>
            </thead>
            <tbody>
              {history.map((v) => (
                <tr key={v.vintage}>
                  <th scope="row">
                    {v.vintage - 4}–{v.vintage}
                  </th>
                  <td>{formatMetric(v.value, "population")}</td>
                  <td>
                    {v.moe != null
                      ? `± ${formatMetric(v.moe, "population")}`
                      : "Not available"}
                  </td>
                  <td>
                    {v.value != null && (
                      <div
                        className="trend-bar"
                        style={{ width: `${(v.value / maxPopulation) * 100}%` }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small">
          These periods share four years of observations. They are not
          independent annual counts; changes must not be interpreted as
          year-over-year growth. Boundary changes may also affect comparability.
        </p>
      </section>
      {geo.kind === "zcta" && (
        <section className="content-section">
          <h2>Place it on the map</h2>
          <PointMap
            center={{
              code: geo.code,
              latitude: geo.latitude,
              longitude: geo.longitude,
              href: routeFor(geo),
            }}
            points={neighbors.map((n) => ({
              code: n.geography.code,
              latitude: n.geography.latitude,
              longitude: n.geography.longitude,
              href: routeFor(n.geography),
            }))}
          />
          <h3 style={{ margin: "24px 0 16px" }}>Nearby Census ZIP areas</h3>
          <div className="link-grid">
            {neighbors.map((n) => (
              <Link
                className="link-card"
                href={routeFor(n.geography)}
                key={n.geography.id}
              >
                ZCTA {n.geography.code} ↗
                <span className="small">
                  {n.distance.toFixed(1)} miles between reference points
                </span>
              </Link>
            ))}
          </div>
          <p className="small">
            Straight-line distances; not driving distances or boundary
            adjacency.
          </p>
        </section>
      )}
      <section className="content-section">
        <h2>
          {geo.kind === "state" ? "Cities & counties" : "Related geography"}
        </h2>
        <p className="small">
          {geo.kind === "state"
            ? "Browse Census places (including cities, towns and CDPs) and counties."
            : "2020 Census land overlaps, joined to 2025 geography identifiers. These are not postal service associations. Changed or unmatched geographies are omitted."}
        </p>
        <div className="link-grid" style={{ marginTop: 18 }}>
          {children.slice((current - 1) * 30, current * 30).map((g) => (
            <Link key={g.id} className="link-card" href={routeFor(g)}>
              <span className="badge">
                {g.kind === "zcta" ? "Census ZIP area" : g.kind}
              </span>
              <br />
              {g.name} ↗<span className="small">{g.state}</span>
            </Link>
          ))}
        </div>
        {!children.length && (
          <p className="notice">
            No verified overlap is available for this geography in the imported
            relationship vintage.
          </p>
        )}
        {pages > 1 && (
          <nav className="pager" aria-label="Related geography pages">
            {current > 1 ? (
              <Link href={`${routeFor(geo)}?page=${current - 1}`}>
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span>
              Page {current} of {pages}
            </span>
            {current < pages && (
              <Link href={`${routeFor(geo)}?page=${current + 1}`}>Next →</Link>
            )}
          </nav>
        )}
        {geo.kind === "state" && (
          <Link
            className="source-link"
            href={`/search?q=${geo.state}&kind=zcta`}
          >
            Browse Census ZIP areas associated with {geo.name} →
          </Link>
        )}
      </section>
      {geo.kind === "zcta" && (
        <Link className="button" href={`/compare?left=${geo.code}`}>
          Compare this ZIP area ↗
        </Link>
      )}
      <section className="content-section prose">
        <h2>Sources & limitations</h2>
        <p>
          U.S. Census Bureau, ACS 2020–2024 and 2019–2023 five-year estimates;
          2025 Gazetteer reference points and land areas; 2020 geography
          relationships. Imported {data().importedAt.slice(0, 10)}. Data is
          public federal statistical information. Zipora is responsible for
          derived calculations and does not imply Census endorsement.
        </p>
        <p>
          Housing medians describe occupied housing stock, not current listings.
          Income describes households, not individuals. Top-coded medians are
          reporting limits. Education, employment and commute statistics are not
          included in this release.
        </p>
        <p>
          <Link href="/data-sources">
            Inspect download URLs, timestamps and licenses
          </Link>{" "}
          · <Link href="/methodology">Read the methodology</Link>
        </p>
      </section>
    </div>
  );
}
