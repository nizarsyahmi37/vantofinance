"use client";

import {
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
    onLogin: () => void;
}

export default function Hero ({onLogin}:NavbarProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const animationRef = useRef<number>();

  // Smooth animation with different speeds for hover vs unhover
  useEffect(() => {
    const animate = () => {
      setMousePosition(prev => {
        const dx = targetPosition.x - prev.x;
        const dy = targetPosition.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1) {
          return targetPosition;
        }

        // Fast when hovering (0.3), slow when unhovering (0.03)
        const speed = isHovering ? 0.3 : 0.02;

        return {
          x: prev.x + dx * speed,
          y: prev.y + dy * speed,
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition, isHovering]);

  const handleMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (!headingRef.current) return;
    
    const rect = headingRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setTargetPosition({ x, y });
  };

  return (
  <section className="flex items-center justify-center w-screen min-h-screen mx-auto px-4 py-6 text-center bg-gradient-to-b from-black from-0% via-vanto-800 via-40% via-vanto-600 via-70% via-vanto-400 via-88% to-white to-100%">
    <div className="max-w-6xl">
        <div className="relative flex items-center justify-center mx-auto isolate z-0">
                {/* Blurred text layer (underneath) with INVERTED mask */}
        <h1 
          className="text-7xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-tight text-vanto-200  select-none p-8"
          style={{ 
            filter: 'blur(3px)',
            maskImage: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, transparent 0%, transparent 70%, black 100%)`,
            WebkitMaskImage: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, transparent 0%, transparent 70%, black 100%)`,
          }}
        >
          Your AI Financial Agent
          <br />
          <span className="text-cyan-300 block mt-4">on Tempo</span>
        </h1>

        {/* Sharp text layer with mask (on top) */}
        <h1 
          ref={headingRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setTargetPosition({ x: 50, y: 50 });
          }}
          className="absolute inset-0 text-7xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-tight text-white cursor-default select-none p-8"
          style={{
            maskImage: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, black 0%, black 70%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, black 0%, black 70%, transparent 100%)`,
          }}
        >
          Your AI Financial Agent
          <br />
          <span className="text-cyan-300 block mt-4">on Tempo</span>
        </h1>
      </div>

      <p className="text-lg sm:text-lg lg:text-2xl text-gray-100 mt-6 max-w-2xl mx-auto">
        Invoicing, expenses, payments, and predictions in one conversational
        interface. Just chat naturally - no crypto complexity.
      </p>

      <div className="flex flex-col items-center justify-center gap-8 mt-10">
        <button
          onClick={onLogin}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
        >
          Start with Email or Phone
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-sm font-bold">No seed phrases. No gas fees. Just finance.</p>
      </div>
    </div>
  </section>
    );
}