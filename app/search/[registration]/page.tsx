import type { Metadata } from "next";
import SearchResultsClient from "./search-results-client";
import { buildCanonical } from "@/lib/seo";
import { apiBaseUrl, publicAppUrl } from "@/lib/config";

export async function generateStaticParams() {
  // Static export cannot prebuild arbitrary registration searches.
  // Provide at least one placeholder so Next can export the route.
  return [{ registration: "AB12CDE" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ registration: string }>;
}): Promise<Metadata> {
  const { registration } = await params;
  const reg = registration.toUpperCase();
  return {
    title: `${reg} Tyres | Buy Online UK`,
    description: `Find matching tyres for ${reg} and book mobile tyre fitting online in the UK.`,
    alternates: { canonical: `/search/${registration}` },
    openGraph: {
      title: `${reg} Tyres | Buy Online UK`,
      description: `Find matching tyres for ${reg} and book mobile tyre fitting online in the UK.`,
      url: buildCanonical(`/search/${registration}`),
    },
  };
}

export default async function SearchRegistrationPage({
  params,
}: {
  params: Promise<{ registration: string }>;
}) {
  const { registration } = await params;
  const serverApiBase = apiBaseUrl.startsWith("http") ? apiBaseUrl : `${publicAppUrl}${apiBaseUrl}`;

  const payload = await fetch(`${serverApiBase}/vehicle/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ registration_number: registration }),
    cache: "no-store",
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  return <SearchResultsClient registration={registration} initialPayload={payload} />;
}
