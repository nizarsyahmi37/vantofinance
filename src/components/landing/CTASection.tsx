interface NavbarProps {
	onLogin: () => void;
}

export default function CTASection ({onLogin}:NavbarProps) {
	return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="rounded-2xl bg-vanto-600 p-12 text-center">
        <h2 className="text-3xl font-bold">Ready to simplify your finances?</h2>
        <p className="text-vanto-200 mt-3 max-w-lg mx-auto">
          Vanto brings the power of AI and blockchain together in a way that just works.
        </p>
        <button
          onClick={onLogin}
          className="mt-8 px-8 py-3 rounded-xl bg-white text-vanto-700 font-semibold hover:bg-gray-100 transition-colors"
        >
          Get Started Free
        </button>
      </div>
    </section>
	);
}