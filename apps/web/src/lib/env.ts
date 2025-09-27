const WALLETCONNECT_FALLBACK = "00000000000000000000000000000000";

export const env = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.kasplextest.xyz",
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? WALLETCONNECT_FALLBACK,
};

export const isUsingFallbackProjectId =
  env.walletConnectProjectId === WALLETCONNECT_FALLBACK;
