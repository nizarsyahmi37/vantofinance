"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function BalanceCard() {
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) return;
    fetch(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "check balance" }],
        userWallet: wallet,
      }),
    }).catch(() => {});
  }, [wallet]);

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {balance ? `$${parseFloat(balance).toFixed(2)}` : "$---.--"}
          </p>
          <p className="text-xs text-gray-400 mt-1">AlphaUSD on Tempo</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-vanto-100 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-vanto-600" />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <ArrowDownRight className="w-3.5 h-3.5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Received</p>
            <p className="text-sm font-medium text-gray-700">$--</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Sent</p>
            <p className="text-sm font-medium text-gray-700">$--</p>
          </div>
        </div>
      </div>
    </div>
  );
}
