import Link from "next/link";
import ThemeControl from "./ThemeControl";
export default function Header() {
  return (
    <header className="header">
      <div className="wrap header-inner">
        <Link href="/" className="brand" aria-label="Zipora home">
          <span className="brand-icon" aria-hidden="true">
            ✳
          </span>
          zipora<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/search">Explore</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/data-sources">Our data</Link>
        </nav>
        <ThemeControl />
      </div>
    </header>
  );
}
