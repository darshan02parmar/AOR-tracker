import type { Metadata } from "next";
import { STREAM_PAGE_SLUGS } from "@/lib/streams-sitemap-slugs";

/** Use on every route in {@link NON_SITEMAP_DISALLOW_PATHS} (not listed in sitemap.xml). */
export const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
};

/** Marketing / SEO paths included in sitemap.xml (and allowed for AI crawlers). */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/community",
  "/roadmap",
  "/changelog",
  "/aor-to-ppr",
  "/cohort",
  "/vs-ircc",
] as const;

/** App routes not in the sitemap — blocked for AI crawlers. */
export const NON_SITEMAP_DISALLOW_PATHS = [
  "/track",
  "/dashboard/",
  "/wiki",
  "/api/",
  "/s/",
] as const;

/** Path prefixes allowed for AI crawlers (robots Allow). */
export function getSitemapAllowPaths(): string[] {
  return [
    ...SITEMAP_STATIC_PATHS,
    ...STREAM_PAGE_SLUGS.map((slug) => `/streams/${slug}`),
  ];
}

/** Explicit disallow list + `/` catch-all (only sitemap Allow paths are crawlable). */
export function getAiCrawlerDisallowPaths(): string[] {
  return [...NON_SITEMAP_DISALLOW_PATHS];
}
