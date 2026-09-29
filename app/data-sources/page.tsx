import registry from "@/data/sources.json";
import { data } from "@/lib/geo/repository";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Data sources & licenses",
  "Inspect Census datasets, vintages, download receipts, coverage and public-data usage terms.",
  "/data-sources",
);
export default function Page() {
  const snapshot = data();
  return (
    <article className="wrap page prose">
      <div className="page-heading">
        <p className="eyebrow">FOLLOW THE SOURCE</p>
        <h1>Nothing behind the numbers.</h1>
        <p>
          Public data. Explicit vintages. A traceable import for every
          statistic.
        </p>
      </div>
      <aside className="notice">
        Snapshot imported {snapshot.importedAt.slice(0, 10)}. Statistical
        period: 2020–2024, not live 2026 measurements.{" "}
        {snapshot.geographies
          .filter((g) => g.kind === "zcta")
          .length.toLocaleString("en-US")}{" "}
        Census ZIP areas. USPS delivery verification is not included.
      </aside>
      {registry.active.map((s) => (
        <section className="content-section" key={s.id}>
          <h2>{s.name}</h2>
          <p>
            Vintage: {s.vintage}. {s.coverage}.
          </p>
          <p>
            Update schedule: {s.update_frequency}. Cost: {s.cost}.{" "}
            {s.geography_type}.
          </p>
          <p>
            <a href={s.url}>Official source ↗</a>
          </p>
        </section>
      ))}
      <h2>Usage and attribution</h2>
      <p>
        {registry.license.name}. {registry.license.commercial_use}.{" "}
        {registry.license.redistribution}. {registry.license.attribution}.
      </p>
      <p>{registry.license.limitation}</p>
      <ul>
        {registry.license.evidence.map((u) => (
          <li key={u}>
            <a href={u}>
              {u.includes("citation")
                ? "Census citation and public-use guidance"
                : "Census research transparency and public-access policy"}
            </a>
          </li>
        ))}
      </ul>
      <h2>Exact source receipts</h2>
      <p>
        Hashes identify the downloaded inputs. The import validates these files
        before publishing a snapshot. Download dates are separate from dataset
        years.
      </p>
      {snapshot.sources.map((s) => (
        <details className="content-section source-file" key={s.id}>
          <summary>{s.id}</summary>
          <p>
            <a href={s.url}>Original download</a>
          </p>
          <p>
            Fetched: {s.fetchedAt}
            <br />
            Bytes: {s.bytes.toLocaleString("en-US")}
            <br />
            SHA-256: {s.sha256}
          </p>
        </details>
      ))}
      <h2>Not part of this dataset</h2>
      {registry.deferred.map((s) => (
        <p key={s.name}>
          <strong>{s.name}</strong> — {s.reason}
        </p>
      ))}
    </article>
  );
}
