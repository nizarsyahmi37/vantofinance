"use client";

import { formatCurrency, timeAgo } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Expense } from "@/lib/supabase/client";

const categoryColors: Record<string, string> = {
  Food: "bg-orange-100 text-orange-700",
  Transport: "bg-blue-100 text-blue-700",
  Shopping: "bg-pink-100 text-pink-700",
  Entertainment: "bg-purple-100 text-purple-700",
  Bills: "bg-gray-100 text-gray-700",
  Health: "bg-green-100 text-green-700",
  Education: "bg-indigo-100 text-indigo-700",
  Travel: "bg-cyan-100 text-cyan-700",
  Other: "bg-gray-100 text-gray-600",
};

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No expenses yet. Start making payments!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                expense.direction === "in" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {expense.direction === "in" ? (
                <ArrowDownRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {expense.description || expense.memo_raw}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    categoryColors[expense.category] || categoryColors.Other
                  }`}
                >
                  {expense.category}
                </span>
                <span className="text-xs text-gray-400">
                  {timeAgo(expense.created_at)}
                </span>
              </div>
            </div>
          </div>

          <p
            className={`text-sm font-semibold ${
              expense.direction === "in" ? "text-green-600" : "text-gray-900"
            }`}
          >
            {expense.direction === "in" ? "+" : "-"}
            {formatCurrency(expense.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}
