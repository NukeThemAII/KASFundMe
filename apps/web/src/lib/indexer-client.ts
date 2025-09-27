import { formatUnits } from "viem";
import { env } from "./env";
import {
  CampaignDetail,
  CampaignMetadata,
  CampaignSummary,
  ContributionEvent,
  FinalizeEvent,
  PlatformStats,
  RefundEvent,
} from "@/types/campaign";
import {
  CampaignDetailApi,
  CampaignSummaryApi,
  PlatformStatsApi,
  fallbackCampaignDetails,
  fallbackCampaignSummaries,
  fallbackPlatformStats,
} from "./mock-data";

interface CampaignListResponse {
  data: CampaignSummaryApi[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    stats: PlatformStatsApi;
  };
}

interface CampaignResponse {
  data: CampaignDetailApi;
}

function toKasNumber(value: string): number {
  try {
    return Number(formatUnits(BigInt(value), 18));
  } catch (error) {
    console.warn("Failed to parse wei", value, error);
    return 0;
  }
}

function resolveMetadataUri(uri?: string | null): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
  }
  return uri;
}

async function fetchMetadata(metadataUri?: string | null): Promise<CampaignMetadata> {
  if (!metadataUri) {
    return {
      title: "Untitled campaign",
      summary: "Metadata URI not provided.",
    };
  }

  const resolved = resolveMetadataUri(metadataUri);
  if (!resolved) {
    return {
      title: "Untitled campaign",
      summary: "Metadata URI not provided.",
      metadataUri,
    };
  }

  try {
    const response = await fetch(resolved, {
      cache: "no-cache",
    });
    if (!response.ok) {
      throw new Error(`Metadata fetch failed: ${response.status}`);
    }
    const json = (await response.json()) as Record<string, unknown>;
    const title = typeof json.title === "string" ? json.title : "Untitled campaign";
    const summary = typeof json.description === "string"
      ? json.description
      : typeof json.summary === "string"
        ? json.summary
        : "No description provided.";
    const image = typeof json.image === "string" ? resolveMetadataUri(json.image) : undefined;
    return {
      title,
      summary,
      metadataUri,
      image,
    };
  } catch (error) {
    console.warn("Failed to fetch metadata", metadataUri, error);
    return {
      title: "Untitled campaign",
      summary: "Metadata unavailable.",
      metadataUri,
    };
  }
}

async function mapSummary(api: CampaignSummaryApi): Promise<CampaignSummary> {
  const metadata = await fetchMetadata(api.metadataUri ?? undefined);
  return {
    address: api.address,
    creator: api.creator,
    beneficiary: api.beneficiary,
    goalWei: api.goalWei,
    goalKas: toKasNumber(api.goalWei),
    raisedWei: api.raisedWei,
    raisedKas: toKasNumber(api.raisedWei),
    netRaisedWei: api.netRaisedWei,
    netRaisedKas: toKasNumber(api.netRaisedWei),
    refundedWei: api.refundedWei,
    refundedKas: toKasNumber(api.refundedWei),
    feeAccruedWei: api.feeAccruedWei,
    feeAccruedKas: toKasNumber(api.feeAccruedWei),
    deadline: api.deadline,
    createdAt: api.createdAt,
    status: api.status as CampaignSummary["status"],
    chainId: api.chainId,
    feeBps: api.feeBps,
    contributionCount: api.contributionCount,
    supporterCount: api.supporterCount,
    metadata,
  };
}

async function mapDetail(api: CampaignDetailApi): Promise<CampaignDetail> {
  const summary = await mapSummary(api);
  const contributions: ContributionEvent[] = api.contributions.map((item) => ({
    id: item.id,
    txHash: item.txHash,
    contributor: item.contributor,
    amountWei: item.amountWei,
    amountKas: toKasNumber(item.amountWei),
    feeWei: item.feeWei,
    feeKas: toKasNumber(item.feeWei),
    blockNumber: item.blockNumber,
    blockTime: item.blockTime,
  }));

  const refunds: RefundEvent[] = api.refunds.map((item) => ({
    id: item.id,
    txHash: item.txHash,
    contributor: item.contributor,
    amountWei: item.amountWei,
    amountKas: toKasNumber(item.amountWei),
    blockNumber: item.blockNumber,
    blockTime: item.blockTime,
  }));

  const finalization: FinalizeEvent | null = api.finalization
    ? {
        caller: api.finalization.caller,
        beneficiary: api.finalization.beneficiary,
        payoutWei: api.finalization.payoutWei,
        payoutKas: toKasNumber(api.finalization.payoutWei),
        feeWei: api.finalization.feeWei,
        feeKas: toKasNumber(api.finalization.feeWei),
        txHash: api.finalization.txHash,
        blockNumber: api.finalization.blockNumber,
        blockTime: api.finalization.blockTime,
      }
    : null;

  return {
    ...summary,
    contributions,
    refunds,
    finalization,
  };
}

function mapPlatformStats(stats: PlatformStatsApi): PlatformStats {
  return {
    totalCampaigns: stats.totalCampaigns,
    totalRaisedWei: stats.totalRaisedWei,
    totalRaisedKas: toKasNumber(stats.totalRaisedWei),
    totalFeesWei: stats.totalFeesWei,
    totalFeesKas: toKasNumber(stats.totalFeesWei),
    totalRefundedWei: stats.totalRefundedWei,
    totalRefundedKas: toKasNumber(stats.totalRefundedWei),
    activeCampaigns: stats.activeCampaigns,
    contributors: stats.contributors,
  };
}

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6_000);
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCampaignsFromIndexer(
  limit: number,
  offset: number,
): Promise<{
  campaigns: CampaignSummary[];
  stats: PlatformStats;
  total: number;
  source: "indexer" | "mock";
}> {
  if (!env.indexerBaseUrl) {
    const summaries = await Promise.all(fallbackCampaignSummaries.map(mapSummary));
    return {
      campaigns: summaries,
      stats: mapPlatformStats(fallbackPlatformStats),
      total: fallbackCampaignSummaries.length,
      source: "mock",
    };
  }

  try {
    const url = new URL("/campaigns", env.indexerBaseUrl);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const response = await fetchWithTimeout(url.toString());
    if (!response.ok) {
      throw new Error(`Indexer error ${response.status}`);
    }

    const json = (await response.json()) as CampaignListResponse;
    const [campaigns, stats] = await Promise.all([
      Promise.all(json.data.map(mapSummary)),
      Promise.resolve(mapPlatformStats(json.meta.stats)),
    ]);

    return { campaigns, stats, total: json.meta.total, source: "indexer" };
  } catch (error) {
    console.warn("Failed to reach indexer", error);
    const summaries = await Promise.all(fallbackCampaignSummaries.map(mapSummary));
    return {
      campaigns: summaries,
      stats: mapPlatformStats(fallbackPlatformStats),
      total: fallbackCampaignSummaries.length,
      source: "mock",
    };
  }
}

export async function fetchCampaignFromIndexer(address: string): Promise<CampaignDetail | null> {
  const target = env.indexerBaseUrl;

  try {
    if (!target) {
      const fallback = fallbackCampaignDetails[address.toLowerCase()];
      return fallback ? mapDetail(fallback) : null;
    }

    const url = new URL(`/campaign/${address}`, target);
    const response = await fetchWithTimeout(url.toString());
    if (!response.ok) {
      throw new Error(`Indexer error ${response.status}`);
    }

    const json = (await response.json()) as CampaignResponse;
    return await mapDetail(json.data);
  } catch (error) {
    console.warn("Failed to fetch campaign from indexer", error);
    const fallback = fallbackCampaignDetails[address.toLowerCase()];
    return fallback ? mapDetail(fallback) : null;
  }
}

export async function fetchStatsFromIndexer(): Promise<PlatformStats | null> {
  const target = env.indexerBaseUrl;

  try {
    if (!target) {
      return mapPlatformStats(fallbackPlatformStats);
    }

    const url = new URL("/stats", target);
    const response = await fetchWithTimeout(url.toString());
    if (!response.ok) {
      throw new Error(`Indexer error ${response.status}`);
    }

    const json = (await response.json()) as { data: PlatformStatsApi };
    return mapPlatformStats(json.data);
  } catch (error) {
    console.warn("Failed to fetch stats from indexer", error);
    return mapPlatformStats(fallbackPlatformStats);
  }
}
