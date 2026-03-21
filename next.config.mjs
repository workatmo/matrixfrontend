/** @type {import('next').NextConfig} */
const laravelOrigin = process.env.LARAVEL_PROXY_TARGET ?? "http://127.0.0.1:8000";
const rawPublicApi =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "/api-backend";

const nextConfig = {
  async rewrites() {
    // Same-origin relative API base (from .env) → proxy to Laravel `/api/*`.
    if (rawPublicApi.startsWith("http")) {
      return [];
    }
    const prefix = rawPublicApi.startsWith("/")
      ? rawPublicApi
      : `/${rawPublicApi}`;
    return [
      {
        source: `${prefix}/:path*`,
        destination: `${laravelOrigin.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
