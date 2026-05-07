import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { faqs } from "@/components/FaqSection";
import { seoKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Buy Car Tyres Online | Mobile Tyre Fitting Near You | matrix Tyres",
  description:
    "Find the best tyres for your car using your registration number. Book mobile tyre fitting with fast service and best prices.",
  keywords: seoKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Buy Car Tyres Online | Mobile Tyre Fitting Near You | matrix Tyres",
    description:
      "Find the best tyres for your car using your registration number. Book mobile tyre fitting with fast service and best prices.",
    images: ["/tyre-placeholder.svg"],
    url: "/",
    type: "website",
  },
};

export default function HomePage() {
  const faqSchema = {
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageClient />
    </>
  );
}
