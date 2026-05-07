const faqs = [
  {
    question: "How to find tyre size?",
    answer:
      "You can find your tyre size on your current tyre sidewall (for example, 205/55 R16) or enter your registration to match compatible sizes.",
  },
  {
    question: "Do you offer mobile fitting?",
    answer:
      "Yes. We provide mobile tyre fitting at home, work, or roadside across our service locations.",
  },
  {
    question: "Can I book same-day tyre fitting?",
    answer:
      "Same-day appointments are available in many areas depending on stock and technician availability.",
  },
  {
    question: "Do you supply cheap tyres UK drivers can trust?",
    answer:
      "We offer budget, mid-range, and premium tyres so you can compare value and performance before booking.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8 sm:px-10 sm:pt-12">
      <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">Frequently Asked Questions</h2>
      <div className="mt-8 space-y-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none text-base font-semibold text-black">
              {faq.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export { faqs };
