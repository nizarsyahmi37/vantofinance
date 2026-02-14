"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavbarLanding from "@/components/landing/NavBarLanding";
import FooterLanding from "@/components/landing/FooterLanding";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import CTASection from "@/components/landing/CTASection";
import HowItWorks from "@/components/landing/HowItWorks";

export default function LandingPage() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
      if (authenticated) {
        router.push("/dashboard");
      }
    }
  }, [authenticated, router, ready]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-vanto-800 to-vanto-500">
        <div className="text-center">
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-vanto-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-vanto-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-vanto-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-white mt-4 text-lg font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Nav */}
      <NavbarLanding onLogin={login}/>

    <div className="z-0">
      {/* Hero */}
      <Hero onLogin={login}/>

      {/* Features */}
      <Features/>

      {/* How it works */}
      <HowItWorks/>

      {/* CTA */}
      <CTASection onLogin={login}/>

      {/* Footer */}
      <FooterLanding/>
      </div>
    </div>
  );
}