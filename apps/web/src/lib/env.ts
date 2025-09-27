import { addresses } from "./addresses";

const WALLETCONNECT_FALLBACK = "00000000000000000000000000000000";

function normalizeAddress(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return undefined;
  return trimmed as `0x${string}`;
}

export const env = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.kasplextest.xyz",
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? WALLETCONNECT_FALLBACK,
  indexerBaseUrl:
    process.env.NEXT_PUBLIC_INDEXER_BASE_URL ?? process.env.INDEXER_BASE_URL ?? null,
  campaignFactoryAddress:
    normalizeAddress(
      process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS ??
        process.env.CAMPAIGN_FACTORY_ADDRESS ??
        addresses.campaignFactory,
    ),
  feeRecipientAddress:
    normalizeAddress(
      process.env.NEXT_PUBLIC_FEE_RECIPIENT_ADDRESS ??
        process.env.FEE_RECIPIENT_ADDRESS ??
        addresses.feeRecipient,
    ),
};

export const isUsingFallbackProjectId =
  env.walletConnectProjectId === WALLETCONNECT_FALLBACK;
