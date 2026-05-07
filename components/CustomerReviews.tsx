"use client";

const reviews = [
  {
    name: "Adam R.",
    location: "London",
    quote: "Booked in minutes and the fitter arrived the same day. Great price and service.",
  },
  {
    name: "Nadia K.",
    location: "Manchester",
    quote: "Quick mobile fitting at my workplace. Smooth process from search to payment.",
  },
  {
    name: "Chris W.",
    location: "Birmingham",
    quote: "Clear pricing, good tyre options, and friendly support team.",
  },
];

export function CustomerReviews() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">Customer Reviews</h2>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Drivers across the UK trust us for fast mobile tyre fitting and transparent pricing.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.name} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-neutral-700">&ldquo;{review.quote}&rdquo;</p>
            <p className="mt-4 text-sm font-semibold text-black">{review.name}</p>
            <p className="text-xs text-neutral-500">{review.location}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
