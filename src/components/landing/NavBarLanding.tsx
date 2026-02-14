"use client";

import { Zap } from "lucide-react";
import {motion } from "framer-motion";

interface NavbarProps {
	onLogin: () => void;
}

export default function NavbarLanding({ onLogin }: NavbarProps) {
	return (
    <motion.nav 
      className="sticky top-0 min-h-78 flex items-center w-full justify-center bg-blur z-50"
      initial = {{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1}}
      transition={{ duration: 0.3, ease: "easeOut"}}
      >
      <div className="flex items-center justify-between px-6 py-4 w-full max-w-6xl mx auto">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-vanto-600 flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-vanto-50">Vanto</span>
      </div>
      <button
        onClick={onLogin}
        className="px-4 py-2 rounded-lg bg-vanto-600 text-sm font-medium hover:bg-vanto-700 text-white transition-colors"
      >
        Get Started
      </button>
      </div>
    </motion.nav>
	);
}

