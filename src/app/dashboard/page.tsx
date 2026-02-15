"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { InvoiceCard } from "@/components/invoices/InvoiceCard";
import { FileText, Receipt, Users, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!wallet) return;

    fetch(`/api/expenses?wallet=${wallet}&days=7`)
      .then((r) => r.json())
      .then((d) => setRecentExpenses((d.expenses || []).slice(0, 7)))
      .catch(() => {});

    fetch(`/api/invoices?wallet=${wallet}&direction=sent&status=pending`)
      .then((r) => r.json())
      .then((d) => setPendingInvoices((d.invoices || []).slice(0, 3)))
      .catch(() => {});
  }, [wallet]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back! Here&apos;s your financial overview.
        </p>
      </div>

      <BalanceCard />
      <div className="grid grid-cols-2-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-2 mb-2">
        {[
          { label: "This Week", value: `$${recentExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}`, icon: Receipt, href: "/dashboard/expenses", color: "text-orange-600 bg-orange-50" },
          { label: "Pending Invoices", value: pendingInvoices.length, icon: FileText, href: "/dashboard/invoices", color: "text-blue-600 bg-blue-50" },
          { label: "Active Splits", value: "--", icon: Users, href: "/dashboard/splits", color: "text-purple-600 bg-purple-50" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl bg-white p-6 hover:bg-gray-100 hover:shadow-sm transition-transform hover:scale-103 hover:border hover:-mb-0.5"
          >
            <div className="flex items-center gap-8">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart />

        {/* ACCORDION CARD */}
        <div className="flex flex-col items-center justify-between rounded-xl border bg-white overflow-hidden">
          <button
            onClick={() => recentExpenses.length > 0 && setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            disabled={recentExpenses.length === 0}
          >
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            {recentExpenses.length > 0 && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            )}
          </button>

          {!isExpanded && (
            <div className="px-6 pb-4">
              {recentExpenses.length > 0 ? (
                <ExpenseList expenses={[recentExpenses[0]]} />
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">No expenses yet</p>
              )}
            </div>
          )}

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  {recentExpenses.length > 0 ? (
                    <ExpenseList expenses={recentExpenses} />
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-4">No expenses yet</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-6 py-3 flex w-full justify-end">
            <Link href="/dashboard/expenses" className="text-sm text-vanto-600">
              View all
            </Link>
          </div>
        </div>
      </div>

      {pendingInvoices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Invoices</h3>
            <Link href="/dashboard/invoices" className="text-sm text-vanto-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingInvoices.map((inv) => (
              <InvoiceCard key={inv.id} invoice={inv} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}