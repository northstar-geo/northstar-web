import Link from "next/link";
import { geography } from "@/lib/geo/repository";
import {
  formatMetric,
  formatObservation,
  metricDefinitions,
} from "@/lib/geo/model";
import type { MetricKey } from "@/lib/geo/model";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Compare ZIP areas",
  "Compare Census ZIP-area population, income and housing side by side.",
  "/compare",
  false,
);
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const left = typeof p.left === "string" ? p.left.slice(0, 100) : "";
  const right = typeof p.right === "string" ? p.right.slice(0, 100) : "";
  const a = /^\d{5}$/.test(left) ? geography(`zcta:${left}`) : undefined,
    b = /^\d{5}$/.test(right) ? geography(`zcta:${right}`) : undefined;
  return (
    <div className="wrap page">
      <div className="page-heading">
        <p className="eyebrow">MAKE ROOM FOR PERSPECTIVE</p>
        <h1>Two places. Side by side.</h1>
        <p>
          Compare the same Census measures and time period. Your priorities
          decide what matters.
        </p>
      </div>
      <form action="/compare" className="compare-form">
        <label>
          First ZIP area
          <input
            name="left"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            required
            defaultValue={left}
            placeholder="10001"
          />
        </label>
        <label>
          Second ZIP area
          <input
            name="right"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            required
            defaultValue={right}
            placeholder="90210"
          />
        </label>
        <button className="button" type="submit">
          Compare areas ↗
        </button>
      </form>
      {a && b ? (
        <>
          <aside className="notice">
            These are Census ZCTAs, not verified USPS delivery areas. Both
            columns use 2020–2024 ACS estimates. No ranking or statistical
            significance is implied.
          </aside>
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="ZIP area comparison table"
          >
            <table>
              <caption>2020–2024 ACS five-year estimates</caption>
              <thead>
                <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">
                    <Link href={`/zip/${left}`}>{left} ↗</Link>
                  </th>
                  <th scope="col">
                    <Link href={`/zip/${right}`}>{right} ↗</Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(metricDefinitions) as MetricKey[]).map((key) => (
                  <tr key={key}>
                    <th scope="row">
                      {metricDefinitions[key].label}
                      <span className="small" style={{ display: "block" }}>
                        {metricDefinitions[key].universe}
                      </span>
                    </th>
                    {[a, b].map((g, column) => (
                      <td key={column}>
                        {formatObservation(g.metrics[key], key)}
                        <span className="small" style={{ display: "block" }}>
                          90% MOE:{" "}
                          {g.metrics[key]?.moe != null
                            ? `± ${formatMetric(g.metrics[key]?.moe, key)}`
                            : "not available"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small">
            Open either area for exact table links, limitations and source
            retrieval dates.
          </p>
        </>
      ) : (
        <div className="empty">
          <h2>
            {(left && !a) || (right && !b)
              ? "One of these areas is not in our dataset."
              : "Choose two places to explore."}
          </h2>
          <p>
            Enter two five-digit codes with Census ZCTA coverage. Try 10001 and
            90210.
          </p>
        </div>
      )}
      <section className="content-section prose">
        <h2>Compare thoughtfully</h2>
        <p>
          A median is not a budget, and a population estimate is not a live
          count. Rent excludes units not paying cash rent; home values describe
          owner-occupied homes. Differences may reflect sampling error.{" "}
          <Link href="/methodology">Read our methodology</Link> before making
          decisions.
        </p>
      </section>
    </div>
  );
}
