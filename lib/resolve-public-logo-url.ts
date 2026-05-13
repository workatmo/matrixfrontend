import { apiBaseUrl } from "@/lib/config";

/**
 * Base URL for Laravel public assets (e.g. `/storage/logos/...`).
 * Prefer absolute `logo_url` from the API; use this when the stored value is root-relative.
 */
function publicAssetOrigin(): string | null {
  const explicit = process.env.NEXT_PUBLIC_LARAVEL_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  const staticApi = process.env.NEXT_PUBLIC_STATIC_API_URL?.trim();
  if (staticApi?.startsWith("http")) {
    try {
      return new URL(staticApi).origin;
    } catch {
      return null;
    }
  }

  const api = apiBaseUrl.trim();
  if (api.startsWith("http")) {
    try {
      return new URL(api).origin;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Turn a settings `logo_url` into an absolute URL the browser can load.
 */
export function resolvePublicLogoUrl(url: string | null | undefined): string | null {
  const s = typeof url === "string" ? url.trim() : "";
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/")) {
    const origin = publicAssetOrigin();
    return origin ? `${origin}${s}` : null;
  }
  return s;
}
