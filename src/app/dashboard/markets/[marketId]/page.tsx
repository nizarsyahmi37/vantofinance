"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.marketId as string;
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;

  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quoteAmount, setQuoteAmount] = useState("10");
  const [quotePosition, setQuotePosition] = useState<"yes" | "no">("yes");
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/markets/${marketId}`)
      .then((r) => r.json())
      .then((d) => setMarket(d.market))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [marketId]);

  const fetchQuote = async () => {
    if (!quoteAmount || parseFloat(quoteAmount) <= 0) return;
    setQuoteLoading(true);
    try {
      const posIndex = quotePosition === "yes" ? 0 : 1;
      // Calculate quote client-side using market data
      const bets = market?.market_bets || [];
      const yesBets = bets.filter((b: any) => b.position === 0);
      const noBets = bets.filter((b: any) => b.position === 1);
      const yesTotal = yesBets.reduce((s: number, b: any) => s + Number(b.amount), 0);
      const noTotal = noBets.reduce((s: number, b: any) => s + Number(b.amount), 0);
      const total = yesTotal + noTotal;

      let probability = 0.5;
      if (total > 0) {
        const rawProb = posIndex === 0 ? yesTotal / total : noTotal / total;
        probability = Math.max(0.01, Math.min(0.99, rawProb * 0.98 + 0.01));
      }

      const sharePrice = probability;
      const shares = parseFloat(quoteAmount) / sharePrice;
      const potentialPayout = shares * 1.0;

      setQuote({
        probability,
        sharePrice,
        shares,
        potentialPayout,
        impliedOdds: `${(probability * 100).toFixed(1)}%`,
        stake: parseFloat(quoteAmount),
      });
    } catch {
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    if (market && market.status === "open") {
      fetchQuote();
    }
  }, [quoteAmount, quotePosition, market]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-4 border-vanto-200 border-t-vanto-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Market not found</h2>
        <Link href="/dashboard/markets" className="text-vanto-600 text-sm mt-2 inline-block">
          Back to markets
        </Link>
      </div>
    );
  }

  const bets = market.market_bets || [];
  const isResolved = market.status === "resolved";
  const isCreator = wallet && market.creator_wallet?.toLowerCase() === wallet.toLowerCase();
  const isPrice = market.market_type === "price";

  const yesProbability = market.probabilities?.yes || 0.5;
  const noProbability = market.probabilities?.no || 0.5;
  const yesPercent = Math.round(yesProbability * 100);

  const userBets = wallet
    ? bets.filter((b: any) => b.user_wallet?.toLowerCase() === wallet.toLowerCase())
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/markets"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to markets
      </Link>

      {/* Market header */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPrice ? "bg-amber-50" : "bg-indigo-50"}`}>
            {isPrice ? (
              <DollarSign className="w-6 h-6 text-amber-600" />
            ) : (
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isPrice && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                  Price
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  market.status === "open"
                    ? "bg-green-50 text-green-700"
                    : market.status === "resolved"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {market.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{market.question}</h1>
            {isPrice && market.asset_id && (
              <p className="text-sm text-gray-500 mt-1">
                {market.asset_id} {market.price_direction} ${Number(market.target_price).toLocaleString()}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {bets.length} bets
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Ends {formatDate(market.end_date)}
              </span>
              <span>Pool: {formatCurrency(market.total_pool)}</span>
            </div>
          </div>
        </div>

        {/* Resolution result */}
        {isResolved && (
          <div className={`mt-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
            market.resolution === 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {market.resolution === 0 ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            Resolved: {market.resolution === 0 ? "Yes" : "No"}
            {market.resolved_at && (
              <span className="text-xs ml-auto opacity-70">
                {new Date(market.resolved_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Probability bar */}
        {!isResolved && (
          <div className="mt-6">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-green-600">
                Yes {yesPercent}%
                <span className="text-gray-400 ml-1 text-xs">(${market.sharePrices?.yes?.toFixed(2) || "0.50"}/share)</span>
              </span>
              <span className="text-red-600">
                No {100 - yesPercent}%
                <span className="text-gray-400 ml-1 text-xs">(${market.sharePrices?.no?.toFixed(2) || "0.50"}/share)</span>
              </span>
            </div>
            <div className="w-full h-4 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${yesPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quote calculator (only for open markets) */}
      {!isResolved && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Bet Calculator</h2>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setQuotePosition("yes")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                quotePosition === "yes"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setQuotePosition("no")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                quotePosition === "no"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              No
            </button>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Amount ($)</label>
              <input
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                min="1"
                step="1"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="10"
              />
            </div>
          </div>

          {quote && !quoteLoading && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-500 text-xs">Share Price</span>
                <p className="font-semibold">${quote.sharePrice.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-500 text-xs">Shares</span>
                <p className="font-semibold">{quote.shares.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-500 text-xs">Probability</span>
                <p className="font-semibold">{quote.impliedOdds}</p>
              </div>
              <div className="bg-green-50 rounded-lg px-3 py-2">
                <span className="text-green-600 text-xs">Potential Payout</span>
                <p className="font-semibold text-green-700">${quote.potentialPayout.toFixed(2)}</p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Use the AI chat to place a bet: &ldquo;Bet ${quoteAmount} on {quotePosition} for market {market.market_id}&rdquo;
          </p>
        </div>
      )}

      {/* User's positions */}
      {userBets.length > 0 && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Your Positions</h2>
          <div className="space-y-3">
            {userBets.map((bet: any) => (
              <div key={bet.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className={`text-sm font-medium ${bet.position === 0 ? "text-green-600" : "text-red-600"}`}>
                    {bet.position === 0 ? "Yes" : "No"}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">${Number(bet.amount).toFixed(2)}</span>
                  {bet.shares && (
                    <span className="text-xs text-gray-400 ml-2">
                      ({Number(bet.shares).toFixed(2)} shares @ ${Number(bet.purchase_price).toFixed(2)})
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {bet.settled ? (
                    <span className={`text-sm font-medium ${Number(bet.payout) > 0 ? "text-green-600" : "text-red-600"}`}>
                      {Number(bet.payout) > 0 ? `Won $${Number(bet.payout).toFixed(2)}` : "Lost"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {bet.potential_payout ? `Potential: $${Number(bet.potential_payout).toFixed(2)}` : "Pending"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution controls for market creator */}
      {isCreator && !isResolved && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-800 mb-2">Resolve Market</h2>
          <p className="text-sm text-amber-600 mb-3">
            You created this market. Use the AI chat to resolve it:
          </p>
          <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
            &ldquo;Resolve market {market.market_id} to Yes&rdquo; or &ldquo;Resolve market {market.market_id} to No&rdquo;
          </p>
        </div>
      )}

      {/* Bet history */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Bet History ({bets.length})</h2>
        {bets.length === 0 ? (
          <p className="text-sm text-gray-400">No bets placed yet.</p>
        ) : (
          <div className="space-y-2">
            {bets
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((bet: any) => (
                <div key={bet.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${bet.position === 0 ? "bg-green-400" : "bg-red-400"}`} />
                    <span className="text-gray-600">
                      {bet.user_wallet?.slice(0, 6)}...{bet.user_wallet?.slice(-4)}
                    </span>
                    <span className={`font-medium ${bet.position === 0 ? "text-green-600" : "text-red-600"}`}>
                      {bet.position === 0 ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-700 font-medium">${Number(bet.amount).toFixed(2)}</span>
                    {bet.shares && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({Number(bet.shares).toFixed(1)} shares)
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-400 pb-4">
        Market ID: {market.market_id}
      </div>
    </div>
  );
}
