import { NextResponse } from "next/server";
import { fetchStatsFromIndexer } from "@/lib/indexer-client";

export const revalidate = 15;

export async function GET() {
  const stats = await fetchStatsFromIndexer();
  return NextResponse.json(
    { data: stats },
    {
      headers: {
        "x-kasfundme-source": stats ? "indexer" : "mock",
      },
    },
  );
}
