import { apiBaseUrl, publicAppUrl } from "@/lib/config";
import { resolvePublicLogoUrl } from "@/lib/resolve-public-logo-url";

function serverPublicApiBase(): string {
  const trimmed = apiBaseUrl.replace(/\/$/, "");
  if (trimmed.startsWith("http")) return trimmed;
  return `${publicAppUrl.replace(/\/$/, "")}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export type PublicContactSettings = {
  brand_name: string;
  logo_url: string | null;
};

export async function fetchPublicContactSettings(): Promise<PublicContactSettings> {
  try {
    const res = await fetch(`${serverPublicApiBase()}/public/contact`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      return { brand_name: "", logo_url: null };
    }
    const json = (await res.json()) as { data?: Record<string, unknown> };
    const data = (json?.data ?? json) as Record<string, unknown>;
    const rawLogo = typeof data?.logo_url === "string" ? data.logo_url.trim() : "";
    const rawName = typeof data?.brand_name === "string" ? data.brand_name.trim() : "";
    return {
      brand_name: rawName,
      logo_url: resolvePublicLogoUrl(rawLogo || null),
    };
  } catch {
    return { brand_name: "", logo_url: null };
  }
}
