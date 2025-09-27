"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CampaignSummary, PlatformStats } from "@/types/campaign";
import { fetchJson } from "@/lib/fetcher";

interface CampaignsResponse {
  data: CampaignSummary[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    stats: PlatformStats;
  };
}

interface UseCampaignsParams {
  limit?: number;
  offset?: number;
}

export function useCampaigns(params: UseCampaignsParams = {}) {
  const searchParams = useMemo(() => {
    const query = new URLSearchParams();
    if (params.limit != null) {
      query.set("limit", String(params.limit));
    }
    if (params.offset != null) {
      query.set("offset", String(params.offset));
    }
    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
  }, [params.limit, params.offset]);

  return useQuery({
    queryKey: ["campaigns", params.limit, params.offset],
    queryFn: async () =>
      fetchJson<CampaignsResponse>(`/api/campaigns${searchParams}`),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
