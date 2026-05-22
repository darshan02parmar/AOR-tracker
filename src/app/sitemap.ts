import type { MetadataRoute } from "next";
import { SITEMAP_STATIC_PATHS } from "@/lib/sitemap-paths";
import { STREAM_PAGE_SLUGS } from "@/lib/streams-sitemap-slugs";
import { getSiteUrl } from "@/lib/site-url";

function abs(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

const STATIC_PRIORITIES: Record<(typeof SITEMAP_STATIC_PATHS)[number], number> = {
  "/": 1,
  "/community": 0.75,
  "/roadmap": 0.7,
  "/changelog": 0.65,
  "/aor-to-ppr": 0.9,
  "/cohort": 0.88,
  "/vs-ircc": 0.87,
};

export default function sitemap(): MetadataRoute.Sitemap {
  /** Injected at generation / request time (not a hardcoded calendar date). */
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = SITEMAP_STATIC_PATHS.map((path) => ({
    url: abs(path),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: STATIC_PRIORITIES[path],
  }));

  const streamEntries: MetadataRoute.Sitemap = STREAM_PAGE_SLUGS.map((slug) => ({
    url: abs(`/streams/${slug}`),
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...streamEntries];
}
