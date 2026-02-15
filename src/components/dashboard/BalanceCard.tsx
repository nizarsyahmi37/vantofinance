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
    <div className="p-6 cursor-default">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-bold">Total Balance</p>
          <p className="text-5xl font-bold font-mono text-gray-900 mt-1">
            {balance ? `$${parseFloat(balance).toFixed(2)}` : "$---.--"}
          </p>
          <p className="text-xs text-gray-400 mt-1">AlphaUSD</p>
        </div>
      </div>

      <div className="flex items-center gap-16 mt-4 pt-4  border-t">
        <div className="flex items-center gap-4 group transition-transform hover:scale-105">
          <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors">
            <ArrowDownRight className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors" strokeWidth={4}/>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold group-hover:text-gray-700 transition-colors">Received</p>
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">$--</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 group transition-transform hover:scale-105">
          <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
            <ArrowUpRight className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" strokeWidth={4}/>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-bold group-hover:text-gray-800 transition-colors">Sent</p>
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">$--</p>
          </div>
        </div>
      </div>
    </div>
  );
}