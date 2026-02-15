import type { Market, MarketBet } from "@/lib/supabase/client";

const PLATFORM_FEE = 0.02; // 2% fee margin

export interface BetQuote {
  probability: number;
  sharePrice: number;
  shares: number;
  potentialPayout: number;
  impliedOdds: string;
  stake: number;
}

/**
 * Calculate probability for a given position based on pool-weighted odds.
 * For binary markets: uses total amounts bet on each side with a fee margin.
 * For price markets: uses a simplified Black-Scholes-inspired model.
 */
export function calculateProbability(
  market: Market,
  bets: MarketBet[],
  position: number
): number {
  if (market.market_type === "price") {
    return calculatePriceProbability(market);
  }

  const yesBets = bets.filter((b) => b.position === 0);
  const noBets = bets.filter((b) => b.position === 1);
  const yesTotal = yesBets.reduce((s, b) => s + Number(b.amount), 0);
  const noTotal = noBets.reduce((s, b) => s + Number(b.amount), 0);
  const total = yesTotal + noTotal;

  if (total === 0) return 0.5;

  const rawProb = position === 0 ? yesTotal / total : noTotal / total;
  // Apply fee margin — shift toward 0.5 slightly
  return Math.max(0.01, Math.min(0.99, rawProb * (1 - PLATFORM_FEE) + PLATFORM_FEE / 2));
}

/**
 * Simplified Black-Scholes-inspired probability for price markets.
 * Adjusts based on time to expiry — closer to expiry means more extreme probabilities.
 */
function calculatePriceProbability(market: Market): number {
  const now = Date.now();
  const endDate = new Date(market.end_date).getTime();
  const totalDuration = endDate - new Date(market.created_at).getTime();
  const timeRemaining = Math.max(0, endDate - now);
  const timeRatio = totalDuration > 0 ? timeRemaining / totalDuration : 0;

  // Implied volatility decreases as we approach expiry
  const impliedVol = 0.5 * Math.sqrt(timeRatio);

  // Base probability is 0.5, adjusted by volatility
  // As time passes and no resolution, probability drifts toward 0.5
  const baseProbability = 0.5;
  const probability = baseProbability + (0.5 - baseProbability) * (1 - impliedVol);

  return Math.max(0.01, Math.min(0.99, probability));
}

/**
 * Price per share equals the probability of that outcome.
 * Yes shares at 0.60 probability cost $0.60 each.
 */
export function calculateSharePrice(probability: number): number {
  return Math.max(0.01, Math.min(0.99, probability));
}

/**
 * Number of shares = stake / share price (probability).
 */
export function calculateShares(stake: number, probability: number): number {
  const price = calculateSharePrice(probability);
  return stake / price;
}

/**
 * Potential payout if the position wins = shares * $1.00.
 */
export function calculatePotentialPayout(shares: number): number {
  return shares * 1.0;
}

/**
 * Generate a full quote for a potential bet.
 */
export function calculateQuote(
  market: Market,
  bets: MarketBet[],
  position: number,
  stake: number
): BetQuote {
  const probability = calculateProbability(market, bets, position);
  const sharePrice = calculateSharePrice(probability);
  const shares = calculateShares(stake, probability);
  const potentialPayout = calculatePotentialPayout(shares);
  const impliedOdds = `${(probability * 100).toFixed(1)}%`;

  return {
    probability,
    sharePrice,
    shares,
    potentialPayout,
    impliedOdds,
    stake,
  };
}
