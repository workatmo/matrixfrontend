// Server Component — no "use client" here so generateStaticParams works.
import TyreDetailClient from "./TyreDetailClient";

// Required for static export (next export / STATIC_EXPORT=1)
// Fetches all tyre IDs at build time so each /tyres/[id] page is pre-generated.
export async function generateStaticParams() {
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_STATIC_API_URL ||
      "https://api.matrixmobiletyresandautos.com/api";
    const res = await fetch(`${apiBase}/public/tyres?per_page=200`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    const tyres: { id: number }[] = json?.data?.data ?? [];
    return tyres.map((t) => ({ id: String(t.id) }));
  } catch {
    return [];
  }
}

export default function TyreDetailPage() {
  return <TyreDetailClient />;
}
