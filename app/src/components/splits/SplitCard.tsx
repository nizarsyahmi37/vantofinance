"use client";

import { formatCurrency, formatDate, shortenAddress } from "@/lib/utils";
import { Users, CheckCircle, Clock } from "lucide-react";

interface SplitCardProps {
  split: any;
}

export function SplitCard({ split }: SplitCardProps) {
  const members = split.split_members || [];
  const paidCount = members.filter((m: any) => m.paid).length;
  const totalMembers = members.length;
  const progress = totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{split.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalMembers} people &middot; {formatCurrency(split.total_amount)} total
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            split.status === "settled"
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {split.status === "settled" ? "Settled" : "Active"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{paidCount}/{totalMembers} paid</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-pulse-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Members */}
      <div className="mt-3 space-y-1.5">
        {members.map((member: any) => (
          <div
            key={member.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              {member.paid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-gray-300" />
              )}
              <span className={member.paid ? "text-gray-500" : "text-gray-700"}>
                {member.identifier || shortenAddress(member.wallet)}
              </span>
            </div>
            <span className="font-medium text-gray-700">
              {formatCurrency(member.amount)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t">
        Created {formatDate(split.created_at)}
      </p>
    </div>
  );
}
