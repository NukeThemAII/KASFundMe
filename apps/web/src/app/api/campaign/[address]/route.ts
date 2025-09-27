import { NextResponse } from "next/server";
import { fetchCampaignFromIndexer } from "@/lib/indexer-client";

export const revalidate = 15;

export async function GET(
  _request: Request,
  { params }: { params: { address: string } },
) {
  const campaign = await fetchCampaignFromIndexer(params.address);
  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(
    { data: campaign },
    {
      headers: {
        "x-kasfundme-source": campaign.metadata.metadataUri ? "indexer" : "mock",
      },
    },
  );
}
