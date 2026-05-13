import { clientApiUrl } from "@/lib/public-api-url";

export function extractPublicContactSource(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const root = payload as { data?: unknown };
  if (root.data && typeof root.data === "object") {
    return root.data as Record<string, unknown>;
  }
  return payload as Record<string, unknown>;
}

export function parseBrandFromContactSource(source: Record<string, unknown> | null): {
  brandName: string | null;
  brandLogoUrl: string | null;
} {
  if (!source) {
    return { brandName: null, brandLogoUrl: null };
  }
  const nextBrandName = source.brand_name;
  const nextBrandLogoUrl = source.logo_url;
  const normalizedBrandName =
    typeof nextBrandName === "string" && nextBrandName.trim() !== "" ? nextBrandName.trim() : null;
  const normalizedBrandLogoUrl =
    typeof nextBrandLogoUrl === "string" && nextBrandLogoUrl.trim() !== ""
      ? nextBrandLogoUrl.trim()
      : null;
  return { brandName: normalizedBrandName, brandLogoUrl: normalizedBrandLogoUrl };
}

let contactSourceInFlight: Promise<Record<string, unknown> | null> | null = null;

async function fetchPublicContactSourceOnce(): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(clientApiUrl("/public/contact"), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json().catch(() => ({}));
    return extractPublicContactSource(payload);
  } catch {
    return null;
  }
}

/** One in-flight request shared by all callers (navbar, footer, account chrome, etc.). */
export async function fetchPublicContactSource(): Promise<Record<string, unknown> | null> {
  if (!contactSourceInFlight) {
    contactSourceInFlight = fetchPublicContactSourceOnce().finally(() => {
      contactSourceInFlight = null;
    });
  }
  return contactSourceInFlight;
}
