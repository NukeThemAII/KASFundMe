"use client";

import { useQuery } from "@tanstack/react-query";
import type { ContributionEvent } from "@/types/campaign";
import { fetchJson } from "@/lib/fetcher";

interface CampaignResponse {
  data: {
    contributions: ContributionEvent[];
  };
}

export function useContributions(address: string | undefined) {
  return useQuery({
    queryKey: ["campaign-contributions", address?.toLowerCase()],
    enabled: Boolean(address),
    queryFn: async () =>
      fetchJson<CampaignResponse>(`/api/campaign/${address}`),
    select: (response): ContributionEvent[] => response.data.contributions,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
