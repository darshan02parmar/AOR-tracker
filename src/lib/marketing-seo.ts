/** ISO date for schema.org dateModified   bump when YMYL copy changes. */
export const MARKETING_CONTENT_DATE_MODIFIED = "2026-05-22";

/** Human label for hero meta rows, e.g. "Last updated: May 22, 2026". */
export const MARKETING_CONTENT_DATE_LABEL = "May 22, 2026";

export const GH_REPO_URL = "https://github.com/Get-North-Path/AOR-tracker";

/** Community median days (AOR → eCOPR-style) for homepage table and copy. */
export const STREAM_MEDIANS_2026 = {
  cec: 184,
  fsw: 267,
  pnp: 312,
  fst: 284,
  atlantic: 228,
} as const;

export const GET_NORTHPATH_ORG = {
  name: "GetNorthPath",
  url: "https://www.getnorthpath.com",
  sameAs: [GH_REPO_URL, "https://www.getnorthpath.com"] as string[],
};

export type FaqEntry = { name: string; text: string };

export type BreadcrumbItem = { name: string; url: string };

export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": `${GET_NORTHPATH_ORG.url}/#organization`,
    name: GET_NORTHPATH_ORG.name,
    url: GET_NORTHPATH_ORG.url,
    sameAs: GET_NORTHPATH_ORG.sameAs,
  };
}

export function buildWebSiteSchema(siteUrl: string): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "AORTrack",
    url: siteUrl,
    description:
      "Free, open-source Canadian permanent residency processing time tracker with community-sourced cohort medians by Express Entry stream.",
    publisher: { "@id": `${GET_NORTHPATH_ORG.url}/#organization` },
  };
}

export function buildBreadcrumbList(crumbs: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function homeBreadcrumbs(siteUrl: string): BreadcrumbItem[] {
  return [{ name: "Home", url: siteUrl }];
}

export function streamBreadcrumbs(
  siteUrl: string,
  slug: string,
  pageLabel: string,
): BreadcrumbItem[] {
  return [
    { name: "Home", url: siteUrl },
    { name: pageLabel, url: `${siteUrl}/streams/${slug}` },
  ];
}

export function buildFaqPageSchema(
  mainEntity: FaqEntry[],
): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: mainEntity.map((item) => ({
      "@type": "Question",
      name: item.name,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.text,
      },
    })),
  };
}

export function buildJsonLdGraph(
  nodes: Record<string, unknown>[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export const STREAM_FAQ: Record<string, FaqEntry[]> = {
  cec: [
    {
      name: "What is the current CEC processing time in 2026?",
      text: "Based on AORTrack community data, the median CEC processing time (AOR to eCOPR) is approximately 184 days. The P25–P75 window spans roughly 133–217 days. This is community-sourced and not an official IRCC figure.",
    },
    {
      name: "How does CEC processing time compare to FSW?",
      text: "CEC applicants typically receive PPR significantly faster than FSW. Our data shows CEC averaging ~184 days vs FSW averaging ~267 days   roughly an 83-day difference.",
    },
    {
      name: 'What counts as "Day 1" in CEC processing?',
      text: "AORTrack uses the AOR (Acknowledgement of Receipt) date as Day 0. All milestone days are measured from that date   the day IRCC confirms receipt of your complete application.",
    },
    {
      name: "Does province affect CEC processing time?",
      text: "Yes   AORTrack tracks inland vs outland separately. Pure CEC processing times tend to be more consistent across provinces than PNP pathways, but individual results still vary.",
    },
    {
      name: "How is this data collected?",
      text: "Applicants voluntarily submit their AOR date, stream, and milestone dates to AORTrack. All data is anonymous   no PII stored. It's aggregated by cohort month, stream, and type to produce the medians shown here.",
    },
  ],
  fsw: [
    {
      name: "What is the current FSW processing time in 2026?",
      text: "Based on AORTrack community data, the median FSW processing time (AOR to eCOPR) is approximately 267 days. The P25–P75 window spans roughly 192–315 days. This is community-sourced and not an official IRCC figure.",
    },
    {
      name: "Why does FSW take longer than CEC?",
      text: "CEC applicants are Canadian residents (inland), while FSW applicants are typically outside Canada (outland). IRCC processing workflows differ   outland applications involve additional verification steps that add to the overall time. Community data shows a consistent 80+ day gap in 2026.",
    },
    {
      name: "How does AORTrack track FSW processing time?",
      text: "Applicants voluntarily submit their AOR date, stream, type (inland/outland), and milestone dates. Data is anonymous and aggregated by cohort month. The median, P25, and P75 values come from real FSW profiles in the community dataset.",
    },
    {
      name: "Does inland vs outland affect FSW times on AORTrack?",
      text: "Yes   AORTrack tracks inland and outland separately. The headline figures represent the overall FSW pool. Sign up free to compare your specific inland or outland application against your exact cohort.",
    },
    {
      name: "Can I compare my FSW application against CEC applicants?",
      text: "Yes. The processing stats page shows both streams side by side. Log your profile free and see your percentile vs both streams.",
    },
  ],
  pnp: [
    {
      name: "What is PNP processing time on this page?",
      text: "We mean the federal stage: from your Acknowledgement of Receipt (AOR) after submitting your PR application as a provincial nominee, through to eCOPR. Provincial nomination processing time before that is a separate timeline.",
    },
    {
      name: "Why is PNP slower than CEC or FSW on the median?",
      text: "Nominees often need extra verification (employment, nomination conditions, documents from two governments). Variance by province and stream is high   which is why the P25–P75 window is wider than for CEC or FSW in our community data.",
    },
    {
      name: "Does AORTrack split PNP by province?",
      text: "Cohort stats group by stream, type, province, and AOR month where the data supports it. The headline figures here pool PNP federal-stage timelines; start tracking to see how your province compares.",
    },
    {
      name: "Is this official IRCC processing time?",
      text: "No. All numbers are crowd-sourced from AORTrack users. They are useful for relative comparison and cohort context, not as a government guarantee.",
    },
    {
      name: "Where can I compare CEC, FSW, and PNP side by side?",
      text: "Use the processing stats dashboard, or open the CEC and FSW stream pages for the same layout with stream-specific copy.",
    },
  ],
  fst: [
    {
      name: "What is the current FST processing time in 2026?",
      text: "Based on AORTrack community data, the median Federal Skilled Trades (FST) processing time (AOR to eCOPR) is approximately 284 days. The P25–P75 window spans roughly 210–340 days. This is community-sourced and not an official IRCC figure.",
    },
    {
      name: "How does FST compare to FSW and CEC?",
      text: "FST timelines often sit between CEC and FSW on the community median   longer than typical CEC inland files, somewhat closer to FSW outland patterns. Use stream pages and your cohort dashboard for apples-to-apples comparisons.",
    },
    {
      name: "How does AORTrack track FST processing time?",
      text: "Applicants voluntarily submit their AOR date, stream, type (inland/outland), and milestone dates. Data is anonymous and aggregated by cohort month. Medians come from verified FST-tagged profiles in the community dataset.",
    },
    {
      name: "Are FST medicals requested later than CEC?",
      text: "Community timelines often show medicals in the Day 90–140 range for FST   later than many CEC medians. Individual files vary; treat this as a pattern, not a rule.",
    },
    {
      name: "Is this official IRCC processing time?",
      text: "No. All numbers are crowd-sourced from AORTrack users. They help set expectations and compare cohorts   not legal advice or a government guarantee.",
    },
  ],
  atlantic: [
    {
      name: "What is Atlantic Immigration processing time on AORTrack?",
      text: "We report federal-stage timelines from AOR after your PR application as an Atlantic nominee through to eCOPR. Provincial endorsement and employer steps before AOR are separate.",
    },
    {
      name: "Why is Atlantic often faster than PNP on the median?",
      text: "Atlantic Immigration Program cohorts in our data often cluster around shorter federal-stage medians than broad PNP pools   but variance by province (NS, NB, NL, PEI) remains high.",
    },
    {
      name: "Does AORTrack split Atlantic by province?",
      text: "Where sample size allows, cohort keys include province and AOR month. Headline figures pool Atlantic federal-stage timelines; track your file to see your province cohort.",
    },
    {
      name: "How is Atlantic different from Express Entry CEC or FSW?",
      text: "Atlantic pathways include employer and provincial program steps before the federal stage. This page focuses on federal processing after AOR   compare with CEC and FSW stream pages for other programs.",
    },
    {
      name: "Is this official IRCC processing time?",
      text: "No. Figures are community-sourced medians from AORTrack applicants. Use IRCC for policy and case status; use AORTrack for peer context.",
    },
  ],
};

export const COHORT_FAQ: FaqEntry[] = [
  {
    name: "Is my percentile rank an IRCC score?",
    text: "No. It is purely derived from AORTrack user data in your cohort bucket. IRCC does not publish a public percentile for your file.",
  },
  {
    name: "Can competitors copy this concept?",
    text: "Anyone can describe cohorts   the differentiator is consistent methodology, open data pipeline, and community trust. Our source code and issue tracker are public so improvements are debated in the open.",
  },
  {
    name: "Do I need an account?",
    text: "You can start tracking with minimal friction via the /track onboarding flow. We avoid paywalls so the dataset cannot be held hostage.",
  },
  {
    name: "Where is the raw database download?",
    text: "We do not publish bulk PII-adjacent exports. The Dataset schema on this page describes the conceptual dataset; code and aggregates are open, individual rows are not scraped for resale.",
  },
];
