"use client";

import CampaignCard from "@/components/cards/campaign-card";
import ContributePanel from "@/components/forms/contribute-panel";
import { useCampaigns } from "@/hooks/useCampaigns";
import type { CampaignSummary } from "@/types/campaign";

export default function CampaignShowcase() {
  const { data, isLoading, isError } = useCampaigns({ limit: 3 });

  const campaigns = data?.data ?? [];
  const highlighted = campaigns[0];

  return (
    <section className="mx-auto mt-24 flex w-full max-w-6xl flex-col gap-10 md:flex-row">
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <h2 className="text-balance">Featured Kasplex campaigns</h2>
          <p className="text-sm text-slate-300/90">
            Data streams from the indexer once synced. Mock entries display structure while the network catches up.
          </p>
        </div>
        {isError && (
          <p className="text-sm text-rose-300">
            Could not load campaigns. Refresh or check API logs.
          </p>
        )}
        <div className="grid gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5"
                />
              ))
            : campaigns.map((campaign) => (
                <CampaignCard key={campaign.address} campaign={campaign} />
              ))}
        </div>
      </div>
      <div className="mt-10 w-full max-w-sm md:mt-0 md:w-80">
        {highlighted ? (
          <ContributePanel campaignAddress={highlighted.address} />
        ) : (
          <div className="glass flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 p-6 text-sm text-slate-300/80">
            <p>No campaign selected.</p>
            <p className="mt-1 text-xs text-slate-500">
              Once the indexer syncs, live campaigns will be available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
