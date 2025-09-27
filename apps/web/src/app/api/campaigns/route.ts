import { NextResponse } from "next/server";
import {
  fetchCampaignsFromIndexer,
  getFallbackCampaigns,
} from "@/lib/indexer-client";

export const revalidate = 15;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

  const indexerResponse = await fetchCampaignsFromIndexer(safeLimit, safeOffset);
  if (indexerResponse) {
    return NextResponse.json(indexerResponse, {
      headers: {
        "x-kasfundme-source": "indexer",
      },
    });
  }

  const fallback = getFallbackCampaigns(safeLimit, safeOffset);
  return NextResponse.json(fallback, {
    headers: {
      "x-kasfundme-source": "mock",
    },
  });
}
