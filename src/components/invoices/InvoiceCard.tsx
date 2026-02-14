"use client";

import { formatCurrency, formatDate, shortenAddress } from "@/lib/utils";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Invoice } from "@/lib/supabase/client";

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
  paid: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Paid" },
  overdue: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Overdue" },
};

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const status = statusConfig[invoice.status];
  const StatusIcon = status.icon;

  return (
    <div className="rounded-xl border bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-pulse-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-pulse-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{invoice.description}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              To: {invoice.recipient_identifier || shortenAddress(invoice.recipient_wallet || "")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Memo: INV:{invoice.memo_hash}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</p>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${status.bg} ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-400">
        <span>Created {formatDate(invoice.created_at)}</span>
        {invoice.due_date && <span>Due {formatDate(invoice.due_date)}</span>}
        {invoice.paid_tx_hash && (
          <a
            href={`https://explore.tempo.xyz/tx/${invoice.paid_tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pulse-600 hover:underline"
          >
            View tx
          </a>
        )}
      </div>
    </div>
  );
}
