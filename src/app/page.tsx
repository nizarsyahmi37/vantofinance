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
import Loading from "@/components/landing/Loading";

export default function LandingPage() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Progress bar animation - accelerates to 90%, waits for ready
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // If Privy is ready, complete to 100%
        if (ready && prev >= 90) {
          clearInterval(interval);
          // Wait 1.3s (1s at 100% + 0.3s for slide animation) before hiding
          setTimeout(() => setIsLoading(false), 1300);
          return 100;
        }
        
        // Accelerate to 90% then slow down
        if (prev < 90) {
          const increment = prev < 50 ? 8 : prev < 70 ? 5 : 3;
          return Math.min(prev + increment, 90);
        }
        
        // Stay at 90% waiting for ready
        return 90;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [ready]);

  // Redirect if authenticated
  useEffect(() => {
    if (authenticated && ready) {
      router.push("/dashboard");
    }
  }, [authenticated, ready, router]);

  if (isLoading) {
    return <Loading progress={progress} ready={ready} />;
  }

  return (
    <>
      {isLoading && <Loading progress={progress} ready={ready} />}
      
      <div className="min-h-screen bg-black overflow-x-clip">
        <NavbarLanding onLogin={login}/>

        <div className="-mt-[78px]">
          <Hero onLogin={login}/>
        </div>
        
        <Features/>
        
        <HowItWorks onLogin={login}/>
        <CTASection onLogin={login}/>
        <FooterLanding/>
      </div>
    </>
  );
}