import { buildCanonical } from "@/lib/seo";

export type JsonLd = Record<string, unknown>;

export function organizationSchema(input: { name: string; urlPath?: string; logoPath?: string }): JsonLd {
  const url = buildCanonical(input.urlPath ?? "/");
  const logo = buildCanonical(input.logoPath ?? "/brand-logo.svg");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}#organization`,
    name: input.name,
    url,
    logo,
    sameAs: [],
  };
}

export function localBusinessSchema(input: {
  name: string;
  urlPath?: string;
  imagePath?: string;
  telephone?: string;
  priceRange?: string;
  serviceType?: string;
  areaServed?: string[];
}): JsonLd {
  const url = buildCanonical(input.urlPath ?? "/");
  const image = buildCanonical(input.imagePath ?? "/brand-logo.svg");
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}#localbusiness`,
    name: input.name,
    image,
    url,
    ...(input.telephone ? { telephone: input.telephone } : {}),
    ...(input.areaServed?.length ? { areaServed: input.areaServed } : {}),
    ...(input.priceRange ? { priceRange: input.priceRange } : {}),
    ...(input.serviceType ? { serviceType: input.serviceType } : {}),
    parentOrganization: { "@id": `${url}#organization` },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: buildCanonical(it.path),
    })),
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function blogPostingSchema(input: {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
  datePublishedISO?: string;
  dateModifiedISO?: string;
  authorName?: string;
  publisherName?: string;
}): JsonLd {
  const url = buildCanonical(input.path);
  const image = buildCanonical(input.imagePath ?? "/tyre-placeholder.svg");
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image,
    url,
    ...(input.datePublishedISO ? { datePublished: input.datePublishedISO } : {}),
    ...(input.dateModifiedISO ? { dateModified: input.dateModifiedISO } : {}),
    ...(input.authorName ? { author: { "@type": "Person", name: input.authorName } } : {}),
    ...(input.publisherName
      ? {
          publisher: {
            "@type": "Organization",
            name: input.publisherName,
          },
        }
      : {}),
    mainEntityOfPage: url,
  };
}

