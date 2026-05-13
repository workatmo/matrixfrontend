import type { Metadata } from "next";
import { seoKeywords } from "@/lib/seo";
import TyresPageClient from "./TyresPageClient";

export const metadata: Metadata = {
  title: "Tyres for Cars, Vans & SUVs | Buy Tyres Online UK",
  description:
    "Browse tyres by brand, model, size and season. Compare prices and book mobile tyre fitting at home or work across the UK.",
  keywords: seoKeywords,
  alternates: {
    canonical: "/tyres",
  },
  openGraph: {
    title: "Tyres for Cars, Vans & SUVs | Buy Tyres Online UK",
    description:
      "Browse tyres by brand, model, size and season. Compare prices and book mobile tyre fitting at home or work across the UK.",
    url: "/tyres",
    images: ["/tyre-placeholder.svg"],
    type: "website",
  },
};

export default function TyresPage() {
  return <TyresPageClient />;
}
