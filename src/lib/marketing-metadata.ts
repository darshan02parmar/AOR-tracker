import type { Metadata } from "next";
import { MARKETING_CONTENT_DATE_MODIFIED } from "@/lib/marketing-seo";
import { NOINDEX_ROBOTS } from "@/lib/sitemap-paths";
import { getSiteUrl } from "@/lib/site-url";

export type OgImageTemplate = "home" | "stream" | "guide";

/** Relative paths; resolved via metadataBase in root layout. */
export const OG_IMAGES: Record<OgImageTemplate, string> = {
  home: "/og/home.png",
  stream: "/og/stream.png",
  guide: "/og/guide.png",
};

export const TWITTER_SITE = "@GetNorthPath";

export function getWebsiteId(siteUrl?: string): string {
  return `${siteUrl ?? getSiteUrl()}/#website`;
}

export const STREAM_KEYWORDS: Record<string, string[]> = {
  cec: [
    "CEC processing time 2026",
    "Canadian Experience Class processing time",
    "CEC AOR to PPR",
    "Express Entry CEC wait time",
    "Canada PR processing time community",
  ],
  fsw: [
    "FSW processing time 2026",
    "Federal Skilled Worker processing time",
    "FSW AOR to eCOPR",
    "Express Entry FSW timeline",
    "outland PR processing time",
  ],
  pnp: [
    "PNP processing time 2026",
    "Provincial Nominee Program federal stage",
    "PNP AOR to PPR",
    "Express Entry PNP timeline",
    "provincial nominee PR wait time",
  ],
  fst: [
    "FST processing time 2026",
    "Federal Skilled Trades processing time",
    "FST AOR to eCOPR",
    "Express Entry skilled trades timeline",
  ],
  atlantic: [
    "Atlantic Immigration processing time",
    "AIP processing time 2026",
    "Atlantic nominee PR timeline",
    "NS NB NL PEI immigration processing",
  ],
};

export const STREAM_RICH_META: Record<
  string,
  { title: string; description: string }
> = {
  cec: {
    title: "CEC Processing Time 2026 — Live Community Data | AORTrack",
    description:
      "CEC processing time 2026 and Canadian Experience Class wait time from live AORTrack cohorts — median 184 days, P25–P75, histogram. Free.",
  },
  fsw: {
    title: "FSW Processing Time 2026 — Federal Skilled Worker | AORTrack",
    description:
      "FSW processing time 2026 — median 267 days from community data. Full FSW vs CEC comparison, cohort histogram, P25–P75. Free.",
  },
  pnp: {
    title: "PNP Processing Time 2026 — Provincial Nominee Program | AORTrack",
    description:
      "PNP processing time 2026 from community data — median ~312 days, P25–P75, vs CEC and FSW. Provincial nominee PR timelines on AORTrack. Free.",
  },
  fst: {
    title: "FST Processing Time 2026 — Federal Skilled Trades | AORTrack",
    description:
      "FST processing time 2026 — median 284 days from community data. Federal Skilled Trades vs FSW and CEC comparison, histogram, P25–P75. Free.",
  },
  atlantic: {
    title: "Atlantic Immigration Program Processing Time 2026 | AORTrack",
    description:
      "Atlantic Immigration Program processing time 2026 — median 228 days from community data. NS, NB, NL, PEI federal-stage timelines vs PNP and CEC. Free.",
  },
};

type BuildPageMetadataOpts = {
  title: string;
  description: string;
  /** Path only, e.g. `/cohort` */
  path: string;
  ogImage?: OgImageTemplate;
  ogType?: "website" | "article";
  keywords?: string[];
  robots?: Metadata["robots"];
  /** Shorter OG title if SERP title is long */
  openGraphTitle?: string;
  openGraphDescription?: string;
  includeModifiedTime?: boolean;
};

function ogImageUrl(template: OgImageTemplate): string {
  return OG_IMAGES[template];
}

function twitterImages(template: OgImageTemplate): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    site: TWITTER_SITE,
    creator: TWITTER_SITE,
    images: [ogImageUrl(template)],
  };
}

/** Metadata for app/private routes that are not in sitemap.xml. */
export function buildNoIndexMetadata(
  opts: Omit<BuildPageMetadataOpts, "robots">,
): Metadata {
  return buildPageMetadata({ ...opts, robots: NOINDEX_ROBOTS });
}

export function buildPageMetadata(opts: BuildPageMetadataOpts): Metadata {
  const base = getSiteUrl();
  const url = opts.path === "/" ? base : `${base}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;
  const ogTemplate = opts.ogImage ?? "home";
  const ogTitle = opts.openGraphTitle ?? opts.title;
  const ogDescription = opts.openGraphDescription ?? opts.description;
  const ogType = opts.ogType ?? "website";

  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    robots: opts.robots,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      type: ogType,
      locale: "en_CA",
      siteName: "AORTrack",
      images: [{ url: ogImageUrl(ogTemplate), width: 1200, height: 630, alt: "AORTrack" }],
      ...(opts.includeModifiedTime
        ? { modifiedTime: MARKETING_CONTENT_DATE_MODIFIED }
        : {}),
    },
    twitter: {
      ...twitterImages(ogTemplate),
      title: ogTitle,
      description: ogDescription,
    },
    ...(opts.includeModifiedTime
      ? {
          other: {
            "article:modified_time": MARKETING_CONTENT_DATE_MODIFIED,
          },
        }
      : {}),
  };
}

export function buildStreamMetadata(slug: string): Metadata | null {
  const meta = STREAM_RICH_META[slug];
  if (!meta) return null;
  return buildPageMetadata({
    title: meta.title,
    description: meta.description,
    path: `/streams/${slug}`,
    ogImage: "stream",
    keywords: STREAM_KEYWORDS[slug],
    includeModifiedTime: true,
  });
}
