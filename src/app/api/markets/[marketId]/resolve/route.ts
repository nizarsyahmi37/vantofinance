import { resolveMarket } from "@/lib/markets/resolver";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;
  const body = await request.json();
  const { resolution, resolvedBy } = body;

  if (resolution === undefined || resolution === null) {
    return NextResponse.json({ error: "resolution is required (0 = Yes, 1 = No)" }, { status: 400 });
  }

  if (!resolvedBy) {
    return NextResponse.json({ error: "resolvedBy wallet is required" }, { status: 400 });
  }

  const result = await resolveMarket(marketId, resolution, resolvedBy);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ result });
}
