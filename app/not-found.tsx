import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap page">
      <div className="empty">
        <p className="eyebrow">404 · NOT IN THIS VIEW</p>
        <h1>Let&apos;s find another place.</h1>
        <p>
          This page or Census geography is not available. A missing ZCTA does
          not mean a ZIP code is invalid.
        </p>
        <Link href="/search" className="button" style={{ marginTop: 24 }}>
          Search places →
        </Link>
      </div>
    </div>
  );
}
