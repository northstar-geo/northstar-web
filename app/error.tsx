"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap page">
      <div className="empty" role="alert">
        <h1>We couldn&apos;t load this view.</h1>
        <p>Please try again. If it continues, return to search.</p>
        <button className="button" onClick={reset} style={{ marginTop: 24 }}>
          Try again
        </button>
      </div>
    </div>
  );
}
