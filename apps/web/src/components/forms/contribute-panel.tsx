"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { useUsdPrice } from "@/hooks/useUsdPrice";
import { kasplexTestnet } from "@/lib/chains";
import { getCampaignConfig } from "@/lib/contracts";

interface ContributePanelProps {
  campaignAddress: string;
}

type ContributionFeedback =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "pending"; hash: `0x${string}` }
  | { status: "confirmed"; hash: `0x${string}` };

export default function ContributePanel({ campaignAddress }: ContributePanelProps) {
  const [amount, setAmount] = useState<string>("");
  const [feedback, setFeedback] = useState<ContributionFeedback>({ status: "idle" });
  const { data: kasUsd } = useUsdPrice();
  const { address: account, chainId, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const {
    data: txHash,
    error: writeError,
    isPending,
    reset: resetWrite,
    writeContractAsync,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    chainId: kasplexTestnet.id,
    hash: txHash,
    query: {
      enabled: Boolean(txHash),
    },
  });

  const campaignConfig = useMemo(() => getCampaignConfig(campaignAddress), [campaignAddress]);

  useEffect(() => {
    if (writeError) {
      setFeedback({ status: "error", message: writeError.message });
    }
  }, [writeError]);

  useEffect(() => {
    if (isSuccess && txHash) {
      setFeedback({ status: "confirmed", hash: txHash });
      setAmount("");
      resetWrite();
    }
  }, [isSuccess, txHash, resetWrite]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value);
    setFeedback({ status: "idle" });
  }

  const helperText = useMemo(() => {
    if (!isConnected) {
      return "Connect a wallet on Kasplex Testnet to contribute.";
    }
    if (chainId && chainId !== kasplexTestnet.id) {
      return "Switch to Kasplex Testnet (chainId 167012).";
    }
    if (!campaignConfig) {
      return "Campaign address is invalid.";
    }
    return null;
  }, [campaignConfig, chainId, isConnected]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!amount) {
      setFeedback({ status: "error", message: "Enter an amount in KAS before contributing." });
      return;
    }

    if (!campaignConfig) {
      setFeedback({ status: "error", message: "Campaign address is not valid." });
      return;
    }

    if (!isConnected || !account) {
      setFeedback({ status: "error", message: "Connect your wallet first." });
      return;
    }

    if (chainId && chainId !== kasplexTestnet.id && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: kasplexTestnet.id });
      } catch (switchError) {
        setFeedback({
          status: "error",
          message: (switchError as Error).message ?? "Failed to switch network.",
        });
        return;
      }
    }

    try {
      const hash = await writeContractAsync({
        address: campaignConfig.address,
        abi: campaignConfig.abi,
        functionName: "contribute",
        value: parseEther(amount),
      });

      setFeedback({ status: "pending", hash });
    } catch (error) {
      setFeedback({
        status: "error",
        message: (error as Error).message ?? "Failed to submit transaction.",
      });
    }
  }

  const usdValue = kasUsd && amount ? Number(amount || "0") * kasUsd : null;
  const isBusy = isPending || isConfirming || isSwitchingChain;

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
        {usdValue ? (
          <span className="text-xs text-slate-400">
            ≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </span>
        ) : (
          <span className="text-xs text-slate-500">
            USD preview appears once the public price endpoint responds.
          </span>
        )}
      </label>
      <button
        type="submit"
        disabled={isBusy}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-kaspa-blue-400 to-kaspa-400 px-5 py-3 text-sm font-semibold text-kaspa-night shadow-[0_15px_40px_rgba(20,152,255,0.35)] transition hover:shadow-[0_20px_50px_rgba(20,152,255,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isConfirming
          ? "Waiting for confirmations..."
          : isPending
            ? "Submitting contribution..."
            : isSwitchingChain
              ? "Switching network..."
              : "Contribute"}
      </button>
      {helperText && (
        <p className="text-xs text-kaspa-200/80">{helperText}</p>
      )}
      {feedback.status === "error" && (
        <p className="text-sm text-rose-300">{feedback.message}</p>
      )}
      {feedback.status === "pending" && (
        <p className="text-sm text-kaspa-200">
          Transaction submitted: {shortHash(feedback.hash)}. Monitor your wallet for confirmations.
        </p>
      )}
      {feedback.status === "confirmed" && (
        <p className="text-sm text-kaspa-200">
          Contribution confirmed! Tx hash {shortHash(feedback.hash)}
        </p>
      )}
    </form>
  );
}

function shortHash(hash: `0x${string}`) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
