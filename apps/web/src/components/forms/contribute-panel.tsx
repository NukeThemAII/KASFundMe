"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

interface ContributePanelProps {
  campaignAddress: string;
}

export default function ContributePanel({ campaignAddress }: ContributePanelProps) {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!amount) {
      setMessage("Enter an amount in KAS before contributing");
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setMessage(
        `Prepared pledge of ${amount} KAS to ${campaignAddress.slice(0, 10)}…. Sign the transaction when ready.`,
      );
      setAmount("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass flex w-full flex-col gap-4 rounded-3xl border border-kaspa-blue-400/20 p-6 shadow-[0_20px_55px_rgba(23,156,222,0.28)]"
    >
      <div>
        <h3 className="text-xl font-semibold text-white">Support this campaign</h3>
        <p className="mt-1 text-sm text-slate-300/80">
          Funds move directly into the campaign contract. Finalized payouts automatically route 1% to protocol fees.
        </p>
      </div>
      <label className="flex flex-col gap-2 text-left text-sm">
        <span className="text-slate-200">Amount (KAS)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={handleChange}
          placeholder="250"
          className="w-full rounded-xl border border-white/10 bg-kaspa-night/60 px-4 py-3 text-sm text-white shadow-inner outline-none transition focus:border-kaspa-blue-300 focus:ring-2 focus:ring-kaspa-blue-400/40"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-kaspa-blue-400 to-kaspa-400 px-5 py-3 text-sm font-semibold text-kaspa-night shadow-[0_15px_40px_rgba(20,152,255,0.35)] transition hover:shadow-[0_20px_50px_rgba(20,152,255,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening wallet…" : "Contribute"}
      </button>
      {message && <p className="text-sm text-kaspa-200">{message}</p>}
    </form>
  );
}
