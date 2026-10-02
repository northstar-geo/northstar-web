"use client";
import { useId, useState } from "react";
type Point = {
  code: string;
  latitude: number;
  longitude: number;
  href: string;
};
export default function PointMap({
  center,
  points,
}: {
  center: Point;
  points: Point[];
}) {
  const [zoom, setZoom] = useState(1);
  const [active, setActive] = useState<string | null>(null);
  const grid = useId().replaceAll(":", "");
  const longitudeDelta = (longitude: number) =>
    ((longitude - center.longitude + 540) % 360) - 180;
  const cos = Math.max(0.1, Math.cos((center.latitude * Math.PI) / 180));
  const extent =
    Math.max(
      0.002,
      ...points.flatMap((p) => [
        Math.abs(longitudeDelta(p.longitude) * cos) * 0.65,
        Math.abs(p.latitude - center.latitude),
      ]),
    ) * 1.5;
  const scale = (125 / extent) * zoom;
  const position = (p: Point) => ({
    x: 400 + longitudeDelta(p.longitude) * cos * scale,
    y: 175 - (p.latitude - center.latitude) * scale,
  });
  return (
    <figure className="map-panel">
      <div className="map-controls">
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= 4}
          onClick={() => setZoom((z) => Math.min(4, z * 1.5))}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= 0.5}
          onClick={() => setZoom((z) => Math.max(0.5, z / 1.5))}
        >
          −
        </button>
        <button type="button" onClick={() => setZoom(1)}>
          Reset
        </button>
      </div>
      <svg
        viewBox="0 0 800 350"
        role="group"
        aria-label={`Reference-point map around ${center.code}; nearby area links are also listed below`}
      >
        <defs>
          <pattern
            id={grid}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              opacity=".1"
            />
          </pattern>
        </defs>
        <rect width="800" height="350" fill={`url(#${grid})`} />
        <text x="25" y="35" fill="currentColor" fontSize="12">
          N ↑
        </text>
        {points.map((p) => {
          const { x, y } = position(p);
          return (
            <a
              key={p.code}
              href={p.href}
              aria-label={`View ZCTA ${p.code}`}
              onFocus={() => setActive(p.code)}
              onBlur={() => setActive(null)}
              onMouseEnter={() => setActive(p.code)}
              onMouseLeave={() => setActive(null)}
            >
              <circle cx={x} cy={y} r="7" fill="currentColor" opacity=".6" />
              <text
                x="25"
                y="70"
                fontSize="16"
                fill="currentColor"
                style={{ visibility: active === p.code ? "visible" : "hidden" }}
              >
                ZCTA {p.code} ↗
              </text>
            </a>
          );
        })}
        <circle cx="400" cy="175" r="13" fill="var(--accent)" />
        <text x="420" y="179" fontSize="16" fontWeight="700" fill="var(--ink)">
          {center.code}
        </text>
      </svg>
      <figcaption>
        Reference points from the 2025 Census Gazetteer. North is up. This
        locator has no street basemap and shows no boundaries; points are not
        addresses. Focus or hover a point to identify it; all nearby areas are
        listed below. Center: {center.latitude.toFixed(5)},{" "}
        {center.longitude.toFixed(5)}.
      </figcaption>
    </figure>
  );
}
