import Link from "next/link";
import SearchForm from "../SearchForm";
export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">
            <span className="status-dot" /> PEOPLE. PLACES. PERSPECTIVE.
          </p>
          <h1>
            Every place has
            <br />a story.
            <br />
            <em>Find yours.</em>
          </h1>
          <p className="hero-copy">
            Go beyond a ZIP code. Explore the people, homes and possibilities
            that make a place — with data you can trace to its source.
          </p>
          <SearchForm />
          <div className="suggestions">
            <span>Try a place</span>
            <Link href="/zip/10001">10001 ↗</Link>
            <Link href="/search?q=Austin+TX">Austin, TX ↗</Link>
            <Link href="/state/ca">California ↗</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="contours" />
          <div className="map-cross cross-one">+</div>
          <div className="map-cross cross-two">+</div>
          <div className="coordinate">EXPLORE A PLACE / FIND A PERSPECTIVE</div>
          <div className="place-marker">
            <span />
            <div className="place-card">
              <span className="eyebrow">A WINDOW INTO A PLACE</span>
              <strong>10001</strong>
              <p>Explore a Census ZIP area</p>
              <div className="mini-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <span className="small">Population · Housing · Income</span>
            </div>
          </div>
          <span className="art-caption">DISCOVER WHAT THE NUMBERS MEAN.</span>
        </div>
      </div>
    </section>
  );
}
