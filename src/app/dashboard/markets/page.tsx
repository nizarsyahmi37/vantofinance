"use client";

import { useEffect, useState } from "react";
import { MarketCard } from "@/components/markets/MarketCard";
import { TrendingUp } from "lucide-react";

export default function MarketsPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/markets?status=${statusFilter}`)
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prediction Markets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create markets, place bets, and win when you&apos;re right.
        </p>
      </div>

      {/* Filters */}
      <div className="flex rounded-lg border overflow-hidden w-fit">
        {["open", "resolved", "all"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              statusFilter === s
                ? "bg-pulse-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-pulse-200 border-t-pulse-600 rounded-full animate-spin mx-auto" />
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
    </div>
  );
}
