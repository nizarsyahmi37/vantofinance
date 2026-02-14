const STEPS_WORK = [
  { step: "1", title: "Sign In", desc: "Use your email or phone. We create a wallet for you instantly." },
  { step: "2", title: "Chat", desc: "Tell Vanto what you need. Send payments, create invoices, split bills." },
  { step: "3", title: "Done", desc: "Transactions are executed on Tempo. Zero gas fees. Instant settlement." },
];

export default function HowItWorks () {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS_WORK.map((item) => (
          <div key={item.step} className="text-center">
            <div className="w-12 h-12 rounded-full bg-vanto-100 text-vanto-700 font-bold text-lg flex items-center justify-center mx-auto">
              {item.step}
            </div>
            <h3 className="font-semibold text-gray-900 mt-4">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}