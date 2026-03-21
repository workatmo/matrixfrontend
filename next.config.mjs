/** @type {import('next').NextConfig} */
const laravelOrigin = process.env.LARAVEL_PROXY_TARGET ?? "http://127.0.0.1:8000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${laravelOrigin.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
