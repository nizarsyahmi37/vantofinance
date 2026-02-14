import {
  MessageSquare,
  FileText,
  Receipt,
  Users,
  TrendingUp,
  Shield
} from "lucide-react";

const FEATURE_LIST = [
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
        ];

export default function Features () {
	return (
   <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURE_LIST.map((feature) => (
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
	);
}