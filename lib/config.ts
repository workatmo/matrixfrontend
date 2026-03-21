/**
 * Public env (must be prefixed with NEXT_PUBLIC_ to be available in the browser).
 *
 * Local dev: default `/api-backend` is proxied by Next to Laravel (see `next.config.mjs`)
 * so the browser stays same-origin and avoids CORS issues.
 *
 * Production: set `NEXT_PUBLIC_API_URL` to your real API base, e.g. `https://api.example.com/api`.
 */
export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "/api-backend"
).replace(/\/$/, "");

export const publicAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
