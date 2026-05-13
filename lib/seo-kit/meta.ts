import type { Metadata } from "next";
import { truncateForMeta } from "@/lib/seo-kit/text";

type BuildPageMetaInput = {
  title: string;
  description: string;
  canonicalPath: string;
  images?: string[];
  keywords?: string[] | string;
  robots?: Metadata["robots"];
};

export function buildPageMeta(input: BuildPageMetaInput): Metadata {
  const title = truncateForMeta(input.title, 60);
  const description = truncateForMeta(input.description, 160);
  const images = input.images?.length ? input.images : ["/tyre-placeholder.svg"];

  return {
    title,
    description,
    keywords: input.keywords,
    alternates: { canonical: input.canonicalPath },
    robots: input.robots,
    openGraph: {
      title,
      description,
      url: input.canonicalPath,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

