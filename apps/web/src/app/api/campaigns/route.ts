import { NextResponse } from "next/server";
import { fetchCampaignsFromIndexer } from "@/lib/indexer-client";

export const revalidate = 15;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

  const { campaigns, stats, total, source } = await fetchCampaignsFromIndexer(
    safeLimit,
    safeOffset,
  );

  return NextResponse.json(
    {
      data: campaigns,
      meta: {
        total,
        limit: safeLimit,
        offset: safeOffset,
        stats,
      },
    },
    {
      headers: {
        "x-kasfundme-source": source,
      },
    },
  );
}
