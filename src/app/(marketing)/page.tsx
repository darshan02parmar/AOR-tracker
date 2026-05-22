import "@/styles/landing.css";
import { LandingMarketingClient } from "@/components/marketing/LandingMarketingClient";
import {
  buildJsonLdGraph,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/marketing-seo";
import { buildPageMetadata } from "@/lib/marketing-metadata";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = buildPageMetadata({
  title: "AORTrack — Free, Open-Source Canadian PR Processing Time Tracker",
  description:
    "Track Canadian PR processing time with crowd-sourced Express Entry data by stream and cohort. Free, open-source, community medians — not IRCC official.",
  path: "/",
  ogImage: "home",
  openGraphTitle: "AORTrack — Free Canadian PR Processing Time Tracker",
  openGraphDescription:
    "Real processing timelines from the community — not IRCC's generic estimate.",
  keywords: [
    "AORTrack",
    "Canada PR processing time",
    "Express Entry processing time tracker",
    "AOR to PPR community data",
  ],
});

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
