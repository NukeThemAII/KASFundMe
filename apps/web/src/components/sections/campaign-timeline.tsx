"use client";

import { format } from "date-fns";
import type {
  ContributionEvent,
  FinalizeEvent,
  RefundEvent,
} from "@/types/campaign";

interface CampaignTimelineProps {
  contributions: ContributionEvent[];
  finalize?: FinalizeEvent;
  refunds: RefundEvent[];
}

export default function CampaignTimeline({
  contributions,
  finalize,
  refunds,
}: CampaignTimelineProps) {
  const items = [
    ...contributions.map((event) => ({
      type: "CONTRIBUTION" as const,
      date: event.blockTime,
      title: "Contribution",
      description: `${event.amountKas.toLocaleString()} KAS from ${shortAddress(event.contributor)}`,
      txHash: event.txHash,
    })),
    ...(finalize
      ? [
          {
            type: "FINALIZE" as const,
            date: finalize.blockTime,
            title: "Finalized",
            description: `Payout ${finalize.payoutKas.toLocaleString()} KAS`.
              concat(` • Fees ${finalize.feeKas.toLocaleString()} KAS`),
            txHash: finalize.txHash,
          },
        ]
      : []),
    ...refunds.map((event) => ({
      type: "REFUND" as const,
      date: event.blockTime,
      title: "Refund",
      description: `${event.amountKas.toLocaleString()} KAS back to ${shortAddress(event.contributor)}`,
      txHash: event.txHash,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (items.length === 0) {
    return (
      <div className="glass rounded-3xl border border-white/10 p-6 text-sm text-slate-300/80">
        No on-chain activity recorded yet. Contributions will appear in real time once the indexer streams events.
      </div>
    );
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={item.txHash} className="glass rounded-3xl border border-white/10 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-kaspa-200">
              {item.type === "CONTRIBUTION" && "Contribution"}
              {item.type === "FINALIZE" && "Finalize"}
              {item.type === "REFUND" && "Refund"}
            </span>
            <span className="text-xs text-slate-400">
              {format(new Date(item.date), "MMM d, yyyy • HH:mm 'UTC'")}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-100">{item.description}</p>
          <a
            href={`https://explorer.testnet.kasplextest.xyz/tx/${item.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center text-xs text-kaspa-200 hover:text-white"
          >
            View transaction
          </a>
        </li>
      ))}
    </ol>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
