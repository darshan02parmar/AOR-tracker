import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/dashboard/stats"],
      disallow: ["/dashboard/", "/api/", "/s/", "/wiki"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
