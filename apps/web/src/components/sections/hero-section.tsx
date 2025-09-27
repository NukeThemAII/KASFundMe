"use client";

import Link from "next/link";
import { RocketLaunchIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function HeroSection() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 pt-32 text-center md:items-start md:text-left">
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-60">
        <div className="h-72 w-72 rounded-full bg-gradient-to-br from-kaspa-400/30 via-kaspa-blue-400/20 to-transparent blur-3xl" />
      </div>
      <div className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-kaspa-400/40 bg-kaspa-night/80 px-4 py-1 text-xs uppercase tracking-[0.35em] text-kaspa-200">
          <SparklesIcon className="h-4 w-4" />
          Powered by Kasplex zkEVM Testnet
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
          Fuel community-backed missions with trustless crowdfunding in KAS.
        </h1>
        <p className="max-w-2xl text-lg text-slate-200/90 md:text-xl">
          Launch campaigns, rally Kaspa supporters, and settle funds directly on-chain. KASFundMe handles fee routing, deadlines, and refunds so you can focus on momentum.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
          <Link
            href="#create"
            className="gradient-border inline-flex items-center justify-center rounded-full bg-kaspa-night px-6 py-3 text-base font-semibold text-white shadow-glow transition transform hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(20,241,217,0.35)]"
          >
            <RocketLaunchIcon className="mr-2 h-5 w-5 text-kaspa-200" />
            Launch your campaign
          </Link>
          <Link
            href="#campaigns"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-kaspa-300 hover:text-kaspa-100"
          >
            Explore live campaigns
          </Link>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200/80 md:max-w-md">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-kaspa-300">
              Ready to contribute
            </span>
            <span className="font-medium text-slate-100">Connect your Kaspa wallet to pledge in seconds.</span>
          </div>
          <ConnectButton showBalance={false} label="Connect" accountStatus="avatar" />
        </div>
      </div>
    </section>
  );
}
