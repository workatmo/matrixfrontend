import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMeta } from "@/lib/seo-kit/meta";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { faqSchema, breadcrumbSchema } from "@/lib/seo-kit/schema";
import { apiBaseUrl, publicAppUrl } from "@/lib/config";

type CategoryKey = "car-tyres" | "van-tyres" | "suv-tyres";

const CATEGORY_CONTENT: Record<
  CategoryKey,
  {
    label: string;
    tyreTypeQuery: string;
    title: string;
    description: string;
    faqs: Array<{ question: string; answer: string }>;
  }
> = {
  "car-tyres": {
    label: "Car tyres",
    tyreTypeQuery: "car",
    title: "Car Tyres | Buy Online UK | Mobile Fitting",
    description:
      "Shop car tyres online in the UK. Compare brands, sizes and seasons, then book fast mobile tyre fitting at home or work.",
    faqs: [
      {
        question: "How do I choose the right car tyres?",
        answer:
          "Match your tyre size to the vehicle (from the sidewall or handbook), then choose the right season (summer, winter, all-season) for your driving and budget.",
      },
      {
        question: "Do you offer mobile tyre fitting?",
        answer:
          "Yes. You can book a fitting slot during checkout and we’ll come to your home or workplace (where service areas are available).",
      },
    ],
  },
  "van-tyres": {
    label: "Van tyres",
    tyreTypeQuery: "van",
    title: "Van Tyres | Durable Options | Buy Online UK",
    description:
      "Find durable van tyres for load and mileage. Compare prices and book convenient mobile fitting across the UK.",
    faqs: [
      {
        question: "Are van tyres different from car tyres?",
        answer:
          "Yes—van tyres are typically built for higher load ratings and durability. Always match the recommended load index for your vehicle.",
      },
      {
        question: "Can I choose fitting at home or work?",
        answer:
          "Yes. Select a slot during checkout and we’ll fit at your preferred address (subject to coverage).",
      },
    ],
  },
  "suv-tyres": {
    label: "SUV tyres",
    tyreTypeQuery: "suv",
    title: "SUV Tyres | Stable, Long‑Life Tyres | UK",
    description:
      "Browse SUV tyres designed for stability, comfort and longevity. Compare brands and book mobile tyre fitting in the UK.",
    faqs: [
      {
        question: "Do SUVs need special tyres?",
        answer:
          "Many SUVs benefit from tyres designed for higher weight and stability. Always confirm the correct size and load rating for your vehicle.",
      },
      {
        question: "What’s the best season tyre for UK roads?",
        answer:
          "All‑season tyres are a popular year‑round choice in the UK, while winter tyres improve cold-weather performance and summer tyres suit warmer conditions.",
      },
    ],
  },
};

export async function generateStaticParams() {
  // Static export on shared hosting: categories are limited and can be linked directly.
  return [
    { category: "car-tyres" },
    { category: "van-tyres" },
    { category: "suv-tyres" },
  ];
}

function serverApiBase() {
  return apiBaseUrl.startsWith("http") ? apiBaseUrl : `${publicAppUrl}${apiBaseUrl}`;
}

async function fetchTyresForCategory(category: CategoryKey) {
  const cfg = CATEGORY_CONTENT[category];
  const url = `${serverApiBase()}/public/tyres?per_page=24&tyre_type=${encodeURIComponent(cfg.tyreTypeQuery)}`;
  const res = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => ({}));
  const rows = json?.data?.data;
  return Array.isArray(rows) ? (rows as Array<{ id: number; brand?: { name?: string }; model?: string }>) : [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const key = category as CategoryKey;
  const cfg = CATEGORY_CONTENT[key];
  if (!cfg) {
    return buildPageMeta({
      title: "Tyre Category | Matrix Tyres",
      description: "Browse tyres and book mobile fitting in the UK.",
      canonicalPath: `/categories/${category}`,
    });
  }
  return buildPageMeta({
    title: cfg.title,
    description: cfg.description,
    canonicalPath: `/categories/${key}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const key = category as CategoryKey;
  const cfg = CATEGORY_CONTENT[key];
  if (!cfg) {
    return (
      <main className="min-h-screen bg-neutral-50 font-sans px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Category not found</h1>
          <p className="mt-2 text-neutral-600">Browse all tyres instead.</p>
          <Link className="mt-6 inline-flex font-semibold text-[#3558df] hover:underline" href="/tyres">
            View tyres
          </Link>
        </div>
      </main>
    );
  }

  const tyres = await fetchTyresForCategory(key);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: cfg.label, href: `/categories/${key}` },
  ];

  const jsonLdBreadcrumb = breadcrumbSchema(
    crumbs.map((c) => ({ name: c.label, path: c.href }))
  );
  const jsonLdFaq = faqSchema(cfg.faqs);

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      <section className="border-b border-[#dbe5ff] bg-white px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs items={crumbs} />
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {cfg.label}
          </h1>
          <p className="mt-3 max-w-3xl text-neutral-600">{cfg.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tyres"
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Browse all tyres
            </Link>
            <Link
              href="/brands"
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              Browse brands
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-semibold text-neutral-900">Popular picks</h2>
          <p className="mt-2 text-sm text-neutral-600">
            This list will automatically become category-specific once the backend adds tyre-type filtering.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(tyres.length ? tyres : []).slice(0, 9).map((t) => (
              <Link
                key={t.id}
                href={`/tyres/${t.id}`}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-neutral-900">
                  {(t.brand?.name || "Tyre").toString()} {(t.model || "").toString()}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#3558df]">View details</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-semibold text-neutral-900">FAQs</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {cfg.faqs.map((f) => (
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

