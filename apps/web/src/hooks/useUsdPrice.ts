"use client";

import { useQuery } from "@tanstack/react-query";

interface KaspaPriceResponse {
  kaspa: {
    usd: number;
  };
}

const API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd";

export function useUsdPrice() {
  const enabled =
    typeof process.env.NEXT_PUBLIC_ENABLE_USD_PRICE === "undefined" ||
    process.env.NEXT_PUBLIC_ENABLE_USD_PRICE !== "false";

  return useQuery({
    queryKey: ["kaspa-usd"],
    enabled,
    queryFn: async () => {
      const response = await fetch(API_URL, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch KAS → USD price");
      }
      const json = (await response.json()) as KaspaPriceResponse;
      return json.kaspa?.usd ?? null;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}
