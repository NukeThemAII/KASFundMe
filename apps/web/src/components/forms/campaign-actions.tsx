"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { kasplexTestnet } from "@/lib/chains";
import { campaignAbi } from "@/lib/contracts";
import type { CampaignDetail } from "@/types/campaign";

interface CampaignActionsProps {
  campaign: CampaignDetail;
}

type TxFeedback =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "pending"; hash: `0x${string}` }
  | { status: "confirmed"; hash: `0x${string}` };

export default function CampaignActions({ campaign }: CampaignActionsProps) {
  const [finalizeFeedback, setFinalizeFeedback] = useState<TxFeedback>({ status: "idle" });
  const [refundFeedback, setRefundFeedback] = useState<TxFeedback>({ status: "idle" });

  const { address: account, chainId, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const {
    data: finalizeHash,
    error: finalizeError,
    isPending: isFinalizePending,
    reset: resetFinalize,
    writeContractAsync: finalizeAsync,
  } = useWriteContract();

  const {
    isLoading: isFinalizing,
    isSuccess: finalizeSuccess,
  } = useWaitForTransactionReceipt({
    chainId: kasplexTestnet.id,
    hash: finalizeHash,
    query: {
      enabled: Boolean(finalizeHash),
    },
  });

  const {
    data: refundHash,
    error: refundError,
    isPending: isRefundPending,
    reset: resetRefund,
    writeContractAsync: refundAsync,
  } = useWriteContract();

  const {
    isLoading: isRefunding,
    isSuccess: refundSuccess,
  } = useWaitForTransactionReceipt({
    chainId: kasplexTestnet.id,
    hash: refundHash,
    query: {
      enabled: Boolean(refundHash),
    },
  });

  useEffect(() => {
    if (finalizeError) {
      setFinalizeFeedback({ status: "error", message: finalizeError.message });
    }
  }, [finalizeError]);

  useEffect(() => {
    if (refundError) {
      setRefundFeedback({ status: "error", message: refundError.message });
    }
  }, [refundError]);

  useEffect(() => {
    if (finalizeSuccess && finalizeHash) {
      setFinalizeFeedback({ status: "confirmed", hash: finalizeHash });
      resetFinalize();
    }
  }, [finalizeSuccess, finalizeHash, resetFinalize]);

  useEffect(() => {
    if (refundSuccess && refundHash) {
      setRefundFeedback({ status: "confirmed", hash: refundHash });
      resetRefund();
    }
  }, [refundSuccess, refundHash, resetRefund]);

  const deadlineMs = useMemo(() => new Date(campaign.deadline).getTime(), [campaign.deadline]);
  const nowMs = Date.now();
  const goalWei = BigInt(campaign.goalWei);
  const netRaisedWei = BigInt(campaign.netRaisedWei);

  const isFinalizable =
    campaign.status === "ACTIVE" && netRaisedWei >= goalWei && campaign.contributionCount > 0;

  const isRefundable = useMemo(() => {
    if (campaign.status === "SUCCESSFUL") return false;
    if (campaign.status === "FAILED") return true;
    const afterDeadline = nowMs >= deadlineMs;
    const goalMet = netRaisedWei >= goalWei;
    return afterDeadline && !goalMet;
  }, [campaign.status, deadlineMs, netRaisedWei, goalWei, nowMs]);

  async function ensureChain() {
    if (chainId && chainId !== kasplexTestnet.id && switchChainAsync) {
      await switchChainAsync({ chainId: kasplexTestnet.id });
    }
  }

  async function handleFinalize() {
    setFinalizeFeedback({ status: "idle" });
    try {
      await ensureChain();
      const hash = await finalizeAsync({
        address: campaign.address as `0x${string}`,
        abi: campaignAbi,
        functionName: "finalize",
      });
      setFinalizeFeedback({ status: "pending", hash });
    } catch (error) {
      setFinalizeFeedback({
        status: "error",
        message: (error as Error).message ?? "Failed to finalize.",
      });
    }
  }

  async function handleRefund() {
    setRefundFeedback({ status: "idle" });
    if (!isConnected || !account) {
      setRefundFeedback({ status: "error", message: "Connect your wallet first." });
      return;
    }

    try {
      await ensureChain();
      const hash = await refundAsync({
        address: campaign.address as `0x${string}`,
        abi: campaignAbi,
        functionName: "refund",
      });
      setRefundFeedback({ status: "pending", hash });
    } catch (error) {
      setRefundFeedback({
        status: "error",
        message: (error as Error).message ?? "Refund transaction failed.",
      });
    }
  }

  return (
    <div className="glass w-full rounded-3xl border border-kaspa-400/15 p-6">
      <h3 className="text-lg font-semibold text-white">Settlement actions</h3>
      <p className="mt-1 text-sm text-slate-300/80">
        Finalize campaigns that reach their goal or claim refunds once deadlines pass without success.
      </p>

      <div className="mt-5 space-y-5">
        <ActionCard
          title="Finalize"
          description="Distribute funds to the beneficiary and route the 1% fee once the goal is met."
          disabled={!isFinalizable || isFinalizePending || isFinalizing || isSwitchingChain}
          actionLabel=
            isFinalizing
              ? "Waiting for confirmations..."
              : isFinalizePending
                ? "Submitting finalize..."
                : isSwitchingChain
                  ? "Switching network..."
                  : "Finalize campaign"
          onAction={handleFinalize}
          helperText={!isFinalizable ? "Goal must be reached while campaign is active." : undefined}
          feedback={finalizeFeedback}
        />

        <ActionCard
          title="Claim refund"
          description="Withdraw your contribution if the campaign failed to reach its goal by the deadline."
          disabled={!isRefundable || isRefundPending || isRefunding || isSwitchingChain}
          actionLabel=
            isRefunding
              ? "Waiting for confirmations..."
              : isRefundPending
                ? "Submitting refund..."
                : isSwitchingChain
                  ? "Switching network..."
                  : "Claim refund"
          onAction={handleRefund}
          helperText={!isRefundable ? "Refunds are only available after the deadline when goals are unmet." : undefined}
          feedback={refundFeedback}
        />
      </div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled: boolean;
  helperText?: string;
  feedback: TxFeedback;
}

function ActionCard({
  title,
  description,
  actionLabel,
  onAction,
  disabled,
  helperText,
  feedback,
}: ActionCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-kaspa-night/60 p-5 text-sm text-slate-300/85">
      <div className="flex flex-col gap-2">
        <h4 className="text-base font-semibold text-white">{title}</h4>
        <p>{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-kaspa-300 to-kaspa-blue-500 px-4 py-2 text-sm font-semibold text-kaspa-night shadow-[0_15px_40px_rgba(20,240,210,0.35)] transition hover:shadow-[0_20px_55px_rgba(20,240,210,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {actionLabel}
      </button>
      {helperText && (
        <p className="mt-2 text-xs text-slate-500">{helperText}</p>
      )}
      {feedback.status === "error" && (
        <p className="mt-2 text-xs text-rose-300">{feedback.message}</p>
      )}
      {feedback.status === "pending" && (
        <p className="mt-2 text-xs text-kaspa-200">
          Transaction submitted: {shortHash(feedback.hash)}
        </p>
      )}
      {feedback.status === "confirmed" && (
        <p className="mt-2 text-xs text-kaspa-200">
          Confirmed on-chain: {shortHash(feedback.hash)}
        </p>
      )}
    </section>
  );
}

function shortHash(hash: `0x${string}`) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
