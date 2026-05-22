import type { MetadataRoute } from "next";
import {
  getAiCrawlerDisallowPaths,
  getSitemapAllowPaths,
  NON_SITEMAP_DISALLOW_PATHS,
} from "@/lib/sitemap-paths";
import { getSiteUrl } from "@/lib/site-url";

const sitemapAllowPaths = getSitemapAllowPaths();
const aiDisallowPaths = getAiCrawlerDisallowPaths();

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: ["*"],
      allow: sitemapAllowPaths,
      disallow: aiDisallowPaths,
      },
    sitemap: `${base}/sitemap.xml`,
  };
}
