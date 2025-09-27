import { formatDistanceToNow } from "date-fns";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export interface CampaignCardProps {
  title: string;
  summary: string;
  goalKas: number;
  raisedKas: number;
  deadline: string;
  address: string;
  metadataUri?: string;
}

export default function CampaignCard({
  title,
  summary,
  goalKas,
  raisedKas,
  deadline,
  address,
  metadataUri,
}: CampaignCardProps) {
  const progress = Math.min(100, Math.round((raisedKas / goalKas) * 100));
  const deadlineText = formatDistanceToNow(new Date(deadline), { addSuffix: true });

  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-kaspa-night/70 p-6 shadow-[0_25px_70px_rgba(6,40,52,0.5)] transition hover:border-kaspa-300/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300/85">{summary}</p>
        </div>
        <Link
          href={`https://explorer.testnet.kasplextest.xyz/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-kaspa-200 hover:text-kaspa-100"
        >
          View
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-300/80">Raised</span>
          <span className="text-sm font-semibold text-kaspa-200">
            {raisedKas.toLocaleString()} / {goalKas.toLocaleString()} KAS
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kaspa-300 via-kaspa-blue-400 to-kaspa-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-300/70">
          <span>Deadline {deadlineText}</span>
          <span className="uppercase tracking-[0.2em] text-kaspa-200">Live</span>
        </div>
      </div>

      {metadataUri && (
        <Link
          href={metadataUri}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-kaspa-300/40 px-3 py-1 text-xs text-kaspa-200 transition hover:border-kaspa-200 hover:text-white"
        >
          Metadata
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Link>
      )}
    </article>
  );
}
