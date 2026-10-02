import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "About Zipora",
  "Zipora helps people understand places through transparent public geographic data.",
  "/about",
);
export default function Page() {
  return (
    <article className="wrap page prose">
      <div className="page-heading">
        <p className="eyebrow">A NORTHSTAR PRODUCT</p>
        <h1>A clearer picture of place.</h1>
        <p>
          Zipora turns public geographic statistics into a useful starting point
          for understanding an area.
        </p>
      </div>
      <h2>Built around the questions people ask</h2>
      <p>
        Who lives here? What does housing look like? How does it compare with
        somewhere else? We organize public Census statistics around those
        questions, with the source and uncertainty close at hand.
      </p>
      <p>
        Zipora is an independent product of Northstar. It is not affiliated
        with, endorsed by or operated by USPS or the U.S. Census Bureau. It does
        not provide official postal verification.{" "}
        <Link href="/methodology">Our methodology</Link> describes what the data
        can and cannot tell you.
      </p>
      <h2>Privacy in this version</h2>
      <p>
        No accounts, advertising SDKs, analytics trackers, payment services or
        third-party map tiles are integrated. Search terms appear in the page
        URL and may be retained by your browser and the hosting server&apos;s
        ordinary access logs. Do not enter a private street address; this
        version searches public geographic names and codes only.
      </p>
      <p>
        Your color-theme choice is stored in your browser&apos;s local storage.
        No precise device location is requested. Links to original data sources
        leave this site and are subject to those sites&apos; policies.
        Hosting-specific log retention and a verified support contact must be
        confirmed before public launch.
      </p>
      <h2>Use the data with context</h2>
      <p>
        These are geographic summaries, not personalized financial, legal or
        relocation advice. Data can be incomplete, outdated or affected by
        sampling error. Verify information that matters to a specific decision.
        See <Link href="/data-sources">data sources and attribution</Link>.
      </p>
    </article>
  );
}
