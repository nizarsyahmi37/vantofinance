"use client";

import { usePrivy } from "@privy-io/react-auth";
import { shortenAddress } from "@/lib/utils";
import { LogOut, MessageSquare, Wallet } from "lucide-react";

interface HeaderProps {
  onToggleChat: () => void;
  chatOpen: boolean;
}

export function Header({ onToggleChat, chatOpen }: HeaderProps) {
  const { user, logout } = usePrivy();

  const wallet = user?.wallet?.address;
  const email = user?.email?.address;
  const phone = user?.phone?.number;

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900 md:hidden">Pulse</h1>
      </div>

      <div className="flex items-center gap-3">
        {wallet && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-gray-600">
            <Wallet className="w-4 h-4" />
            <span>{shortenAddress(wallet)}</span>
          </div>
        )}

        <button
          onClick={onToggleChat}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            chatOpen
              ? "bg-pulse-100 text-pulse-700"
              : "bg-pulse-600 text-white hover:bg-pulse-700"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">AI Agent</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {email || phone || "User"}
          </span>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
