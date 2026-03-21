/**
 * Public env (must be prefixed with NEXT_PUBLIC_ to be available in the browser).
 *
 * Local dev: default `/api-backend` is proxied by Next to Laravel (see `next.config.mjs`)
 * so the browser stays same-origin and avoids CORS issues.
 *
 * Production: set `NEXT_PUBLIC_API_URL` to your API base including the Laravel `/api` prefix,
 * e.g. `https://api.example.com/api`. If you pass only the origin (no path), `/api` is appended.
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

export const apiBaseUrl = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ?? "/api-backend",
);

export const publicAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
