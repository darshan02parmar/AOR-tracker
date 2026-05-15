import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

function structuredDataJsonLd(): Record<string, unknown> {
  const base = getSiteUrl();
  const pageUrl = `${base}/vs-ircc`;

  const software: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `${base}/#softwareapplication`,
    name: "AORTrack",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: base,
    description:
      "Community-powered Express Entry processing statistics: compare real milestone timelines to IRCC service standards by stream.",
    offers: { "@type": "Offer", price: 0, priceCurrency: "CAD" },
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: "GetNorthPath",
      url: "https://www.getnorthpath.com",
    },
  };

  const faq: Record<string, unknown> = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is IRCC wrong about Express Entry processing times?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "IRCC publishes service standards and inventory-based estimates that describe typical targets and backlogs — not a personal guarantee for your file. Community trackers measure realized timelines (for example AOR to PPR or eCOPR) for self-selected cohorts. Both can be “right” for different definitions; the gap is usually definitional, not a conspiracy.",
        },
      },
      {
        "@type": "Question",
        name: "Why does IRCC say ~6 months while many files take longer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Published figures are often averages or targets across many streams and offices, exclude some complexity categories, and lag operational reality. Individual timelines depend on stream (CEC vs FSW vs PNP), completeness, security or medical flags, and global inventory. Community medians for some streams frequently exceed six months for the federal stage.",
        },
      },
      {
        "@type": "Question",
        name: "How does AORTrack compare to IRCC processing times?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AORTrack aggregates anonymized milestone dates volunteered by applicants to show cohort medians and percentiles by AOR month and stream. IRCC publishes official service standards and tools. Use IRCC for authoritative policy and status; use community statistics for expectation-setting and peer context — never as legal advice.",
        },
      },
    ],
  };

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    name: "Real Express Entry Processing Times vs IRCC's Estimate",
    url: pageUrl,
    description:
      "Comparison of IRCC Express Entry service standards and community-reported processing timelines by stream, with methodology and limitations.",
    isPartOf: { "@type": "WebSite", name: "AORTrack", url: base },
    about: { "@type": "Thing", name: "Canadian Express Entry processing times" },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [software, faq, webPage],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteUrl();
  const url = `${base}/vs-ircc`;
  const title = "Real Express Entry Processing Times vs IRCC's Estimate | AORTrack";
  const description =
    "IRCC processing time vs real timelines: why generic Express Entry estimates often disagree with community data. Compare CEC, FSW, and PNP federal-stage medians to official service standards — methodology, bias, and how to use both.";
  return {
    title,
    description,
    keywords: [
      "IRCC express entry processing time",
      "express entry processing time vs estimate",
      "IRCC processing time wrong",
      "real express entry processing time",
      "Express Entry 6 months",
      "Canada PR processing time community",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
  };
}

async function readGuideHtml(): Promise<string> {
  const file = path.join(process.cwd(), "src", "content", "guides", "vs-ircc.html");
  return readFile(file, "utf8");
}

export default async function VsIrccPage() {
  const html = await readGuideHtml();
  const ld = structuredDataJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
