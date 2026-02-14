"use client";

import {
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useState, useRef } from "react";

interface NavbarProps {
    onLogin: () => void;
}

export default function Hero ({onLogin}:NavbarProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (!headingRef.current) return;
    
    const rect = headingRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  return (
  <section className="flex items-center justify-center w-screen min-h-[95vh] mx-auto px-6 pt-20 pb-16 text-center bg-gradient-to-b from-black from-0% via-blue-800 via-50% via-cyan-700 via-90% to-white to-100%">
    <div className="max-w-6xl">
      <div className="relative">
        {/* Blurred text layer (underneath) */}
        <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-8xl font-bold leading-tight text-white blur-md select-none">
          Your AI Financial Agent
          <br />
          <span className="text-cyan-300">on Tempo</span>
        </h1>

        {/* Sharp text layer with mask (on top) */}
        <h1 
          ref={headingRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setMousePosition({ x: 50, y: 50 });
          }}
          className="absolute inset-0 text-5xl sm:text-5xl md:text-6xl lg:text-8xl font-bold leading-tight text-white cursor-default select-none"
          style={{
            maskImage: `radial-gradient(circle 200px at ${mousePosition.x}% ${mousePosition.y}%, black 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle 200px at ${mousePosition.x}% ${mousePosition.y}%, black 0%, transparent 100%)`,
          }}
        >
          Your AI Financial Agent
          <br />
          <span className="text-cyan-300">on Tempo</span>
        </h1>
      </div>

      <p className="text-xl text-gray-100 mt-6 max-w-2xl mx-auto">
        Invoicing, expenses, payments, and predictions in one conversational
        interface. Just chat naturally - no crypto complexity.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <button
          onClick={onLogin}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
        >
          Start with Email or Phone
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-sm text-gray-200">No seed phrases. No gas fees. Just finance.</p>
      </div>
    </div>
  </section>
    );
}