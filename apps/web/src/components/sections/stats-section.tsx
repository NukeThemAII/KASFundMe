"use client";

import { usePlatformStats } from "@/hooks/usePlatformStats";

export default function StatsSection() {
  const { data, isLoading, isError } = usePlatformStats();
  const stats = data?.data;

  return (
    <section
      id="campaigns"
      className="mx-auto mt-24 max-w-6xl rounded-3xl border border-white/10 bg-kaspa-night/60 p-8 backdrop-blur-xl sm:p-12"
    >
      <div className="grid gap-8 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_20px_50px_rgba(10,30,40,0.35)]">
          <p className="text-sm uppercase tracking-[0.3em] text-kaspa-200">Active campaigns</p>
          <p className="mt-4 text-3xl font-semibold text-white">
            {isLoading ? "—" : stats?.activeCampaigns.toLocaleString() ?? "0"}
          </p>
          <p className="mt-2 text-sm text-slate-300/90">
            Live clones on Kasplex (chainId 167012).
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_20px_50px_rgba(10,30,40,0.35)]">
          <p className="text-sm uppercase tracking-[0.3em] text-kaspa-200">Total raised</p>
          <p className="mt-4 text-3xl font-semibold text-white">
            {isLoading ? "—" : `${stats?.totalRaisedKas.toLocaleString() ?? "0"} KAS`}
          </p>
          <p className="mt-2 text-sm text-slate-300/90">
            Aggregated via indexer events.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_20px_50px_rgba(10,30,40,0.35)]">
          <p className="text-sm uppercase tracking-[0.3em] text-kaspa-200">Protocol fees</p>
          <p className="mt-4 text-3xl font-semibold text-white">
            {isLoading ? "—" : `${stats?.totalFeesKas.toFixed(1) ?? "0.0"} KAS`}
          </p>
          <p className="mt-2 text-sm text-slate-300/90">
            Immutable 1% fee routed to feeRecipient.
          </p>
        </div>
      </div>
      {isError && (
        <p className="mt-6 text-sm text-rose-300">
          Failed to load stats. The indexer mock may be unavailable.
        </p>
      )}
    </section>
  );
}
