import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const host = publicAppUrl.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account"],
    },
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
