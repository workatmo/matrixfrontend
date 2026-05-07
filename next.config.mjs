/** @type {import('next').NextConfig} */
// If you need a static export for shared hosting, build with:
//   STATIC_EXPORT=1 npm run build
// Route handlers (used for the Laravel proxy in local dev) are not supported
// when `output: "export"` is enabled.
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig =
  process.env.STATIC_EXPORT === "1"
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {
        turbopack: {
          root: __dirname,
        },
        images: {
          remotePatterns: [
            {
              protocol: "https",
              hostname: "api.matrixmobiletyresandautos.com",
              pathname: "/**",
            },
            {
              protocol: "http",
              hostname: "localhost",
              port: "8000",
              pathname: "/**",
            },
            {
              protocol: "http",
              hostname: "127.0.0.1",
              port: "8000",
              pathname: "/**",
            },
          ],
        },
      };

export default nextConfig;
