import type { Metadata } from "next";
import "@/styles/landing.css";
import { LandingMarketingClient } from "@/components/marketing/LandingMarketingClient";
import {
  buildJsonLdGraph,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/marketing-seo";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "AORTrack — Free, Open-Source Canadian PR Processing Time Tracker",
  description:
    "Track your Canadian permanent residency processing time with real crowd-sourced data from thousands of applicants. Free forever, open-source, no signup.",
  openGraph: {
    title: "AORTrack — Free Canadian PR Processing Time Tracker",
    description:
      "Real processing timelines from the community — not IRCC's generic estimate.",
    url: "https://track.getnorthpath.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://track.getnorthpath.com",
  },
};

export default function MarketingHomePage() {
  const siteUrl = getSiteUrl();
  const ld = buildJsonLdGraph([
    buildOrganizationSchema(),
    buildWebSiteSchema(siteUrl),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <LandingMarketingClient />
    </>
  );
}
