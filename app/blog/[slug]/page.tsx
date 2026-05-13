import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { blogPosts, getBlogCategory, getBlogPost } from "@/lib/blog";
import { buildPageMeta } from "@/lib/seo-kit/meta";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/seo-kit/schema";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return buildPageMeta({
      title: "Blog Post | Matrix Tyres",
      description: "Read tyre guides, maintenance tips and reviews for UK roads.",
      canonicalPath: `/blog/${slug}`,
    });
  }
  return buildPageMeta({
    title: `${post.title} | Matrix Tyres`,
    description: post.description,
    canonicalPath: `/blog/${post.slug}`,
    images: post.imagePath ? [post.imagePath] : undefined,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return (
      <main className="min-h-screen bg-neutral-50 font-sans px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Post not found</h1>
          <p className="mt-2 text-neutral-600">Browse the blog index.</p>
          <Link className="mt-6 inline-flex font-semibold text-[#3558df] hover:underline" href="/blog">
            View blog
          </Link>
        </div>
      </main>
    );
  }

  const category = getBlogCategory(post.categorySlug);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    ...(category ? [{ label: category.name, href: `/blog/category/${category.slug}` }] : []),
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  const jsonLdBreadcrumb = breadcrumbSchema(crumbs.map((x) => ({ name: x.label, path: x.href })));
  const jsonLdPost = blogPostingSchema({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    imagePath: post.imagePath,
    datePublishedISO: post.datePublishedISO,
    dateModifiedISO: post.dateModifiedISO ?? post.datePublishedISO,
    authorName: "Matrix Tyres",
    publisherName: "Matrix Tyres",
  });

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPost) }}
      />

      <section className="border-b border-[#dbe5ff] bg-white px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={crumbs} />
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {post.datePublishedISO}
            {category ? ` • ${category.name}` : ""}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-neutral-600">{post.description}</p>
        </div>
      </section>

      <article className="px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {post.sections.map((s, idx) => {
            if (s.type === "h2") {
              return (
                <h2 key={idx} className="text-xl font-semibold text-neutral-900">
                  {s.text}
                </h2>
              );
            }
            if (s.type === "ul") {
              return (
                <ul key={idx} className="list-disc space-y-2 pl-6 text-neutral-700">
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-neutral-700 leading-relaxed">
                {s.text}
              </p>
            );
          })}

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Next steps</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Ready to choose tyres? Browse the catalogue and book mobile fitting in minutes.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/tyres"
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Browse tyres
              </Link>
              <Link
                href="/brands"
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
              >
                Browse brands
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}

