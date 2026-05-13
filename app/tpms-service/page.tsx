import { ArrowRight, CheckCircle2, Clock3, Radar, ShieldCheck, Wrench } from "lucide-react";

export const metadata = {
  title: "TPMS Service | Matrix",
  description:
    "Professional TPMS diagnostics, sensor replacement, and reset services from Matrix.",
};

const serviceItems = [
  {
    title: "TPMS Diagnostics",
    description:
      "We run a full TPMS scan to identify sensor faults, battery issues, and communication errors.",
  },
  {
    title: "Sensor Replacement",
    description:
      "Faulty sensors are replaced with high-quality compatible units and programmed to your vehicle.",
  },
  {
    title: "System Reset & Relearn",
    description:
      "After tyre changes or sensor replacement, we perform reset and relearn procedures for accurate readings.",
  },
];

const reasons = [
  "Prevent unexpected warning lights and false pressure alerts.",
  "Improve tyre lifespan by maintaining correct tyre pressure monitoring.",
  "Support safer handling, braking, and fuel efficiency.",
  "Fast turnaround by trained technicians using modern equipment.",
];

const processSteps = [
  {
    step: "01",
    title: "System Health Check",
    description:
      "Our technicians inspect all four sensors and read fault codes to identify the exact issue quickly.",
  },
  {
    step: "02",
    title: "Sensor Programming",
    description:
      "New or existing sensors are programmed with the correct vehicle profile and ID for reliable communication.",
  },
  {
    step: "03",
    title: "Reset and Road Test",
    description:
      "We reset the TPMS warning light and validate pressure data with a short road test before handover.",
  },
];

const faqs = [
  {
    question: "How do I know if my TPMS sensor is failing?",
    answer:
      "Common signs include a persistent TPMS warning light, inaccurate tyre pressure readings, or warnings that return shortly after inflation.",
  },
  {
    question: "Can you service both direct and indirect TPMS systems?",
    answer:
      "Yes. We diagnose and service both systems, including direct valve-based sensors and indirect ABS-based monitoring setups.",
  },
  {
    question: "How long does TPMS service take?",
    answer:
      "Most TPMS checks and resets are completed within 30 to 60 minutes. Sensor replacement may take longer depending on vehicle type.",
  },
];

export default function TpmsServicePage() {
  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] px-6 py-20 text-black sm:px-10 sm:py-24">
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#fda4af]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#86efac]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center">
          <p className="mx-auto inline-flex rounded-full border border-[#3e66f3]/30 bg-[#3e66f3]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f4eb8]">
            TPMS Specialist Service
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            TPMS Service for{" "}
            <span className="bg-gradient-to-r from-[#3458db] via-[#7646f6] to-[#d946ef] bg-clip-text text-transparent">
              Safe and Accurate
            </span>{" "}
            Driving
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-neutral-700 sm:text-xl">
            Keep your tyre pressure monitoring system reliable with expert diagnostics,
            sensor replacement, and reset services for all major vehicle brands.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            {["Certified Technicians", "Fast Turnaround", "Transparent Pricing"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50/90 px-3 py-1.5 text-emerald-800 shadow-[0_8px_24px_-20px_rgba(16,185,129,0.95)]"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <a
              href="/contact-us"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3558df] to-[#8f46f8] px-8 py-3 text-base font-semibold text-white shadow-[0_18px_35px_-18px_rgba(53,88,223,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2a46b7] hover:to-[#7733e6]"
            >
              Book TPMS Service
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          What We Offer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceItems.map((item, index) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[#dbe5ff] bg-white/95 p-6 shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-35px_rgba(52,88,219,0.65)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#3558df] to-[#8f46f8] text-white">
                {index === 0 ? (
                  <Radar className="h-5 w-5" />
                ) : index === 1 ? (
                  <Wrench className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </span>
              <h3 className="mb-3 mt-4 text-xl font-semibold text-black">{item.title}</h3>
              <p className="text-neutral-600 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-16 sm:px-10">
        <div className="rounded-2xl border border-[#dbe5ff] bg-white/95 p-8 shadow-[0_30px_60px_-40px_rgba(52,88,219,0.6)]">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight text-black">Why TPMS Service Matters</h2>
          <ul className="space-y-3 text-lg text-neutral-700">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-3">
                <span className="mt-1 text-[#3558df]">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Our TPMS Service Process
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {processSteps.map((item) => (
            <article
              key={item.step}
              className="rounded-2xl border border-[#dbe5ff] bg-white/95 p-6 shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-500">Step {item.step}</p>
                <Clock3 className="h-4 w-4 text-[#5a74dd]" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-black">{item.title}</h3>
              <p className="text-neutral-600 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-20 sm:px-10">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-[#dbe5ff] bg-white/95 p-6 shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)]"
            >
              <h3 className="mb-2 text-xl font-semibold text-black">{faq.question}</h3>
              <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
            </article>
          ))}
        </div>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-[#dbe5ff] bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] p-8 text-center text-black shadow-[0_30px_70px_-45px_rgba(52,88,219,0.6)]">
          <div className="pointer-events-none absolute -left-12 top-4 h-40 w-40 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-3 h-44 w-44 rounded-full bg-[#a5b4fc]/20 blur-3xl" />
          <div className="relative">
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">Need TPMS help today?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-700">
              Book a quick diagnostic and get reliable pressure monitoring back on your vehicle.
            </p>
            <a
              href="/contact-us"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3558df] to-[#8f46f8] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_-18px_rgba(53,88,223,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2a46b7] hover:to-[#7733e6]"
            >
              Get TPMS Support
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
