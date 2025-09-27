import { NextResponse } from "next/server";
import { fetchStatsFromIndexer, getFallbackStats } from "@/lib/indexer-client";

export const revalidate = 15;

export async function GET() {
  const indexerResponse = await fetchStatsFromIndexer();
  if (indexerResponse) {
    return NextResponse.json(indexerResponse, {
      headers: {
        "x-kasfundme-source": "indexer",
      },
    });
  }

  return NextResponse.json(getFallbackStats(), {
    headers: {
      "x-kasfundme-source": "mock",
    },
  });
}
