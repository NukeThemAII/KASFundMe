"use client";

import { useQuery } from "@tanstack/react-query";
import type { CampaignDetail, ContributionEvent } from "@/types/campaign";
import { fetchJson } from "@/lib/fetcher";

interface CampaignResponse {
  data: Pick<CampaignDetail, "contributions">;
}

export function useContributions(address: string | undefined) {
  return useQuery({
    queryKey: ["campaign", address?.toLowerCase()],
    enabled: Boolean(address),
    queryFn: async () =>
      fetchJson<CampaignResponse>(`/api/campaign/${address}`),
    select: (response): ContributionEvent[] => response.data.contributions,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
