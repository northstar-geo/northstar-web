export default function Loading() {
  return (
    <div className="wrap page" role="status">
      <p>Loading geographic context…</p>
      <div className="skeleton" />
      <span className="sr-only">Please wait.</span>
    </div>
  );
}
