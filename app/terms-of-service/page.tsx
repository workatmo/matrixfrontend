export const metadata = {
  title: "Terms of Service | Matrix",
  description: "Read the terms governing use of Matrix services and website.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16 sm:px-10">
      <section className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: April 22, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-neutral-700 sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-black">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By using Matrix services, including browsing, placing orders, or booking fittings,
              you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">2. Services</h2>
            <p className="mt-2">
              Matrix provides tyre discovery, ordering, and mobile fitting support. Service
              availability can vary by location, stock, and scheduling constraints.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">3. Pricing and Payments</h2>
            <p className="mt-2">
              Prices displayed at checkout are the prices payable unless obvious errors occur.
              Payment must be completed using supported payment methods before order confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">4. Cancellations and Refunds</h2>
            <p className="mt-2">
              Cancellation and refund outcomes depend on order stage, booked slot timing, and
              consumed service costs. Contact support promptly for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">5. Liability</h2>
            <p className="mt-2">
              Matrix is not liable for indirect or consequential losses to the extent permitted by
              law. Nothing in these terms limits rights that cannot be excluded under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">6. Contact</h2>
            <p className="mt-2">
              For questions about these terms, please use the contact options provided on the
              Contact Us page.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
