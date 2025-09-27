"use client";

import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { usePlatformStats } from "@/hooks/usePlatformStats";

export default function AdminDashboard() {
  const { data, isLoading } = usePlatformStats();
  const stats = data?.data;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="glass rounded-3xl border border-white/10 p-8">
        <h1 className="text-3xl font-semibold text-white">Protocol admin</h1>
        <p className="mt-2 text-sm text-slate-300/85">
          Monitor protocol metrics and prep contract interactions. Final admin dashboard will wire directly to wagmi actions and the Kasplex indexer API.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <MetricCard
            label="Total campaigns"
            value={isLoading ? "—" : stats?.totalCampaigns.toLocaleString() ?? "0"}
          />
          <MetricCard
            label="KAS raised"
            value={isLoading ? "—" : `${stats?.totalRaisedKas.toLocaleString() ?? "0"}`}
            suffix="KAS"
          />
          <MetricCard
            label="Fees accrued"
            value={isLoading ? "—" : `${stats?.totalFeesKas.toFixed(1) ?? "0.0"}`}
            suffix="KAS"
          />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white">Upcoming actions</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300/85">
            <li>• Configure feeRecipient multisig once audit completes.</li>
            <li>• Verify factory bytecode on explorer (Kasplex Testnet).</li>
            <li>• Publish `/docs/security-report.md` for audit sign-off.</li>
          </ul>
        </div>
        <div className="glass rounded-3xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white">Helpful links</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-kaspa-200">
            <Link
              href="https://explorer.testnet.kasplextest.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-white"
            >
              Testnet Explorer
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Link>
            <Link
              href="https://docs.kaspa.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-white"
            >
              Kaspa docs
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Link>
            <Link
              href="mailto:hello@kasfundme.dev"
              className="inline-flex items-center gap-2 hover:text-white"
            >
              Contact core team
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  suffix?: string;
}

function MetricCard({ label, value, suffix }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300/80">
      <p className="uppercase tracking-[0.3em] text-kaspa-200">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">
        {value} {suffix}
      </p>
    </div>
  );
}
