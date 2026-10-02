import Link from "next/link";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Link href="/" className="brand">
            zipora.
          </Link>
          <p>
            A clearer picture of place.
            <br />A Northstar product.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/methodology">Methodology</Link>
          <Link href="/data-sources">Data sources</Link>
          <Link href="/about">About & privacy</Link>
        </nav>
        <p className="small">
          Independent geographic research.
          <br />
          Not affiliated with USPS or the U.S. Census Bureau.
          <br />© {new Date().getFullYear()} Zipora
        </p>
      </div>
    </footer>
  );
}
