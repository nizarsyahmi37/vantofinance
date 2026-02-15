"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { MarketCard } from "@/components/markets/MarketCard";
import { TrendingUp, Plus, BarChart3 } from "lucide-react";

export default function MarketsPage() {
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;
  const [markets, setMarkets] = useState<any[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [tab, setTab] = useState<"markets" | "my-bets">("markets");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/markets?status=${statusFilter}`)
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  // Fetch user's bets when tab switches to my-bets
  useEffect(() => {
    if (tab !== "my-bets" || !wallet) return;
    fetch(`/api/markets?status=all`)
      .then((r) => r.json())
      .then((d) => {
        const allMarkets = d.markets || [];
        const marketsWithMyBets = allMarkets.filter((m: any) =>
          (m.market_bets || []).some(
            (b: any) => b.user_wallet?.toLowerCase() === wallet?.toLowerCase()
          )
        );
        setMyBets(marketsWithMyBets);
      })
      .catch(() => {});
  }, [tab, wallet]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prediction Markets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create markets, place bets, and win when you&apos;re right.
          </p>
        </div>
        <button
          onClick={() => {
            // Open chat with pre-filled command
            const event = new CustomEvent("open-chat", {
              detail: { message: "Create a prediction market: " },
            });
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-vanto-600 text-white rounded-lg text-sm font-medium hover:bg-vanto-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Market
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab("markets")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "markets"
              ? "border-vanto-600 text-vanto-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Markets
        </button>
        <button
          onClick={() => setTab("my-bets")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            tab === "my-bets"
              ? "border-vanto-600 text-vanto-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          My Bets
        </button>
      </div>

      {tab === "markets" && (
        <>
          {/* Filters */}
          <div className="flex rounded-lg border overflow-hidden w-fit">
            {["open", "resolved", "all"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  statusFilter === s
                    ? "bg-vanto-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-vanto-200 border-t-vanto-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-16 rounded-xl border bg-white">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-medium text-gray-600 mt-4">No markets yet</h3>
              <p className="text-sm text-gray-400 mt-1">
                Use the AI chat: &ldquo;Create a prediction market: Will BTC hit $100k by year end?&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {markets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "my-bets" && (
        <>
          {myBets.length === 0 ? (
            <div className="text-center py-16 rounded-xl border bg-white">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-medium text-gray-600 mt-4">No bets yet</h3>
              <p className="text-sm text-gray-400 mt-1">
                Place a bet on an open market to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
