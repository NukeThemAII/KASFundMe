import { NextResponse } from "next/server";
import {
  fetchCampaignFromIndexer,
  getFallbackCampaign,
} from "@/lib/indexer-client";

export const revalidate = 15;

export async function GET(
  _request: Request,
  { params }: { params: { address: string } },
) {
  const indexerResponse = await fetchCampaignFromIndexer(params.address);
  if (indexerResponse) {
    return NextResponse.json(indexerResponse, {
      headers: {
        "x-kasfundme-source": "indexer",
      },
    });
  }

  const fallback = getFallbackCampaign(params.address);
  if (!fallback) {
    return NextResponse.json(
      { error: "Campaign not found" },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(fallback, {
    headers: {
      "x-kasfundme-source": "mock",
    },
  });
}
