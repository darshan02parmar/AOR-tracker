import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingHtmlContent } from "@/components/marketing/MarketingHtmlContent";
import {
  buildFaqPageSchema,
  buildJsonLdGraph,
  MARKETING_CONTENT_DATE_MODIFIED,
  STREAM_FAQ,
} from "@/lib/marketing-seo";
import { getSiteUrl } from "@/lib/site-url";
import { STREAM_PAGE_SLUGS, streamLabelFromSitemapSlug } from "@/lib/streams-sitemap-slugs";

function buildStreamDatasetJsonLd(opts: {
  url: string;
  name: string;
  description: string;
  dateModified: string;
}): Record<string, unknown> {
  return {
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    dateModified: opts.dateModified,
    publisher: {
      "@type": "Organization",
      name: "GetNorthPath",
      url: "https://www.getnorthpath.com",
    },
    spatialCoverage: { "@type": "Country", name: "CA" },
    temporalCoverage: "2026",
    additionalProperty: [{ "@type": "PropertyValue", name: "updateFrequency", value: "daily" }],
  };
}

type Props = { params: Promise<{ slug: string }> };

/** ISR: revalidate once per hour so edits to content files propagate without a full redeploy. */
export const revalidate = 3600;

export function generateStaticParams() {
  return STREAM_PAGE_SLUGS.map((slug) => ({ slug }));
}

const RICH_SLUGS = new Set(["cec", "fsw", "pnp"]);

const RICH_META: Record<string, Pick<Metadata, "title" | "description">> = {
  cec: {
    title: "CEC Processing Time 2026 — Live Community Data | AORTrack",
    description:
      "CEC processing time 2026 and Canadian Experience Class wait time from live AORTrack cohorts — median 184 days, P25–P75, histogram. Free.",
  },
  fsw: {
    title: "FSW Processing Time 2026 — Federal Skilled Worker | AORTrack",
    description:
      "FSW processing time 2026 — avg 267 days from community data. Full FSW vs CEC comparison, cohort histogram, P25–P75. Free.",
  },
  pnp: {
    title: "PNP Processing Time 2026 — Provincial Nominee Program | AORTrack",
    description:
      "PNP processing time 2026 from community data — median ~312 days, P25–P75, vs CEC and FSW. Provincial nominee PR timelines on AORTrack. Free.",
  },
};

const RICH_LD: Record<string, { name: string; description: string }> = {
  cec: {
    name: "Canadian Experience Class (CEC) PR processing timelines 2026",
    description:
      "Crowd-sourced AOR-to-eCOPR day spans and cohort histograms for CEC streams on AORTrack (community data, not IRCC official).",
  },
  fsw: {
    name: "Federal Skilled Worker (FSW) PR processing timelines 2026",
    description:
      "Crowd-sourced FSW processing times with cohort histogram, P25–P75, and CEC vs FSW comparison on AORTrack.",
  },
  pnp: {
    name: "Provincial Nominee Program (PNP) PR processing timelines 2026",
    description:
      "Crowd-sourced PNP federal-stage processing times with histogram, P25–P75, and comparison to CEC and FSW on AORTrack.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const base = getSiteUrl();
  const url = `${base}/streams/${slug}`;

  if (RICH_META[slug]) {
    return {
      ...RICH_META[slug],
      alternates: { canonical: url },
      openGraph: {
        title: RICH_META[slug].title as string,
        description: RICH_META[slug].description as string,
        url,
        type: "website",
      },
    };
  }

  const label = streamLabelFromSitemapSlug(slug);
  if (!label) return { title: "Stream — AORTrack" };
  return {
    title: `${label} — PR timelines | AORTrack`,
    description: `Crowd-sourced Canadian PR processing timelines for ${label}.`,
    alternates: { canonical: url },
  };
}

async function readHtml(slug: string): Promise<string> {
  const file = path.join(process.cwd(), "src", "content", "streams", `${slug}.html`);
  return readFile(file, "utf8");
}

export default async function StreamLandingPage({ params }: Props) {
  const { slug } = await params;

  if (RICH_SLUGS.has(slug)) {
    const html = await readHtml(slug);
    const pageUrl = `${getSiteUrl()}/streams/${slug}`;
    const ldInfo = RICH_LD[slug]!;
    const ld = buildJsonLdGraph([
      buildStreamDatasetJsonLd({
        url: pageUrl,
        name: ldInfo.name,
        description: ldInfo.description,
        dateModified: MARKETING_CONTENT_DATE_MODIFIED,
      }),
      buildFaqPageSchema(STREAM_FAQ[slug]!),
      {
        "@type": "WebPage",
        name: RICH_META[slug]!.title as string,
        url: pageUrl,
        description: ldInfo.description,
        dateModified: MARKETING_CONTENT_DATE_MODIFIED,
        isPartOf: { "@type": "WebSite", name: "AORTrack", url: getSiteUrl() },
      },
    ]);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
        <MarketingHtmlContent html={html} className="stream-page" />
      </>
    );
  }

  const label = streamLabelFromSitemapSlug(slug);
  if (!label) notFound();

  return (
    <div className="stream-page" style={{ padding: "4rem clamp(1rem, 4vw, 3rem)" }}>
      <h1 style={{ fontFamily: "var(--fh)", fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>{label}</h1>
      <p style={{ color: "#5c5348", marginBottom: "2rem", maxWidth: "36rem" }}>
        Explore real applicant milestones and cohort stats for this stream on AORTrack — free, no account required.
      </p>
      <a
        href="/track"
        className="btn-red"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "48px",
          padding: "12px 24px",
          borderRadius: "8px",
          fontWeight: 700,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        Start tracking →
      </a>
    </div>
  );
}
