export default function Hero() {
    return (
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
          America's Geographic Data Platform
        </span>
  
        <h1 className="max-w-5xl text-7xl font-extrabold tracking-tight text-slate-900">
          Zipora
        </h1>
  
        <p className="mt-8 max-w-3xl text-2xl leading-relaxed text-slate-600">
          Search ZIP Codes, Cities, Counties, States and Geographic Information
          Across the United States.
        </p>
  
        <p className="mt-4 text-lg text-slate-500">
          Powered by NorthStar
        </p>
  
        <div className="mt-10 flex gap-4">
          <button className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700">
            Start Searching
          </button>
  
          <button className="rounded-xl border border-slate-300 px-8 py-4 text-lg font-semibold transition hover:bg-slate-100">
            View API
          </button>
        </div>
      </section>
    );
  }