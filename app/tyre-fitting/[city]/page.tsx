import type { Metadata } from "next";
import Link from "next/link";
import { localSeoCities } from "@/lib/seo";

function cityLabel(city: string) {
  return city.charAt(0).toUpperCase() + city.slice(1);
}

export function generateStaticParams() {
  return localSeoCities.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const label = cityLabel(city);
  return {
    title: `Mobile Tyre Fitting in ${label} | Buy Tyres Online UK`,
    description: `Book fast mobile tyre fitting in ${label}. Compare tyre prices online and get same-day support.`,
    alternates: {
      canonical: `/tyre-fitting/${city}`,
    },
  };
}

export default async function TyreFittingCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const label = cityLabel(city);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16 sm:px-10">
      <section className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Mobile Tyre Fitting in {label}
        </h1>
        <p className="mt-4 text-neutral-700">
          Need tyres near you in {label}? We deliver and fit tyres at your home, office, or
          roadside location with transparent pricing and fast response times.
        </p>
        <h2 className="mt-8 text-2xl font-semibold text-black">How It Works</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700">
          <li>Search tyres online by registration or size.</li>
          <li>Choose your tyre brand and fitting slot.</li>
          <li>Our mobile technician fits your tyres at your location.</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white">
            Find tyres now
          </Link>
          <Link
            href="/areas-we-cover"
            className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            View all areas
          </Link>
        </div>
      </section>
    </main>
  );
}
