import type { MetadataRoute } from "next";
import { STREAM_PAGE_SLUGS } from "@/lib/streams-sitemap-slugs";
import { getSiteUrl } from "@/lib/site-url";

function abs(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  /** Injected at generation / request time (not a hardcoded calendar date). */
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: abs("/track"), lastModified, changeFrequency: "weekly", priority: 0.95 },
    {
      url: abs("/dashboard/stats"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.85,
    },
    { url: abs("/community"), lastModified, changeFrequency: "weekly", priority: 0.75 },
    { url: abs("/roadmap"), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/changelog"), lastModified, changeFrequency: "weekly", priority: 0.65 },
    { url: abs("/wiki"), lastModified, changeFrequency: "monthly", priority: 0.6 },
    {
      url: abs("/aor-to-ppr"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: abs("/cohort"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: abs("/vs-ircc"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.87,
    },
  ];

  const streamEntries: MetadataRoute.Sitemap = STREAM_PAGE_SLUGS.map((slug) => ({
    url: abs(`/streams/${slug}`),
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...streamEntries];
}
