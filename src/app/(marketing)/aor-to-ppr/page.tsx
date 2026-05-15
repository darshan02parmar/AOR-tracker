import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

function structuredDataJsonLd(): Record<string, unknown> {
  const base = getSiteUrl();
  const howTo = {
    "@type": "HowTo",
    name: "Express Entry: from ITA to CoPR (Canada PR)",
    description:
      "Step-by-step overview of the Canadian Express Entry permanent residence timeline after invitation, through AOR, biometrics, medicals, background check, PPR, and electronic CoPR.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Invitation to Apply (ITA)",
        text: "Receive an ITA in an Express Entry draw. You typically have 60 days to submit a complete application for permanent residence.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Submit application and receive AOR",
        text: "Submit your eAPR through the IRCC portal. IRCC issues an Acknowledgement of Receipt (AOR) when the file is considered complete — this date starts most internal processing clocks.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Biometrics",
        text: "Receive a biometrics instruction letter (BIL), attend a collection point, and wait for biometrics to link to your file. Community medians often fall in the first weeks after AOR.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Medical examination",
        text: "Complete an IME with a panel physician. Results are sent to IRCC; processing continues while medical validity is confirmed.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Background and eligibility review",
        text: "Security, criminality, and eligibility checks run in parallel with other steps. Status may show as 'review required' or similar on the IRCC tracker.",
      },
      {
        "@type": "HowToStep",
        position: 6,
        name: "Passport Request (PPR) / portal invitation",
        text: "If approved in principle, IRCC requests passports (outland) or invites you to the Permanent Residence Portal (inland) to confirm details before CoPR.",
      },
      {
        "@type": "HowToStep",
        position: 7,
        name: "Confirmation of Permanent Residence (CoPR / eCOPR)",
        text: "Receive CoPR or eCOPR in the portal. You are a permanent resident from the date indicated; the PR card is mailed separately.",
      },
    ],
  };

  const faq: Record<string, unknown> = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long does Express Entry take from AOR to PPR in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It varies by stream and cohort. On AORTrack community data for 2026, median federal-stage timelines are often near ~184 days for CEC, ~267 days for FSW, and ~312 days for PNP-linked files — measured from AOR to eCOPR/PPR-equivalent milestones. IRCC publishes service standards separately; use community data as a complement, not a guarantee.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between AOR and PPR?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AOR (Acknowledgement of Receipt) confirms IRCC has your complete application. PPR (Passport Request) or a PR Portal invitation means a decision in principle is positive and IRCC is ready for final steps before CoPR. Many steps occur between these two events.",
        },
      },
      {
        "@type": "Question",
        name: "What comes after PPR for Canada PR?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You may submit passports (outland) or complete Permanent Residence Portal steps (inland), then receive CoPR or eCOPR. After eCOPR you apply for your first PR card.",
        },
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      howTo,
      faq,
      {
        "@type": "WebPage",
        name: "AOR to PPR timeline — Canada PR guide",
        url: `${base}/aor-to-ppr`,
        isPartOf: { "@type": "WebSite", name: "AORTrack", url: base },
      },
    ],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteUrl();
  const url = `${base}/aor-to-ppr`;
  const title =
    "AOR to PPR Timeline Canada PR: From Submission to Passport Request | AORTrack";
  const description =
    "AOR to PPR timeline for Canada PR and Express Entry in 2026: ITA → AOR → biometrics → medicals → background check → PPR → CoPR. Community average days per step, CEC vs FSW vs PNP, and how to track with AORTrack (not IRCC official).";
  return {
    title,
    description,
    keywords: [
      "AOR to PPR timeline",
      "Canada PR processing time",
      "AOR to PPR 2026",
      "AOR to PPR tracker",
      "Express Entry processing time",
      "how long does express entry take",
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
  const file = path.join(process.cwd(), "src", "content", "guides", "aor-to-ppr.html");
  return readFile(file, "utf8");
}

export default async function AorToPprGuidePage() {
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
