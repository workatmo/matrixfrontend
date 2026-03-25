/** @type {import('next').NextConfig} */
// If you need a static export for shared hosting, build with:
//   STATIC_EXPORT=1 npm run build
// Route handlers (used for the Laravel proxy in local dev) are not supported
// when `output: "export"` is enabled.
const nextConfig =
  process.env.STATIC_EXPORT === "1"
    ? { output: "export" }
    : {};

export default nextConfig;
