export function StatsStrip({ stats }) {
  return (
    <section className="stats-strip">
      {stats.map((item) => (
        <article key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </article>
      ))}
    </section>
  );
}
