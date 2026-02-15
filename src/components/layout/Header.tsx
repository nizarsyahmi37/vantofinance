"use client";

import { usePrivy } from "@privy-io/react-auth";
import { shortenAddress } from "@/lib/utils";
import { LogOut, MessageSquare, Menu, ChevronDown, Copy, Check, WalletIcon, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onToggleChat: () => void;
  chatOpen: boolean;
  onToggleMenu?: () => void;
}

export function Header({ onToggleChat, chatOpen, onToggleMenu }: HeaderProps) {
  const { user, logout } = usePrivy();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const wallet = user?.wallet?.address;
  const email = user?.email?.address;
  const phone = user?.phone?.number;

  const handleCopy = async () => {
    if (wallet) {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Mask wallet address - show first 4 and last 4 characters
  const maskedWallet = wallet 
    ? `${wallet.slice(0, 6)}***${wallet.slice(-4)}`
    : null;

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Hamburger menu button - visible on mobile and tablet */}
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex items-center gap-2 cursor-default lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-vanto-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-vanto-800">Vanto</span>
        </div>
      </div>

      <div className="flex items-center gap-3">


        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-vanto-100 transition-colors hover:text-vanto-900"
          >
            <WalletIcon className="w-4 h-4"></WalletIcon>
            <span className="text-sm text-gray-700">
              {wallet ? shortenAddress(wallet) : email || phone || "User"}
            </span>
            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                
                {/* Dropdown Content */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20 overflow-hidden origin-top"
                >
                  <div className="">
                    {wallet && (
                      <div className="px-4 py-3 border-b hover:bg-gray-100">
                        <p className="text-xs text-gray-500 mb-1 cursor-pointer">Wallet Address</p>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs text-gray-900 cursor-pointer font-mono">
                            {maskedWallet}
                          </code>
                          <button
                            onClick={handleCopy}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                            title="Copy address"
                          >
                            <AnimatePresence mode="wait">
                              {copied ? (
                                <motion.div
                                  key="check"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Copy className="w-4 h-4 text-gray-400" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>
                      </div>
                    )}

                    {(email || phone) && (
                      <div className="px-4 py-3 border-b cursor-pointer hover:bg-gray-100">
                        <p className="text-xs text-gray-500 mb-1">
                          {email ? "Email" : "Phone"}
                        </p>
                        <p className="text-sm text-gray-900">
                          {email || phone}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
                <button
          onClick={onToggleChat}
          className={
            chatOpen
              ? "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-vanto-100 text-vanto-700"
              : "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-vanto-600 text-white hover:bg-vanto-700"
          }
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">AI Agent</span>
        </button>
      </div>
    </header>
  );
}