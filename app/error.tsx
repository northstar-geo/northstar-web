"use client";
import { useEffect } from "react";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is a framework-generated correlation value; never expose the
    // raw error, query, stack, or user-entered input to the client.
    if (error.digest) console.error("zipora.client_view_error", { digest: error.digest });
  }, [error]);
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
