import { NextResponse } from "next/server";
import { platformStats } from "@/lib/mock-data";

export const revalidate = 15;

export function GET() {
  return NextResponse.json({ data: platformStats });
}
