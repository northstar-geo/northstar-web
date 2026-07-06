export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <h1 className="text-4xl font-bold text-blue-600">
          Zipora
        </h1>

        <nav className="flex items-center gap-8 text-lg">
          <a href="#" className="hover:text-blue-600">
            Features
          </a>

          <a href="#" className="hover:text-blue-600">
            API
          </a>

          <a href="#" className="hover:text-blue-600">
            Pricing
          </a>

          <button className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}