import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMeta } from "@/lib/seo-kit/meta";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { breadcrumbSchema, faqSchema } from "@/lib/seo-kit/schema";
import { apiBaseUrl, publicAppUrl } from "@/lib/config";

function serverApiBase() {
  return apiBaseUrl.startsWith("http") ? apiBaseUrl : `${publicAppUrl}${apiBaseUrl}`;
}

function humanizeBrandSlug(slug: string): string {
  const s = slug.replace(/-/g, " ").trim();
  if (!s) return "Tyres";
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

export async function generateStaticParams() {
  // Static export on shared hosting: prebuild a small set of common brands.
  // Other brand pages can still be reached from links if the server exports them later.
  return [
    { brand: "bridgestone" },
    { brand: "michelin" },
    { brand: "goodyear" },
    { brand: "pirelli" },
    { brand: "continental" },
  ];
}

async function fetchTyresForBrand(brandSlug: string) {
  const url = `${serverApiBase()}/public/tyres?per_page=24&brand_slug=${encodeURIComponent(brandSlug)}`;
  const res = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => ({}));
  const rows = json?.data?.data;
  return Array.isArray(rows) ? (rows as Array<{ id: number; model?: string; size?: { label?: string } }>) : [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const name = humanizeBrandSlug(brand);
  return buildPageMeta({
    title: `${name} Tyres | Prices & Mobile Fitting | UK`,
    description: `Browse ${name} tyres online. Compare prices and book mobile tyre fitting anywhere in the UK in minutes.`,
    canonicalPath: `/brands/${brand}`,
  });
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  const name = humanizeBrandSlug(brand);
  const tyres = await fetchTyresForBrand(brand);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/brands" },
    { label: name, href: `/brands/${brand}` },
  ];

  const faqs = [
    {
      question: `Are ${name} tyres good for UK roads?`,
      answer:
        "Choose a tyre based on size, driving style, and season. Many drivers prefer all‑season options for year‑round UK conditions.",
    },
    {
      question: "Can I book mobile tyre fitting?",
      answer:
        "Yes—select a fitting slot during checkout and we’ll come to your home or workplace (subject to coverage).",
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs.map((c) => ({ name: c.label, path: c.href })))),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <section className="border-b border-[#dbe5ff] bg-white px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs items={crumbs} />
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {name} tyres
          </h1>
          <p className="mt-3 max-w-3xl text-neutral-600">
            Compare {name} tyres by model and size, then book mobile fitting at home or work across the UK.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tyres"
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Browse all tyres
            </Link>
            <Link
              href="/categories"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              Browse categories
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-semibold text-neutral-900">Tyres</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Showing matching tyres from the catalogue.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tyres.slice(0, 9).map((t) => (
              <Link
                key={t.id}
                href={`/tyres/${t.id}`}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-neutral-900">
                  {name} {(t.model || "").toString()} {(t.size?.label || "").toString()}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#3558df]">View details</p>
              </Link>
            ))}
          </div>

          {tyres.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
              No tyres found for this brand yet. Try browsing all tyres.
              <div className="mt-3">
                <Link href="/tyres" className="font-semibold text-[#3558df] hover:underline">
                  View tyres
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-semibold text-neutral-900">FAQs</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.question} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <h3 className="font-semibold text-neutral-900">{f.question}</h3>
                <p className="mt-2 text-sm text-neutral-700">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

