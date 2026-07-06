export default function Features() {
    const features = [
      {
        title: "ZIP Codes",
        description:
          "Instant access to ZIP Code information across the United States.",
      },
      {
        title: "Cities",
        description:
          "Explore cities with geographic, demographic and regional data.",
      },
      {
        title: "Developer API",
        description:
          "Integrate reliable location intelligence into your applications.",
      },
    ];
  
    return (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold text-slate-900">
            Powerful Features
          </h2>
  
          <p className="mt-4 text-xl text-slate-600">
            Everything needed to search and explore geographic information.
          </p>
        </div>
  
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h3 className="mb-4 text-2xl font-bold">
                {feature.title}
              </h3>
  
              <p className="leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }