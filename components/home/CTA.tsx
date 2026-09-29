import Link from "next/link";
export default function CTA() {
  return (
    <section className="wrap">
      <div className="cta">
        <div>
          <p className="eyebrow">TWO PLACES. ONE CLEARER VIEW.</p>
          <h2>Where could life take you?</h2>
          <p>Compare the numbers. Bring your own priorities.</p>
        </div>
        <Link className="button light" href="/compare?left=10001&right=90210">
          Compare ZIP areas ↗
        </Link>
      </div>
    </section>
  );
}
