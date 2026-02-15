import { getServerClient } from "@/lib/supabase/client";
import { calculateProbability, calculateSharePrice } from "@/lib/markets/pricing";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;
  const supabase = getServerClient();

  const { data: market, error } = await supabase
    .from("markets")
    .select("*, market_bets(*)")
    .eq("market_id", marketId)
    .single();

  if (error || !market) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  const bets = market.market_bets || [];
  const yesProbability = calculateProbability(market, bets, 0);
  const noProbability = calculateProbability(market, bets, 1);

  return NextResponse.json({
    market: {
      ...market,
      probabilities: {
        yes: yesProbability,
        no: noProbability,
      },
      sharePrices: {
        yes: calculateSharePrice(yesProbability),
        no: calculateSharePrice(noProbability),
      },
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;
  const supabase = getServerClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("markets")
    .update(body)
    .eq("market_id", marketId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ market: data });
}
