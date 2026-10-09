import { ImageResponse } from "next/og";
export const alt = "OKELOM — A clearer picture of place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#edf1e7",
        color: "#193e33",
        width: "100%",
        height: "100%",
        padding: 85,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: 45 }}>OKELOM.</span>
      <span
        style={{
          fontSize: 80,
          lineHeight: 1.1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span>A clearer picture</span>
        <span>of place.</span>
      </span>
      <span style={{ fontSize: 26 }}>
        Population · Housing · Income · Transparent sources
      </span>
    </div>,
    size,
  );
}
