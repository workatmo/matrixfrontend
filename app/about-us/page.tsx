import { ArrowRight, BadgeCheck, Gauge, Headset, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Matrix",
  description: "Learn more about Matrix, your trusted tyre provider.",
};

const highlights = [
  {
    icon: Sparkles,
    title: "Instant Recommendations",
    description: "Enter your registration and get tyre matches in seconds.",
  },
  {
    icon: BadgeCheck,
    title: "Premium Quality Brands",
    description: "Trusted options from leading manufacturers and tested standards.",
  },
  {
    icon: Headset,
    title: "Expert Support",
    description: "Friendly specialists available whenever you need guidance.",
  },
  {
    icon: Gauge,
    title: "Transparent Pricing",
    description: "Clear pricing, no surprises, and quick booking at checkout.",
  },
];

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] px-6 py-20 text-black sm:px-10 sm:py-24">
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#fda4af]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#86efac]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center">
          <p className="mx-auto inline-flex rounded-full border border-[#3e66f3]/30 bg-[#3e66f3]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f4eb8]">
            About Matrix
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            About Matrix
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-neutral-700 sm:text-xl">
            We make tyre buying effortless, reliable, and transparent with premium products and expert support.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            {["Trusted by 1,000+ drivers", "4.8 rating", "Same day service"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50/90 px-3 py-1.5 text-emerald-800 shadow-[0_8px_24px_-20px_rgba(16,185,129,0.95)]"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Our Story</h2>
        <div className="space-y-5 text-lg leading-relaxed text-neutral-700">
          <p>
          At Matrix, we believe that finding the right tyres for your car should be as easy and seamless as a Sunday drive. 
          Founded with a passion for automotive excellence and a commitment to customer satisfaction, we set out to build a platform that simplifies the tyre-buying process.
          </p>
          <p>
          Whether you&apos;re looking for high-performance summer tyres or reliable all-season treads, our extensive inventory and intelligent matching system guarantee that you get exactly what your vehicle needs to perform safely and optimally.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Why Choose Us</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-[#dbe5ff] bg-white/95 p-6 shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-35px_rgba(52,88,219,0.65)]"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#3558df] to-[#8f46f8] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-black">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm text-neutral-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
        <div className="relative overflow-hidden rounded-2xl border border-[#dbe5ff] bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] p-8 text-center text-black shadow-[0_30px_70px_-45px_rgba(52,88,219,0.6)]">
          <div className="pointer-events-none absolute -left-12 top-4 h-40 w-40 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-3 h-44 w-44 rounded-full bg-[#a5b4fc]/20 blur-3xl" />
          <div className="relative">
            <h3 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">Ready to find your perfect tyres?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-700">
            Start with your registration and get instant recommendations, pricing, and booking in seconds.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3558df] to-[#8f46f8] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_-18px_rgba(53,88,223,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2a46b7] hover:to-[#7733e6]"
            >
              Find My Tyres
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
