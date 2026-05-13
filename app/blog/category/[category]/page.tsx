import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMeta } from "@/lib/seo-kit/meta";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { blogCategories, getBlogCategory, listBlogPostsByCategory } from "@/lib/blog";
import { breadcrumbSchema } from "@/lib/seo-kit/schema";

export async function generateStaticParams() {
  return blogCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const c = getBlogCategory(category);
  if (!c) {
    return buildPageMeta({
      title: "Blog Category | Matrix Tyres",
      description: "Read tyre guides, maintenance tips and reviews for UK roads.",
      canonicalPath: `/blog/category/${category}`,
    });
  }
  return buildPageMeta({
    title: `${c.name} | Blog | Matrix Tyres`,
    description: c.description,
    canonicalPath: `/blog/category/${c.slug}`,
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const c = getBlogCategory(category);
  if (!c) {
    return (
      <main className="min-h-screen bg-neutral-50 font-sans px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Category not found</h1>
          <p className="mt-2 text-neutral-600">Browse the blog index.</p>
          <Link className="mt-6 inline-flex font-semibold text-[#3558df] hover:underline" href="/blog">
            View blog
          </Link>
        </div>
      </main>
    );
  }

  const posts = listBlogPostsByCategory(c.slug);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: c.name, href: `/blog/category/${c.slug}` },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs.map((x) => ({ name: x.label, path: x.href })))),
        }}
      />

      <section className="border-b border-[#dbe5ff] bg-white px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs items={crumbs} />
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {c.name}
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">{c.description}</p>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {p.datePublishedISO}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-neutral-900">{p.title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{p.description}</p>
                <p className="mt-4 text-sm font-semibold text-[#3558df]">Read</p>
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
              No posts in this category yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

