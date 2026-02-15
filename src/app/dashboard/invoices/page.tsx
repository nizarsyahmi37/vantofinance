"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState, useCallback } from "react";
import { InvoiceCard } from "@/components/invoices/InvoiceCard";
import { FileText } from "lucide-react";

export default function InvoicesPage() {
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [direction, setDirection] = useState<"sent" | "received">("sent");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(() => {
    if (!wallet) return;
    setLoading(true);
    fetch(`/api/invoices?wallet=${wallet}&direction=${direction}&status=${statusFilter}`)
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [wallet, direction, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage invoices. Auto-reconciled via memo protocol.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border overflow-hidden">
          {(["sent", "received"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                direction === d
                  ? "bg-vanto-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm text-gray-600 bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-vanto-200 border-t-vanto-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-white">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-medium text-gray-600 mt-4">No invoices yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Use the AI chat to create your first invoice
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              direction={direction}
              onPaid={fetchInvoices}
            />
          ))}
        </div>
      )}
    </div>
  );
}
