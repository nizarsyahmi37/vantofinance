"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, Users, Calendar } from "lucide-react";

interface MarketCardProps {
  market: any;
}

export function MarketCard({ market }: MarketCardProps) {
  const bets = market.market_bets || [];
  const yesBets = bets.filter((b: any) => b.position === 0);
  const noBets = bets.filter((b: any) => b.position === 1);
  const yesTotal = yesBets.reduce((s: number, b: any) => s + b.amount, 0);
  const noTotal = noBets.reduce((s: number, b: any) => s + b.amount, 0);
  const total = yesTotal + noTotal;
  const yesPercent = total > 0 ? Math.round((yesTotal / total) * 100) : 50;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{market.question}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {bets.length} bets
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Ends {formatDate(market.end_date)}
            </span>
          </div>
        </div>
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

      {/* Odds bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs font-medium mb-1">
          <span className="text-green-600">Yes {yesPercent}%</span>
          <span className="text-red-600">No {100 - yesPercent}%</span>
        </div>
        <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all"
            style={{ width: `${yesPercent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between mt-3 pt-3 border-t text-sm">
        <span className="text-gray-500">Pool: {formatCurrency(market.total_pool)}</span>
        <span className="text-gray-400 text-xs">ID: {market.market_id}</span>
      </div>
    </div>
  );
}
