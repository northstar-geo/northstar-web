import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Methodology & limitations",
  "Understand ZIP codes, ZCTAs, ACS estimates, sampling uncertainty and geographic relationships.",
  "/methodology",
);
export default function Page() {
  return (
    <article className="wrap page prose">
      <div className="page-heading">
        <p className="eyebrow">THE CONTEXT BEHIND THE NUMBERS</p>
        <h1>Useful data starts with honest boundaries.</h1>
        <p>
          Our method is intentionally simple: show the source, preserve the
          geography, explain the uncertainty.
        </p>
      </div>
      <h2>ZIP codes and ZCTAs are different</h2>
      <p>
        USPS ZIP codes organize mail delivery. Census ZIP Code Tabulation Areas
        (ZCTAs) approximate the geographic distribution of certain ZIP codes for
        statistical analysis. Not every ZIP code has a ZCTA; a numeric match is
        not verification of an active postal code. Our /zip pages are explicitly
        Census-area profiles.
      </p>
      <p>
        We have not imported a licensed current USPS postal directory or a
        verified ZIP-to-ZCTA crosswalk. We do not validate addresses, mail
        delivery, post-office boxes, city mailing names or CASS/DPV status.{" "}
        <a href="https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html">
          Read the Census definition of ZCTAs ↗
        </a>
      </p>
      <h2>What the statistics mean</h2>
      <p>
        The current snapshot uses the American Community Survey (ACS) 2020–2024
        five-year estimates. These combine survey observations over five years;
        they are not a 2024 point-in-time census or live 2026 data. We display
        total population, median household income, median age, median
        owner-occupied home value and median monthly gross rent. Income is in
        2024 inflation-adjusted dollars.
      </p>
      <p>
        Missing, suppressed and negative Census sentinel values are shown as
        unavailable, never zero. Medians reported in an open-ended upper or
        lower interval show ≥ or &lt; with the reporting threshold, not the raw
        numeric code as an exact value. The 90% margin of error is shown where
        supplied. A missing margin of error is not a claim of perfect precision.
      </p>
      <h2>Relationships are land overlaps</h2>
      <p>
        Related county and city links come from 2020 ZCTA relationship files.
        Positive land overlap qualifies; we do not infer relationships from the
        names of places. The browsing state for a ZCTA is selected from its
        largest county land overlap. Areas can cross counties and states.
        Related links are not USPS mailing-city or delivery associations.
      </p>
      <p>
        Relationships from 2020 are joined by identifier to 2025 Gazetteer
        geography. Changed or removed identifiers are excluded, including some
        older Connecticut county relationships. Their state-code prefixes still
        provide state context; retired county pages are not linked. A Census
        place may be an incorporated city, town, village or a census-designated
        place, not necessarily a municipal government. Search retains the
        official labels.
      </p>
      <h2>Maps, distance and density</h2>
      <p>
        Our map displays Census Gazetteer internal reference points, not
        addresses or official ZIP boundaries. Nearby areas are ranked by
        great-circle distance between reference points. They are not necessarily
        adjacent, and distances are not road travel distances. Population
        density divides the ACS population estimate by Gazetteer land area;
        differing vintages make this an approximation.
      </p>
      <p>
        If boundaries are added later, ZIP-area boundaries must be labeled as
        ZCTA or other derived approximations. We do not claim USPS official ZIP
        boundaries.
      </p>
      <h2>Time and comparison</h2>
      <p>
        Population history compares 2019–2023 and 2020–2024 estimates. Four
        survey years overlap. These are not independent annual counts, and the
        chart is not a year-over-year growth rate. Geography changes can further
        limit comparisons. State and nation comparisons use the same 2020–2024
        period; the United States estimate excludes Puerto Rico.
      </p>
      <p>
        We do not calculate a “best place” score or infer significance from
        differences in estimates. Housing values are not current asking prices.
        These summaries cannot capture household-level circumstances.
      </p>
      <h2>Coverage and freshness</h2>
      <p>
        Coverage is limited to the geographies actually present in our imported
        official sources. Unavailable data stays visible as unavailable. Only
        profiles with positive population, land area, at least three sourced
        metrics and valid geographic context qualify for indexing. Search and
        comparison query pages are not indexed.
      </p>
      <p>
        Snapshot updates are explicit imports with source URLs, download
        timestamps, hashes and validation receipts. The site works without live
        data-provider requests.{" "}
        <Link href="/data-sources">
          Inspect the data sources and import record →
        </Link>
      </p>
    </article>
  );
}
