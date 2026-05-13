import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TyreDetailClient from "./TyreDetailClient";
import { buildCanonical, buildTyrePath, slugify } from "@/lib/seo";
import { buildPageMeta } from "@/lib/seo-kit/meta";
import { breadcrumbSchema, faqSchema } from "@/lib/seo-kit/schema";

type TyreSummary = {
  id: number;
  model: string;
  price: string;
  image_url: string | null;
  stock: number;
  brand?: { name?: string };
  size?: { label?: string };
};

function apiBase() {
  return process.env.NEXT_PUBLIC_STATIC_API_URL || "https://api.matrixmobiletyresandautos.com/api";
}

async function fetchStoreCurrency(): Promise<string> {
  const res = await fetch(`${apiBase()}/public/checkout-config`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return "GBP";
  const json = await res.json().catch(() => ({}));
  const currency = json?.data?.currency;
  return typeof currency === "string" && currency.trim() ? currency.trim().toUpperCase() : "GBP";
}

async function fetchTyreById(id: string): Promise<TyreSummary | null> {
  const res = await fetch(`${apiBase()}/public/tyres/${id}`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return (json?.data as TyreSummary) ?? null;
}

function extractId(value: string): string {
  return value.split("-")[0];
}

export async function generateStaticParams() {
  const res = await fetch(`${apiBase()}/public/tyres?per_page=200`, {
    cache: "force-cache",
  }).catch(() => null);
  if (!res || !res.ok) {
    return [{ id: "1" }];
  }
  const json = await res.json().catch(() => ({}));
  const tyres: { id: number }[] = json?.data?.data ?? [];
  if (!Array.isArray(tyres) || tyres.length === 0) {
    return [{ id: "1" }];
  }
  return tyres.map((t) => ({ id: String(t.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const parsed = await params;
  const tyreId = extractId(parsed.id);
  const tyre = await fetchTyreById(tyreId);
  if (!tyre) {
    return buildPageMeta({
      title: "Tyre Details | Buy Tyres Online UK | Matrix Tyres",
      description: "Browse tyre details, compare prices, and book mobile tyre fitting anywhere in the UK.",
      canonicalPath: `/tyres/${parsed.id}`,
    });
  }

  const brand = tyre.brand?.name || "Tyre";
  const model = tyre.model || "Model";
  const size = tyre.size?.label || "Size";
  const canonicalPath = buildTyrePath(tyre.id, brand, model, size);

  return buildPageMeta({
    title: `${brand} ${model} ${size} Tyres | Buy Online UK`,
    description: `Buy ${brand} ${model} ${size} tyres online with transparent pricing and mobile fitting across the UK.`,
    canonicalPath,
    images: tyre.image_url ? [tyre.image_url] : ["/tyre-placeholder.svg"],
  });
}

export default async function TyreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parsed = await params;
  const tyreId = extractId(parsed.id);
  const tyre = await fetchTyreById(tyreId);
  const currency = await fetchStoreCurrency();

  if (tyre) {
    const canonicalPath = buildTyrePath(
      tyre.id,
      tyre.brand?.name || "tyre",
      tyre.model || "model",
      tyre.size?.label || "size"
    );
    if (parsed.id !== canonicalPath.replace("/tyres/", "")) {
      redirect(canonicalPath);
    }
  }

  const brandName = tyre?.brand?.name || "Tyre";
  const brandSlug = slugify(brandName);
  const productName = tyre
    ? `${brandName} ${tyre.model} ${tyre.size?.label || ""}`.trim()
    : "Tyre";

  const crumbs = tyre
    ? [
        { name: "Home", path: "/" },
        { name: "Tyres", path: "/tyres" },
        { name: brandName, path: `/brands/${brandSlug}` },
        { name: productName, path: buildTyrePath(tyre.id, brandName, tyre.model, tyre.size?.label || "") },
      ]
    : [{ name: "Home", path: "/" }, { name: "Tyres", path: "/tyres" }];

  const productFaqs = tyre
    ? [
        {
          question: "How long do tyres usually last?",
          answer:
            "Tyre life depends on driving style, alignment, tyre pressure, and road conditions. Many drivers replace tyres when tread is low or performance drops.",
        },
        {
          question: "Do you offer a warranty?",
          answer:
            "Warranty and coverage depend on the manufacturer and product. If you need help choosing, contact us and we’ll guide you to the right option.",
        },
        {
          question: "Can I book mobile fitting for this tyre?",
          answer:
            "Yes. Add the tyre to your cart and complete checkout to choose an available fitting slot at your address (subject to coverage).",
        },
      ]
    : [];

  const productSchema = tyre
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productName,
        brand: {
          "@type": "Brand",
          name: brandName,
        },
        image: tyre.image_url || buildCanonical("/tyre-placeholder.svg"),
        sku: String(tyre.id),
        offers: {
          "@type": "Offer",
          priceCurrency: currency,
          price: tyre.price,
          availability:
            tyre.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: buildCanonical(buildTyrePath(tyre.id, brandName, tyre.model, tyre.size?.label || "")),
        },
        seller: {
          "@type": "LocalBusiness",
          "@id": `${buildCanonical("/")}#localbusiness`,
        },
      }
    : null;

  return (
    <>
      {tyre ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
        />
      ) : null}
      {tyre && productFaqs.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(productFaqs)) }}
        />
      ) : null}
      {productSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      ) : null}
      <TyreDetailClient tyreId={tyreId} />
    </>
  );
}
