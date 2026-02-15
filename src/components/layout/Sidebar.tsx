"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  TrendingUp,
  Zap,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/splits", label: "Splits", icon: Users },
  { href: "/dashboard/markets", label: "Markets", icon: TrendingUp },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps = {}) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between gap-2 px-6 py-5 border-b">
        <div className="flex items-center cursor-default gap-2">
          <div className="w-8 h-8 rounded-lg bg-vanto-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-vanto-800">Vanto</span>
        </div>
        
        {/* Close button for mobile/tablet */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-vanto-50 text-vanto-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t">
        <div className="px-3 py-2 rounded-lg bg-vanto-50 text-xs text-vanto-700">
          <p className="font-medium">Powered by Tempo</p>
          <p className="text-vanto-500 mt-0.5">Gasless payments</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - visible on large screens (≥1024px) */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile/Tablet Drawer - visible on mobile and tablet (<1024px) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 flex flex-col border-r bg-white z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}