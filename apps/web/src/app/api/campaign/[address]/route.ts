import { NextResponse } from "next/server";
import { getCampaignByAddress } from "@/lib/mock-data";

export const revalidate = 15;

export function GET(
  _request: Request,
  { params }: { params: { address: string } },
) {
  const campaign = getCampaignByAddress(params.address);
  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({ data: campaign });
}
