/**
 * Frontend config from `.env` / `.env.local` (see Next.js env loading order).
 *
 * `NEXT_PUBLIC_*` — inlined for client and server; set in `.env` for both.
 *
 * Relative `NEXT_PUBLIC_API_URL` (e.g. `/api-backend`): proxied by
 * `app/api-backend/[[...path]]/route.ts` to `LARAVEL_PROXY_TARGET` + `/api/*` (same-origin, no CORS).
 *
 * Absolute `NEXT_PUBLIC_API_URL` (e.g. `https://api.example.com/api`): browser calls the API
 * directly; rewrites are skipped. If you pass only the origin (no path), `/api` is appended.
 *
 * `LARAVEL_PROXY_TARGET` — server-only; set in `.env` (used by `app/api-backend/[[...path]]/route.ts`).
 */
function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  if (!trimmed.startsWith("http")) {
    return trimmed;
  }
  try {
    const u = new URL(trimmed);
    const path = (u.pathname.replace(/\/$/, "") || "").replace(/^\//, "");
    if (path === "") {
      return `${u.origin}/api`;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

const prefersStaticApi =
  process.env.STATIC_EXPORT === "1" && typeof process.env.NEXT_PUBLIC_STATIC_API_URL === "string";

export const apiBaseUrl = normalizeApiBaseUrl(
  prefersStaticApi
    ? process.env.NEXT_PUBLIC_STATIC_API_URL!
    : (process.env.NEXT_PUBLIC_API_URL ?? "/api-backend"),
);

export const publicAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
