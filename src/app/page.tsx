"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NavbarLanding from "@/components/landing/NavBarLanding";
import FooterLanding from "@/components/landing/FooterLanding";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import CTASection from "@/components/landing/CTASection";
import HowItWorks from "@/components/landing/HowItWorks";

export default function LandingPage() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      router.push("/dashboard");
    }
  }, [authenticated, router]);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <NavbarLanding onLogin={login}/>

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
  );
}
