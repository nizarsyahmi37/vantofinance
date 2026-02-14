"use client";

import {
  MessageSquare,
  FileText,
  Receipt,
  Users,
  TrendingUp,
  Shield
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

const FEATURE_LIST = [
  {
    icon: MessageSquare,
    title: "Chat-First Interface",
    desc: 'Just say "send $50 to john@email.com for dinner" and it happens.',
    color: "bg-blue-500/10 text-blue-400",
    number: "01"
  },
  {
    icon: FileText,
    title: "Smart Invoicing",
    desc: "Create invoices via chat. Auto-reconcile when paid using our memo protocol.",
    color: "bg-green-500/10 text-green-400",
    number: "02"
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    desc: "AI categorizes every transaction. See where your money goes at a glance.",
    color: "bg-orange-500/10 text-orange-400",
    number: "03"
  },
  {
    icon: Users,
    title: "Bill Splitting",
    desc: "Split any bill among friends with atomic batch transactions.",
    color: "bg-purple-500/10 text-purple-400",
    number: "04"
  },
  {
    icon: TrendingUp,
    title: "Prediction Markets",
    desc: "Create binary prediction markets. Friends bet, results are auto-settled.",
    color: "bg-indigo-500/10 text-indigo-400",
    number: "05"
  },
  {
    icon: Shield,
    title: "Gasless & Secure",
    desc: "All transactions are fee-sponsored. Login with email or phone - no crypto knowledge needed.",
    color: "bg-red-500/10 text-red-400",
    number: "06"
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURE_LIST[0], index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0.3, 1, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0.8, 1, 1, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale, y }}
      className="mb-8"
    >
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-8 hover:border-vanto-500 transition-colors">
        <div className="flex items-start gap-4">
          <div className="text-sm font-mono text-gray-500">{feature.number}</div>
          <div className="flex-1">
            <motion.div 
              className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <feature.icon className="w-6 h-6" />
            </motion.div>
            <h3 className="font-semibold text-white text-xl mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400">{feature.desc}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} className="relative max-w-6xl mx-auto px-6 py-32">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-5xl font-bold text-white mb-4">Built for simplicity</h2>
        <p className="text-gray-400 text-lg">Powerful features that just work</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left column - Feature cards */}
        <div className="space-y-0">
          {FEATURE_LIST.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Right column - Sticky progress indicator */}
        <div className="hidden lg:block lg:sticky lg:top-32">
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-sm p-12 min-h-[500px] flex flex-col items-center justify-center">
            <motion.div
              style={{
                scaleY: smoothProgress
              }}
              className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-vanto-500 to-cyan-400 origin-top"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: 360,
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-vanto-500/20 to-cyan-400/20 rounded-full blur-xl"
                />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-vanto-500 to-cyan-400 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-16 h-16 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                Everything you need
              </p>
              <p className="text-gray-400">
                Scroll to explore features
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}