import { env } from "./env";
import {
  mockCampaigns,
  platformStats,
  getCampaignByAddress as getMockCampaignByAddress,
} from "./mock-data";
import type { CampaignDetail, PlatformStats } from "@/types/campaign";

type CampaignListResponse = {
  data: CampaignDetail[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    stats: PlatformStats;
  };
};

type CampaignResponse = {
  data: CampaignDetail;
};

type StatsResponse = {
  data: PlatformStats;
};

const INDEXER_TIMEOUT = 6_000;

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), INDEXER_TIMEOUT);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      },
      next: {
        revalidate: 10,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCampaignsFromIndexer(
  limit: number,
  offset: number,
): Promise<CampaignListResponse | null> {
  if (!env.indexerBaseUrl) {
    return null;
  }

  try {
    const url = new URL("/campaigns", env.indexerBaseUrl);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const response = await fetchWithTimeout(url.toString());
    if (!response.ok) {
      console.warn(
        "Indexer responded with status",
        response.status,
        await response.text(),
      );
      return null;
    }

    const json = (await response.json()) as CampaignListResponse;
    if (!Array.isArray(json.data)) {
      console.warn("Indexer payload missing data array");
      return null;
    }

    return json;
  } catch (error) {
    console.warn("Failed to reach indexer", error);
    return null;
  }
}

export async function fetchCampaignFromIndexer(
  address: string,
): Promise<CampaignResponse | null> {
  if (!env.indexerBaseUrl) {
    return null;
  }

  try {
    const url = new URL(`/campaign/${address}`, env.indexerBaseUrl);
    const response = await fetchWithTimeout(url.toString());
    if (!response.ok) {
      console.warn(
        "Indexer responded with status",
        response.status,
        await response.text(),
      );
      return null;
    }

    const json = (await response.json()) as CampaignResponse;
    if (!json?.data) {
      console.warn("Indexer payload missing campaign data");
      return null;
    }

    return json;
  } catch (error) {
    console.warn("Failed to reach indexer", error);
    return null;
  }
}

export async function fetchStatsFromIndexer(): Promise<StatsResponse | null> {
  if (!env.indexerBaseUrl) {
    return null;
  }

  try {
    const url = new URL("/stats", env.indexerBaseUrl);
    const response = await fetchWithTimeout(url.toString());
    if (!response.ok) {
      console.warn(
        "Indexer responded with status",
        response.status,
        await response.text(),
      );
      return null;
    }

    const json = (await response.json()) as StatsResponse;
    if (!json?.data) {
      console.warn("Indexer payload missing stats data");
      return null;
    }

    return json;
  } catch (error) {
    console.warn("Failed to reach indexer", error);
    return null;
  }
}

export function getFallbackCampaigns(limit: number, offset: number) {
  const data = mockCampaigns.slice(offset, offset + limit);
  return {
    data,
    meta: {
      total: mockCampaigns.length,
      limit,
      offset,
      stats: platformStats,
    },
  } satisfies CampaignListResponse;
}

export function getFallbackCampaign(address: string) {
  const campaign = getMockCampaignByAddress(address);
  if (!campaign) {
    return null;
  }

  return {
    data: campaign,
  } satisfies CampaignResponse;
}

export function getFallbackStats() {
  return {
    data: platformStats,
  } satisfies StatsResponse;
}
