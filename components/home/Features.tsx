export default function Features() {
  return (
    <section className="wrap section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">BUILT FOR CURIOSITY</p>
          <h2>More context. Better questions.</h2>
        </div>
        <p>Useful numbers, with the story behind them.</p>
      </div>
      <div className="three-grid">
        {[
          {
            n: "01",
            title: "Understand a place",
            body: "Find population, household income, home values and rent. See how an area compares with its state and the nation.",
          },
          {
            n: "02",
            title: "Compare your possibilities",
            body: "Put two ZIP areas side by side. Explore trade-offs without a mysterious score telling you where to live.",
          },
          {
            n: "03",
            title: "Know where it comes from",
            body: "Every statistic links to its Census dataset, period and margin of error. Missing data stays missing.",
          },
        ].map((f) => (
          <article className="feature" key={f.n}>
            <span className="feature-number">{f.n}</span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
