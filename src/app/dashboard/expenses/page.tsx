"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { CategoryChart } from "@/components/expenses/CategoryChart";
import { formatCurrency } from "@/lib/utils";
import { Receipt } from "lucide-react";

const CATEGORIES = [
  "All",
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Education",
  "Travel",
  "Other",
];

export default function ExpensesPage() {
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;
  const [expenses, setExpenses] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("All");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) return;
    setLoading(true);
    const params = new URLSearchParams({ wallet, days: days.toString() });
    if (category !== "All") params.set("category", category);

    fetch(`/api/expenses?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setExpenses(d.expenses || []);
        setByCategory(d.byCategory || {});
        setTotal(d.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [wallet, category, days]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-categorized spending tracked from your transactions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-3 py-2 rounded-lg border text-sm text-gray-600 bg-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>

        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-vanto-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900">Spending Breakdown</h3>
          <p className="text-sm text-gray-400 mt-1">Last {days} days</p>
          <CategoryChart data={byCategory} />
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900">Summary</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-600">Total Spent</span>
              <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-600">Transactions</span>
              <span className="font-bold text-gray-900">{expenses.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-600">Avg per Transaction</span>
              <span className="font-bold text-gray-900">
                {expenses.length > 0
                  ? formatCurrency(total / expenses.length)
                  : "$0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense list */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold text-gray-900 mb-4">All Transactions</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-vanto-200 border-t-vanto-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <ExpenseList expenses={expenses} />
        )}
      </div>
    </div>
  );
}
