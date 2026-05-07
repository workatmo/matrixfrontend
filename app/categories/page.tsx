import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMeta } from "@/lib/seo-kit/meta";
import { seoKeywords } from "@/lib/seo";

export const metadata: Metadata = buildPageMeta({
  title: "Tyre Categories | Car, Van & SUV Tyres | Matrix Tyres",
  description:
    "Browse tyres by category. Compare prices, choose the right tyre type, and book mobile tyre fitting anywhere in the UK.",
  canonicalPath: "/categories",
  keywords: seoKeywords,
});

const categories = [
  {
    slug: "car-tyres",
    title: "Car tyres",
    description: "Everyday road tyres with great grip and comfort for UK driving.",
  },
  {
    slug: "van-tyres",
    title: "Van tyres",
    description: "Durable tyres built for load, mileage, and work vehicles.",
  },
  {
    slug: "suv-tyres",
    title: "SUV tyres",
    description: "SUV-ready tyres engineered for stability and longer life.",
  },
] as const;

export default function CategoriesIndexPage() {
  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <section className="border-b border-[#dbe5ff] bg-white px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Tyre categories
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Start with the right category, then filter by brand, size, and season.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-neutral-900">{c.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{c.description}</p>
              <p className="mt-4 text-sm font-semibold text-[#3558df]">Explore</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

