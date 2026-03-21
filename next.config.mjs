/** @type {import('next').NextConfig} */
// `/api-backend/*` is proxied by `app/api-backend/[[...path]]/route.ts` (reliable with Turbopack).
// Set `LARAVEL_PROXY_TARGET` in `.env`. Use absolute `NEXT_PUBLIC_API_URL` to skip the proxy.
const nextConfig = {};

export default nextConfig;
