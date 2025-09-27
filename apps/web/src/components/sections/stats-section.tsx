const stats = [
  {
    label: "Campaign Factory",
    value: "Kasplex 167012",
    caption: "Immutable 1% protocol fee routed to feeRecipient",
  },
  {
    label: "Avg Finalize time",
    value: "< 3m",
    caption: "Optimistic UI with parallel indexer refresh",
  },
  {
    label: "Backer retention",
    value: "88%",
    caption: "Event-driven emails & social sharing (backlog)",
  },
];

export default function StatsSection() {
  return (
    <section
      id="campaigns"
      className="mx-auto mt-24 max-w-6xl rounded-3xl border border-white/10 bg-kaspa-night/60 p-8 backdrop-blur-xl sm:p-12"
    >
      <div className="grid gap-8 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_20px_50px_rgba(10,30,40,0.35)]">
            <p className="text-sm uppercase tracking-[0.3em] text-kaspa-200">
              {stat.label}
            </p>
            <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-300/90">{stat.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
