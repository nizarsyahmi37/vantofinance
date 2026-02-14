"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Zap,
  MessageSquare,
  FileText,
  Receipt,
  Users,
  TrendingUp,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      router.push("/dashboard");
    }
  }, [authenticated, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pulse-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Pulse</span>
        </div>
        <button
          onClick={login}
          className="px-4 py-2 rounded-lg bg-pulse-600 text-white text-sm font-medium hover:bg-pulse-700 transition-colors"
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pulse-50 text-pulse-700 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Powered by Tempo Blockchain
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
          Your AI Financial Agent
          <br />
          <span className="text-pulse-600">on Tempo</span>
        </h1>

        <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
          Invoicing, expenses, payments, and predictions in one conversational
          interface. Just chat naturally - no crypto complexity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button
            onClick={login}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pulse-600 text-white font-medium hover:bg-pulse-700 transition-colors"
          >
            Start with Email or Phone
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-sm text-gray-400">No seed phrases. No gas fees. Just finance.</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: MessageSquare,
              title: "Chat-First Interface",
              desc: 'Just say "send $50 to john@email.com for dinner" and it happens.',
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: FileText,
              title: "Smart Invoicing",
              desc: "Create invoices via chat. Auto-reconcile when paid using our memo protocol.",
              color: "bg-green-50 text-green-600",
            },
            {
              icon: Receipt,
              title: "Expense Tracking",
              desc: "AI categorizes every transaction. See where your money goes at a glance.",
              color: "bg-orange-50 text-orange-600",
            },
            {
              icon: Users,
              title: "Bill Splitting",
              desc: "Split any bill among friends with atomic batch transactions.",
              color: "bg-purple-50 text-purple-600",
            },
            {
              icon: TrendingUp,
              title: "Prediction Markets",
              desc: "Create binary prediction markets. Friends bet, results are auto-settled.",
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              icon: Shield,
              title: "Gasless & Secure",
              desc: "All transactions are fee-sponsored. Login with email or phone - no crypto knowledge needed.",
              color: "bg-red-50 text-red-600",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border p-6 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mt-4">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Sign In", desc: "Use your email or phone. We create a wallet for you instantly." },
            { step: "2", title: "Chat", desc: "Tell Pulse what you need. Send payments, create invoices, split bills." },
            { step: "3", title: "Done", desc: "Transactions are executed on Tempo. Zero gas fees. Instant settlement." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-pulse-100 text-pulse-700 font-bold text-lg flex items-center justify-center mx-auto">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mt-4">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-2xl bg-pulse-600 p-12 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to simplify your finances?</h2>
          <p className="text-pulse-200 mt-3 max-w-lg mx-auto">
            Pulse brings the power of AI and blockchain together in a way that just works.
          </p>
          <button
            onClick={login}
            className="mt-8 px-8 py-3 rounded-xl bg-white text-pulse-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-400">
        <p>Built for the Canteen x Tempo Blockchain Hackathon</p>
      </footer>
    </div>
  );
}
