export default function SearchForm({ query = "" }: { query?: string }) {
  return (
    <form action="/search" role="search" className="search-form">
      <label htmlFor="geography-search" className="sr-only">
        ZIP code, city, county or state
      </label>
      <span aria-hidden="true" className="search-icon">
        ⌕
      </span>
      <input
        id="geography-search"
        name="q"
        defaultValue={query}
        type="search"
        maxLength={100}
        placeholder="ZIP code, city, county or state"
        autoComplete="off"
      />
      <button type="submit">
        Explore <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
