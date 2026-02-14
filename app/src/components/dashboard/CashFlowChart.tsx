"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  date: string;
  income: number;
  expenses: number;
}

export function CashFlowChart() {
  const { user } = usePrivy();
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (!user?.wallet?.address) return;

    fetch(`/api/expenses?wallet=${user.wallet.address}&days=30`)
      .then((res) => res.json())
      .then((result) => {
        // Group expenses by date
        const byDate: Record<string, { income: number; expenses: number }> = {};
        const today = new Date();

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          byDate[key] = { income: 0, expenses: 0 };
        }

        (result.expenses || []).forEach((e: any) => {
          const key = new Date(e.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          if (byDate[key]) {
            if (e.direction === "in") {
              byDate[key].income += e.amount;
            } else {
              byDate[key].expenses += e.amount;
            }
          }
        });

        setData(
          Object.entries(byDate).map(([date, values]) => ({
            date,
            ...values,
          }))
        );
      })
      .catch(() => {});
  }, [user?.wallet?.address]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold text-gray-900">Cash Flow</h3>
        <p className="text-sm text-gray-400 mt-1">Last 7 days</p>
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No transaction data yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-gray-900">Cash Flow</h3>
      <p className="text-sm text-gray-400 mt-1">Last 7 days</p>
      <div className="h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="income"
              stackId="1"
              stroke="#22c55e"
              fill="#dcfce7"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stackId="2"
              stroke="#ef4444"
              fill="#fef2f2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
