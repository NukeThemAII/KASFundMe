"use client";

import { useQuery } from "@tanstack/react-query";
import type { PlatformStats } from "@/types/campaign";
import { fetchJson } from "@/lib/fetcher";

interface StatsResponse {
  data: PlatformStats;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => fetchJson<StatsResponse>("/api/stats"),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
