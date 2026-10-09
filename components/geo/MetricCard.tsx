import {
  formatMetric,
  formatObservation,
  metricDefinitions,
} from "@/lib/geo/model";
import type { MetricKey, Observation } from "@/lib/geo/model";
import { data } from "@/lib/geo/repository";
export default async function MetricCard({
  metric,
  value,
}: {
  metric: MetricKey;
  value?: Observation;
}) {
  const definition = metricDefinitions[metric];
  const source = (await data()).sources.find((s) => s.id === value?.source);
  return (
    <article className="metric">
      <h3>{definition.label}</h3>
      <strong>{formatObservation(value, metric)}</strong>
      <span className="small">{definition.universe}</span>
      <details>
        <summary>Source & uncertainty</summary>
        <p>
          {value
            ? `ACS ${value.vintage - 4}–${value.vintage} five-year estimate.`
            : "No estimate in the imported data."}
        </p>
        <p>
          90% margin of error:{" "}
          {value?.moe != null
            ? `± ${formatMetric(value.moe, metric)}`
            : "Not available"}
        </p>
        {value?.limitation && <p>{value.limitation}</p>}
        {source && (
          <>
            <a className="source-link" href={source.url}>
              Census {definition.table} source file ↗
            </a>
            <p>
              Retrieved {source.fetchedAt.slice(0, 10)} · Public federal data
            </p>
            <p>Variable: {value?.variable}</p>
          </>
        )}
      </details>
    </article>
  );
}
