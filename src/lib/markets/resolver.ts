import { getServerClient } from "@/lib/supabase/client";

export interface ResolutionResult {
  success: boolean;
  marketId: string;
  resolution: number;
  winnersCount: number;
  losersCount: number;
  totalPayout: number;
  error?: string;
}

/**
 * Resolve a market by setting the winning outcome.
 * resolution: 0 = Yes wins, 1 = No wins
 */
export async function resolveMarket(
  marketId: string,
  resolution: number,
  resolvedBy: string
): Promise<ResolutionResult> {
  const supabase = getServerClient();

  // Verify market exists and is open
  const { data: market, error: fetchError } = await supabase
    .from("markets")
    .select("*")
    .eq("market_id", marketId)
    .single();

  if (fetchError || !market) {
    return { success: false, marketId, resolution, winnersCount: 0, losersCount: 0, totalPayout: 0, error: "Market not found" };
  }

  if (market.status !== "open") {
    return { success: false, marketId, resolution, winnersCount: 0, losersCount: 0, totalPayout: 0, error: "Market is not open" };
  }

  // Update market status
  const { error: updateError } = await supabase
    .from("markets")
    .update({
      status: "resolved",
      resolution,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    })
    .eq("market_id", marketId);

  if (updateError) {
    return { success: false, marketId, resolution, winnersCount: 0, losersCount: 0, totalPayout: 0, error: "Failed to update market" };
  }

  // Settle payouts
  return settlePayouts(marketId, resolution);
}

/**
 * Calculate and record payouts for all bets in a resolved market.
 * Winners receive shares * $1.00. Losers receive $0.
 */
export async function settlePayouts(
  marketId: string,
  resolution: number
): Promise<ResolutionResult> {
  const supabase = getServerClient();

  const { data: bets, error: betsError } = await supabase
    .from("market_bets")
    .select("*")
    .eq("market_id", marketId)
    .eq("settled", false);

  if (betsError || !bets) {
    return { success: false, marketId, resolution, winnersCount: 0, losersCount: 0, totalPayout: 0, error: "Failed to fetch bets" };
  }

  let winnersCount = 0;
  let losersCount = 0;
  let totalPayout = 0;

  for (const bet of bets) {
    const isWinner = bet.position === resolution;
    const payout = isWinner ? Number(bet.shares || bet.amount) * 1.0 : 0;

    // Update bet with payout info
    await supabase
      .from("market_bets")
      .update({
        payout,
        settled: true,
      })
      .eq("id", bet.id);

    // Record payout for winners
    if (isWinner && payout > 0) {
      await supabase.from("market_payouts").insert({
        market_id: marketId,
        bet_id: bet.id,
        user_wallet: bet.user_wallet,
        amount: payout,
      });
      winnersCount++;
      totalPayout += payout;
    } else {
      losersCount++;
    }
  }

  return {
    success: true,
    marketId,
    resolution,
    winnersCount,
    losersCount,
    totalPayout,
  };
}

/**
 * Check for expired markets that need auto-resolution.
 * Price markets with price_feed resolution source are auto-resolved.
 */
export async function checkExpiredMarkets(): Promise<string[]> {
  const supabase = getServerClient();
  const now = new Date().toISOString().split("T")[0];

  const { data: expired } = await supabase
    .from("markets")
    .select("*")
    .eq("status", "open")
    .lte("end_date", now);

  const resolved: string[] = [];

  if (!expired) return resolved;

  for (const market of expired) {
    if (market.market_type === "price" && market.resolution_source === "price_feed") {
      // For price markets, default resolution is No (1) if no price feed available
      // In production, this would call an oracle/price feed API
      const result = await resolveMarket(market.market_id, 1, "auto_resolver");
      if (result.success) resolved.push(market.market_id);
    }
    // Manual binary markets that have expired stay open until creator resolves them
  }

  return resolved;
}
