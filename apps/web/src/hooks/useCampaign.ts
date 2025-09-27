"use client";

import { useQuery } from "@tanstack/react-query";
import type { CampaignDetail } from "@/types/campaign";
import { fetchJson } from "@/lib/fetcher";

interface CampaignResponse {
  data: CampaignDetail;
}

export function useCampaign(address: string | undefined) {
  return useQuery({
    queryKey: ["campaign", address?.toLowerCase()],
    enabled: Boolean(address),
    queryFn: async () =>
      fetchJson<CampaignResponse>(`/api/campaign/${address}`),
    select: (response) => response.data,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
