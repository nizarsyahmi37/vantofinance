"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingProps {
  progress: number;
  ready: boolean;
}

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { 
    stiffness: 100, 
    damping: 30,
    restDelta: 0.001 
  });
  
  const display = useTransform(spring, (current) =>
    Math.round(current).toString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function Loading({ progress, ready }: LoadingProps) {
  const [shouldSlide, setShouldSlide] = useState(false);
  const isComplete = progress === 100 && ready;

  useEffect(() => {
    if (isComplete) {
      // Wait 1 second at 100% before sliding
      const timer = setTimeout(() => {
        setShouldSlide(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-black"
      initial={{ x: 0 }}
      animate={{ x: shouldSlide ? "100%" : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="text-center w-full max-w-md px-6">
        {/* Logo or Brand */}
        {/* <h1 className="text-4xl font-bold text-white mb-8">Vanto</h1> */}
        <div className="text-6xl font-bold text-white mb-4">
          <AnimatedCounter value={progress} />
          <span className="text-vanto-600">%</span>
        </div>
        {/* Progress Bar Container */}
        <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-6">
          {/* Progress Bar Fill */}
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-vanto-400 to-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          />
          
          {/* Shimmer Effect */}
          <motion.div 
            className="absolute top-0 left-0 h-screen w-2/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ 
              x: `${(progress / 100) * 200 - 100}%` 
            }}
            transition={{ duration: 0.8, ease: "easeIn" }}
          />
        </div>
      </div>
    </motion.div>
  );
}