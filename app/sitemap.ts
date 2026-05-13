import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/config";
import { buildTyrePath, localSeoCities } from "@/lib/seo";
import { blogCategories, blogPosts } from "@/lib/blog";

export const dynamic = "force-static";

type TyreSummary = {
  id: number;
  model: string;
  brand?: { name?: string };
  size?: { label?: string };
};

type BrandSummary = {
  slug: string;
};

function baseUrl() {
  return publicAppUrl.replace(/\/$/, "");
}

async function fetchTyres(): Promise<TyreSummary[]> {
  const api =
    process.env.NEXT_PUBLIC_STATIC_API_URL || "https://api.matrixmobiletyresandautos.com/api";
  const res = await fetch(`${api}/public/tyres?per_page=500`, {
    cache: "force-cache",
  }).catch(() => null);
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => ({}));
  return Array.isArray(json?.data?.data) ? (json.data.data as TyreSummary[]) : [];
}

async function fetchBrands(): Promise<BrandSummary[]> {
  const api =
    process.env.NEXT_PUBLIC_STATIC_API_URL || "https://api.matrixmobiletyresandautos.com/api";
  const res = await fetch(`${api}/public/brands`, { cache: "force-cache" }).catch(() => null);
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => ({}));
  const rows = json?.data?.brands;
  return Array.isArray(rows) ? (rows as BrandSummary[]) : [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    "/",
    "/tyres",
    "/categories",
    "/categories/car-tyres",
    "/categories/van-tyres",
    "/categories/suv-tyres",
    "/brands",
    "/areas-we-cover",
    "/about-us",
    "/contact-us",
    "/tpms-service",
    "/privacy-policy",
    "/terms-of-service",
    "/blog",
  ].map((path) => ({
    url: `${baseUrl()}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  const blogCategoryPages = blogCategories.map((c) => ({
    url: `${baseUrl()}/blog/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  const blogPostPages = blogPosts.map((p) => ({
    url: `${baseUrl()}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const brands = await fetchBrands();
  const brandPages = (brands.length
    ? brands
    : [
        { slug: "bridgestone" },
        { slug: "michelin" },
        { slug: "goodyear" },
        { slug: "pirelli" },
        { slug: "continental" },
      ]
  ).map((b) => ({
    url: `${baseUrl()}/brands/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const cityPages = localSeoCities.map((city) => ({
    url: `${baseUrl()}/tyre-fitting/${city}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const tyres = await fetchTyres();
  const tyrePages = tyres.map((tyre) => ({
    url: `${baseUrl()}${buildTyrePath(
      tyre.id,
      tyre.brand?.name || "tyre",
      tyre.model || "model",
      tyre.size?.label || "size"
    )}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...brandPages,
    ...blogCategoryPages,
    ...blogPostPages,
    ...cityPages,
    ...tyrePages,
  ];
}
