import { NextResponse } from "next/server";
import { mockCampaigns, platformStats } from "@/lib/mock-data";

export const revalidate = 15;

export function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

  const items = mockCampaigns.slice(safeOffset, safeOffset + safeLimit);

  return NextResponse.json({
    data: items,
    meta: {
      total: mockCampaigns.length,
      limit: safeLimit,
      offset: safeOffset,
      stats: platformStats,
    },
  });
}
