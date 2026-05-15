import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

function structuredDataJsonLd(): Record<string, unknown> {
  const base = getSiteUrl();
  const cohortUrl = `${base}/cohort`;

  const software: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `${base}/#softwareapplication`,
    name: "AORTrack",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: base,
    description:
      "Free, open-source web application for Express Entry applicants: cohort analytics, percentile rank vs peers, milestone timelines, and community-sourced processing statistics.",
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "CAD",
    },
    featureList: [
      "Express Entry cohort tracker by AOR month and stream",
      "Percentile rank vs same-cohort applicants",
      "Processing day histograms and P25 / median / P75",
      "Milestone logging with privacy-preserving design",
    ],
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: "GetNorthPath",
      url: "https://www.getnorthpath.com",
    },
  };

  const dataset: Record<string, unknown> = {
    "@type": "Dataset",
    "@id": `${cohortUrl}#dataset`,
    name: "Express Entry cohort processing and milestone timelines (AORTrack)",
    description:
      "Crowd-sourced, anonymized milestone dates and day-spans for Canadian Express Entry applicants, grouped into cohorts by AOR month, stream (CEC, FSW, PNP, etc.), inland/outland, and province where available. Used to compute cohort medians, percentiles, and rank.",
    url: cohortUrl,
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: "GetNorthPath",
      url: "https://www.getnorthpath.com",
    },
    publisher: {
      "@type": "Organization",
      name: "GetNorthPath",
      url: "https://www.getnorthpath.com",
    },
    spatialCoverage: { "@type": "Country", name: "Canada" },
    temporalCoverage: "2024/2026",
    keywords: "express entry cohort tracker, express entry percentile rank, AOR cohort, Canada PR",
    distribution: {
      "@type": "DataDownload",
      contentUrl: "https://github.com/Get-North-Path/AOR-tracker",
      encodingFormat: "https://www.iana.org/assignments/media-types/text/html",
      description: "Open-source application and documentation; raw cohort data is not bulk-exported publicly.",
    },
  };

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    name: "Express Entry Cohort Analytics — Find Your Rank",
    url: cohortUrl,
    description:
      "How AORTrack builds Express Entry cohort analytics, percentile rank, and trustworthy methodology for finding your position vs peers.",
    about: { "@id": `${cohortUrl}#dataset` },
    mainEntity: { "@id": `${cohortUrl}#dataset` },
    isPartOf: { "@type": "WebSite", name: "AORTrack", url: base },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [software, dataset, webPage],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteUrl();
  const url = `${base}/cohort`;
  const title = "Express Entry Cohort Analytics — Find Your Rank | AORTrack";
  const description =
    "Express Entry cohort tracker and percentile rank: how AORTrack groups applicants by AOR month and stream, computes your rank vs peers, and publishes open methodology — free, community-powered.";
  return {
    title,
    description,
    keywords: [
      "express entry cohort tracker",
      "express entry percentile rank",
      "AOR cohort analytics",
      "Canada PR cohort",
      "Express Entry rank",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

async function readGuideHtml(): Promise<string> {
  const file = path.join(process.cwd(), "src", "content", "guides", "cohort.html");
  return readFile(file, "utf8");
}

export default async function CohortFeaturePage() {
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
