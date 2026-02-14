"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { InvoiceCard } from "@/components/invoices/InvoiceCard";
import { FileText, Receipt, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!wallet) return;

    fetch(`/api/expenses?wallet=${wallet}&days=7`)
      .then((r) => r.json())
      .then((d) => setRecentExpenses((d.expenses || []).slice(0, 5)))
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

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard />

        {[
          { label: "Pending Invoices", value: pendingInvoices.length, icon: FileText, href: "/dashboard/invoices", color: "text-blue-600 bg-blue-50" },
          { label: "This Week", value: `$${recentExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}`, icon: Receipt, href: "/dashboard/expenses", color: "text-orange-600 bg-orange-50" },
          { label: "Active Splits", value: "--", icon: Users, href: "/dashboard/splits", color: "text-purple-600 bg-purple-50" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border bg-white p-6 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart />

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            <Link href="/dashboard/expenses" className="text-sm text-pulse-600 hover:underline">
              View all
            </Link>
          </div>
          <ExpenseList expenses={recentExpenses} />
        </div>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Invoices</h3>
            <Link href="/dashboard/invoices" className="text-sm text-pulse-600 hover:underline">
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
