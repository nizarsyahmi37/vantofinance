"use client";

import { useState } from "react";
import { Mail, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";

const STEPS_WORK = [
  { 
    step: "01", 
    title: "Sign In", 
    desc: "Use your email or phone. We create a wallet for you instantly.",
    icon: Mail,
    action: "login",  // Changed from link
    linkText: "Create account"
  },
  { 
    step: "02", 
    title: "Chat", 
    desc: "Tell Vanto what you need. Send payments, create invoices, split bills.",
    icon: MessageSquare,
    link: "/docs",
    linkText: "See examples"
  },
  { 
    step: "03", 
    title: "Done", 
    desc: "Transactions are executed on Tempo. Zero gas fees. Instant settlement.",
    icon: CheckCircle,
    link: "/features",
    linkText: "Learn more"
  },
];

interface NavbarProps {
    onLogin: () => void;
}

function StepCard({ step, onLogin }: { step: typeof STEPS_WORK[0], onLogin: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Dotted Horizontal Border */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="100%" 
        viewBox="0 0 1440 2" 
        fill="none" 
        preserveAspectRatio="none"
        className="w-full"
      >
        <path 
          d="M0 1L1440 0.999878" 
          stroke="#4B515B" 
          strokeWidth="2" 
          strokeDasharray="2 8" 
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Card Container */}
      <div 
        className="relative overflow-hidden"
      >
        {/* Hover Background Overlay - Swipe Right Animation */}
        <div 
          className="absolute inset-0 bg-gray-500/10 pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform: isHovered ? 'translateX(0%)' : 'translateX(-100%)',
            height: '100%',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 0
          }}
        />

        {/* Content Grid */}
        <div 
          className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 py-16 px-6"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left Side - Icon & Title */}
          <div className="flex flex-col md:flex-row items-start justify-center gap-6 z-10">
            {/* Animated Icon Area */}
            <div 
              className="relative flex items-start justify-center transition-all duration-500"
              style={{
                width: isHovered ? '90px' : '20px',
                height: isHovered ? '90px' : '20px',
                opacity: isHovered ? 1 : 0.5
              }}
            >
              <div 
                className="rounded-lg flex items-start justify-center transition-all duration-500"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: isHovered ? 'scale(1)' : 'scale(0.5)'
                }}
              >
                <step.icon 
                  className="text-vanto-400 transition-all duration-500 p-0" 
                  style={{
                    width: isHovered ? '48px' : '0px',
                    height: isHovered ? '48px' : '0px'
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <div className="mt-4 md:mt-0">
              <h3 className="text-4xl md:text-6xl font-bold text-white">
                {step.title}
              </h3>
            </div>
          </div>

          {/* Right Side - Description & CTA */}
          <div className="flex flex-col justify-center gap-10 z-10">
            <div className="max-w-md">
              <p 
                className="text-lg text-gray-400 transition-colors duration-300"
                style={{
                  color: isHovered ? '#9ca3af' : '#6b7280'
                }}
              >
                {step.desc}
              </p>
            </div>

            {/* CTA Button - Conditional rendering */}
            {step.action === 'login' ? (
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-3 px-6 py-3 bg-vanto-500/10 hover:bg-vanto-500/20 border border-vanto-500/30 rounded-lg transition-all duration-300 group w-fit"
                style={{
                  clipPath: isHovered 
                    ? 'inset(0px 0px 0%)' 
                    : 'inset(0px 0px 100%)'
                }}
              >
                <ArrowRight className="w-4 h-4 text-vanto-400 group-hover:translate-x-1 transition-transform" />
                <span className="text-lg text-white font-medium">
                  {step.linkText}
                </span>
              </button>
            ) : (
              <a 
                href={step.link}
                className="inline-flex items-center gap-3 px-6 py-3 bg-vanto-500/10 hover:bg-vanto-500/20 border border-vanto-500/30 rounded-lg transition-all duration-300 group w-fit"
                style={{
                  clipPath: isHovered 
                    ? 'inset(0px 0px 0%)' 
                    : 'inset(0px 0px 100%)'
                }}
              >
                <ArrowRight className="w-4 h-4 text-vanto-400 group-hover:translate-x-1 transition-transform" />
                <span className="text-lg text-white font-medium">
                  {step.linkText}
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function HowItWorks({ onLogin }: NavbarProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 px-6">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg">
            Get started in minutes. No crypto knowledge required.
          </p>
        </div>

        {/* Steps List */}
        <div className="flex flex-col">
          {STEPS_WORK.map((step) => (
            <StepCard key={step.step} step={step} onLogin={onLogin} />
          ))}
        </div>

        {/* Bottom Border */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="100%" 
          viewBox="0 0 1440 2" 
          fill="none" 
          preserveAspectRatio="none"
          className="w-full"
        >
          <path 
            d="M0 1L1440 0.999878" 
            stroke="#4B515B" 
            strokeWidth="2" 
            strokeDasharray="2 8" 
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </section>
  );
}