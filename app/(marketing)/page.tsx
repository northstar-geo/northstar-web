import Link from "next/link";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CTA from "@/components/home/CTA";
import { data } from "@/lib/geo/repository";
import { routeFor } from "@/lib/geo/model";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "A clearer picture of place",
  "Search U.S. ZIP areas, cities, counties and states. Explore Census population, income and housing with transparent sources.",
  "/",
);
export default async function HomePage() {
  const states = (await data()).states;
  return (
    <>
      <Hero />
      <div className="trust-strip">
        <div className="wrap">
          <span>PUBLIC DATA. OPEN PERSPECTIVE.</span>
          <span>U.S. Census Bureau</span>
          <span>2020–2024 ACS estimates</span>
          <Link href="/methodology">ZIP ≠ ZCTA: what to know ↗</Link>
        </div>
      </div>
      <Features />
      <section className="wrap section" id="states">
        <div className="section-heading">
          <div>
            <p className="eyebrow">START SOMEWHERE</p>
            <h2>Explore state by state.</h2>
          </div>
          <p>50 states, D.C. and Puerto Rico.</p>
        </div>
        <div className="state-grid">
          {states.map((g) => (
            <Link key={g.id} href={routeFor(g)}>
              <span>{g.state}</span>
              {g.name}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <CTA />
      <section className="wrap note-section">
        <h2>One important distinction.</h2>
        <p>
          A USPS ZIP code describes mail delivery. A Census ZIP Code Tabulation
          Area (ZCTA) describes a statistical area. OKELOM uses ZCTAs to provide
          geographic context; it does not verify postal addresses or current
          delivery service.
        </p>
        <Link href="/methodology">Understand the methodology →</Link>
      </section>
    </>
  );
}
