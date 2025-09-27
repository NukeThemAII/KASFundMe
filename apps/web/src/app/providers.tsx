"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { WagmiProvider } from "wagmi";
import { kasplexTestnet } from "@/lib/chains";
import { isUsingFallbackProjectId } from "@/lib/env";
import { wagmiConfig } from "@/lib/wagmi";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (isUsingFallbackProjectId) {
      console.warn(
        "KASFundMe: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set. WalletConnect wallets may not open.",
      );
    }
  }, []);

  const theme = useMemo(
    () =>
      darkTheme({
        accentColor: "#14f1d9",
        accentColorForeground: "#04111f",
        borderRadius: "large",
        overlayBlur: "small",
      }),
    [],
  );

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={kasplexTestnet}
          theme={theme}
          showRecentTransactions
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
