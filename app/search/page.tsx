import SearchQueryClient from "./SearchQueryClient";

export const dynamic = "force-static";

export const metadata = {
  title: "Tyre Search | Buy Online UK",
  description: "Find matching tyres by registration and book mobile tyre fitting online in the UK.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return <SearchQueryClient />;
}

