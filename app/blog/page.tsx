import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMeta } from "@/lib/seo-kit/meta";
import { blogCategories, blogPosts } from "@/lib/blog";

export const metadata: Metadata = buildPageMeta({
  title: "Tyre Blog | Guides, Maintenance & Reviews | Matrix Tyres",
  description:
    "Read tyre guides, maintenance tips and reviews to help you choose the right tyres and keep them performing well on UK roads.",
  canonicalPath: "/blog",
});

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <section className="border-b border-[#dbe5ff] bg-white px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Blog
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Practical tyre advice, reviews, and checklists for everyday UK driving.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-semibold text-neutral-900">Categories</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {blogCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/blog/category/${c.slug}`}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-neutral-900">{c.name}</h3>
                <p className="mt-2 text-sm text-neutral-600">{c.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-semibold text-neutral-900">Latest posts</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {p.datePublishedISO}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-neutral-900">{p.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{p.description}</p>
                <p className="mt-4 text-sm font-semibold text-[#3558df]">Read</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

