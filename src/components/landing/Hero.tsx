import {
  ArrowRight,
  Sparkles
} from "lucide-react";

interface NavbarProps {
	onLogin: () => void;
}

export default function Hero ({onLogin}:NavbarProps) {
	return (
  <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vanto-50 text-vanto-700 text-sm font-medium mb-6">
      <Sparkles className="w-4 h-4" />
      Powered by Tempo Blockchain
    </div>

    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
      Your AI Financial Agent
      <br />
      <span className="text-vanto-600">on Tempo</span>
    </h1>

    <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
      Invoicing, expenses, payments, and predictions in one conversational
      interface. Just chat naturally - no crypto complexity.
    </p>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
      <button
        onClick={onLogin}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-vanto-600 font-medium hover:bg-vanto-700 transition-colors"
      >
        Start with Email or Phone
        <ArrowRight className="w-4 h-4" />
      </button>
      <p className="text-sm text-gray-400">No seed phrases. No gas fees. Just finance.</p>
    </div>
  </section>
	);
}