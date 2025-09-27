const roadmap = [
  {
    title: "Indexer & API",
    description:
      "Ship viem-based worker with Postgres schema, backfill events, and surface /api/campaigns + /api/stats endpoints.",
    status: "In progress",
    eta: "October 2025",
  },
  {
    title: "Protocol audit feedback",
    description:
      "Integrate Slither/Mythril findings, publish docs/security-report.md, and finalize deployment runbook.",
    status: "Queued",
    eta: "November 2025",
  },
  {
    title: "E2E test suite",
    description:
      "Cypress coverage for create → contribute → finalize/refund flows with mocked wallet connectors.",
    status: "Planned",
    eta: "December 2025",
  },
];

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="mx-auto mt-24 max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-12"
    >
      <div className="space-y-4">
        <h2>Execution roadmap</h2>
        <p className="max-w-3xl text-sm text-slate-300/90">
          Aligned with AGENTS.md owners. Roadmap stays short, tracked weekly, and tied to on-chain milestones.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {roadmap.map((item) => (
          <div key={item.title} className="glass flex flex-col gap-3 rounded-2xl border border-white/10 p-6">
            <span className="text-xs uppercase tracking-[0.2em] text-kaspa-300">{item.status}</span>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-slate-200/80">{item.description}</p>
            <span className="text-xs text-slate-400">ETA {item.eta}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
