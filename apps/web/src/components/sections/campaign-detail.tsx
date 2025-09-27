"use client";

import CampaignTimeline from "@/components/sections/campaign-timeline";
import ContributePanel from "@/components/forms/contribute-panel";
import ProgressBar from "@/components/ui/progress-bar";
import { useCampaign } from "@/hooks/useCampaign";
import { useContributions } from "@/hooks/useContributions";
import type { CampaignDetail } from "@/types/campaign";
import { formatDistanceToNow } from "date-fns";

interface CampaignDetailProps {
  address: string;
}

export default function CampaignDetail({ address }: CampaignDetailProps) {
  const { data, isLoading, isError } = useCampaign(address);
  const { data: contributionEvents = [] } = useContributions(address);

  const campaign: CampaignDetail | undefined = data;

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl animate-pulse flex-col gap-6">
        <div className="h-48 rounded-3xl border border-white/10 bg-white/5" />
        <div className="h-80 rounded-3xl border border-white/10 bg-white/5" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-100">
        Campaign not found. Confirm the address or wait for the indexer to sync.
      </div>
    );
  }

  const progress = Math.min(100, Math.round((campaign.raisedKas / campaign.goalKas) * 100));
  const deadlineText = formatDistanceToNow(new Date(campaign.deadline), { addSuffix: true });
  const supporterCount = new Set(
    contributionEvents.map((contribution) => contribution.contributor.toLowerCase()),
  ).size;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
      <section className="glass flex flex-col gap-6 rounded-3xl border border-white/10 p-8 lg:flex-row">
        <div className="flex-1 space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-kaspa-200">
            <span>{campaign.state.toLowerCase()}</span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-slate-300 normal-case tracking-normal">
              {supporterCount} supporters
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-white">{campaign.metadata.title}</h1>
          <p className="text-sm text-slate-300/90">{campaign.metadata.summary}</p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between text-sm text-slate-200/90">
              <span>Raised</span>
              <span className="font-semibold text-kaspa-200">
                {campaign.raisedKas.toLocaleString()} / {campaign.goalKas.toLocaleString()} KAS
              </span>
            </div>
            <ProgressBar value={progress} className="mt-3" />
            <div className="mt-3 flex flex-wrap justify-between text-xs text-slate-400">
              <span>Deadline {deadlineText}</span>
              <span>Fee accrued {campaign.feeAccruedKas.toFixed(1)} KAS</span>
            </div>
          </div>
          <dl className="grid gap-3 text-sm text-slate-300/80 sm:grid-cols-2">
            <div>
              <dt className="uppercase tracking-[0.2em] text-kaspa-200">Creator</dt>
              <dd className="mt-1 text-white">{shortAddress(campaign.creator)}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.2em] text-kaspa-200">Beneficiary</dt>
              <dd className="mt-1 text-white">{shortAddress(campaign.beneficiary)}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.2em] text-kaspa-200">Campaign contract</dt>
              <dd className="mt-1 text-white break-all">{campaign.address}</dd>
            </div>
            {campaign.metadata.metadataUri && (
              <div>
                <dt className="uppercase tracking-[0.2em] text-kaspa-200">Metadata</dt>
                <dd className="mt-1">
                  <a
                    className="text-kaspa-200 hover:text-white"
                    href={campaign.metadata.metadataUri}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {campaign.metadata.metadataUri}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="w-full max-w-sm">
          <ContributePanel campaignAddress={campaign.address} />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">On-chain activity</h2>
        <CampaignTimeline
          contributions={contributionEvents}
          finalize={campaign.finalized}
          refunds={campaign.refunds}
        />
      </section>
    </div>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
