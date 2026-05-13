import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMeta } from "@/lib/seo-kit/meta";
import { seoKeywords, slugify } from "@/lib/seo";
import { apiBaseUrl, publicAppUrl } from "@/lib/config";

export const metadata: Metadata = buildPageMeta({
  title: "Tyre Brands | Compare Top Brands | Matrix Tyres",
  description:
    "Shop tyres by brand. Compare pricing across popular manufacturers and book mobile tyre fitting anywhere in the UK.",
  canonicalPath: "/brands",
  keywords: seoKeywords,
});

const featuredBrands = [
  "Bridgestone",
  "Michelin",
  "Goodyear",
  "Pirelli",
  "Continental",
  "Dunlop",
  "Hankook",
  "Yokohama",
  "Apollo",
  "CEAT",
  "MRF",
] as const;

function serverApiBase() {
  return apiBaseUrl.startsWith("http") ? apiBaseUrl : `${publicAppUrl}${apiBaseUrl}`;
}

type PublicBrand = { name?: string; slug?: string };

async function fetchPublicBrands(): Promise<PublicBrand[]> {
  const res = await fetch(`${serverApiBase()}/public/brands`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => ({}));
  const rows = json?.data?.brands;
  return Array.isArray(rows) ? (rows as PublicBrand[]) : [];
}

export default async function BrandsIndexPage() {
  const brands = await fetchPublicBrands();
  const names =
    brands
      .map((b) => (typeof b?.name === "string" ? b.name.trim() : ""))
      .filter((x) => x.length > 0) || [];
  const list = names.length ? names : [...featuredBrands];

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <section className="border-b border-[#dbe5ff] bg-white px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Tyre brands
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Explore tyres by manufacturer, then pick the right size, season, and fitting slot.
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
          <h2 className="text-xl font-semibold text-neutral-900">Featured brands</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((name) => {
              const slug = slugify(name);
              return (
                <Link
                  key={name}
                  href={`/brands/${slug}`}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {name}
                </Link>
              );
            })}
          </div>
          {!names.length ? (
            <p className="mt-6 text-sm text-neutral-600">
              More brands will appear automatically as they’re added to the catalogue.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

