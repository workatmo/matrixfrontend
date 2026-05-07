import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/seo";

export const metadata = {
  title: "Areas We Cover | Matrix",
  description: "Discover the locations where Matrix provides tyre and roadside support services.",
  alternates: {
    canonical: "/areas-we-cover",
  },
};

const locations = [
  "Coventry",
  "Warwick",
  "Leamington Spa",
  "Rugby",
  "Nuneaton",
  "Bedworth",
  "Hinckley",
];

const orderedLocations = ["Coventry", ...locations.filter((location) => location !== "Coventry")];

export default function AreasWeCoverPage() {
  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] px-6 py-20 text-black sm:px-10 sm:py-24">
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#fda4af]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#86efac]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center">
          <p className="mx-auto inline-flex rounded-full border border-[#3e66f3]/30 bg-[#3e66f3]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f4eb8]">
            Local Service Coverage
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">Areas We Cover</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-neutral-700 sm:text-xl">
            Matrix provides fast mobile tyre fitting and roadside support across the following locations.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Covered Locations</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderedLocations.map((location) => (
            <Link
              key={location}
              href={`/tyre-fitting/${slugify(location)}`}
              className="rounded-2xl border border-[#dbe5ff] bg-white/95 p-6 shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-35px_rgba(52,88,219,0.65)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#3558df] to-[#8f46f8] text-white">
                  <MapPin className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold text-black">{location}</h3>
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Service available in this area
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
        <div className="relative overflow-hidden rounded-2xl border border-[#dbe5ff] bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] p-8 text-center text-black shadow-[0_30px_70px_-45px_rgba(52,88,219,0.6)]">
          <div className="pointer-events-none absolute -left-12 top-4 h-40 w-40 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-3 h-44 w-44 rounded-full bg-[#a5b4fc]/20 blur-3xl" />
          <div className="relative">
            <h3 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">Need mobile tyre support in your area?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-700">
            Contact our team and we will dispatch the nearest available technician.
            </p>
            <a
              href="/contact-us"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3558df] to-[#8f46f8] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_-18px_rgba(53,88,223,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2a46b7] hover:to-[#7733e6]"
            >
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
