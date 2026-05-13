import { apiBaseUrl } from "@/lib/config";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Client-safe API base:
 * - Node runtime deployments can use `/api-backend` proxy.
 * - Static deployments must use an absolute public API URL.
 */
export function getClientApiBaseUrl(): string {
  const staticBase = process.env.NEXT_PUBLIC_STATIC_API_URL;
  const preferred = staticBase && staticBase.startsWith("http") ? staticBase : apiBaseUrl;
  return trimTrailingSlash(preferred);
}

export function clientApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getClientApiBaseUrl()}${normalizedPath}`;
}
