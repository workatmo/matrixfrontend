export const metadata = {
  title: "Privacy Policy | Matrix",
  description: "Learn how Matrix collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16 sm:px-10">
      <section className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: April 22, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-neutral-700 sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-black">1. Information We Collect</h2>
            <p className="mt-2">
              We may collect contact details, vehicle details, order information, and technical
              usage data required to provide and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">2. How We Use Information</h2>
            <p className="mt-2">
              Information is used for order processing, customer support, service updates, fraud
              prevention, and product or platform improvements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">3. Sharing of Information</h2>
            <p className="mt-2">
              We only share data when required to fulfil services, comply with legal obligations,
              or support operations through trusted providers under appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">4. Data Retention</h2>
            <p className="mt-2">
              Personal data is retained only as long as needed for service delivery, legal
              compliance, and legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">5. Your Rights</h2>
            <p className="mt-2">
              Depending on your location, you may have rights to access, correct, delete, or object
              to certain processing of your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black">6. Contact</h2>
            <p className="mt-2">
              For privacy-related requests, please reach out using the contact details available on
              our Contact Us page.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
