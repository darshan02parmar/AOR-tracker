/** ISO date for schema.org dateModified — bump when YMYL copy changes. */
export const MARKETING_CONTENT_DATE_MODIFIED = "2026-05-22";

/** Human label for hero meta rows, e.g. "Last updated: May 22, 2026". */
export const MARKETING_CONTENT_DATE_LABEL = "May 22, 2026";

export type FaqEntry = { name: string; text: string };

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
      text: "CEC applicants typically receive PPR significantly faster than FSW. Our data shows CEC averaging ~184 days vs FSW averaging ~267 days — roughly an 83-day difference.",
    },
    {
      name: 'What counts as "Day 1" in CEC processing?',
      text: "AORTrack uses the AOR (Acknowledgement of Receipt) date as Day 0. All milestone days are measured from that date — the day IRCC confirms receipt of your complete application.",
    },
    {
      name: "Does province affect CEC processing time?",
      text: "Yes — AORTrack tracks inland vs outland separately. Pure CEC processing times tend to be more consistent across provinces than PNP pathways, but individual results still vary.",
    },
    {
      name: "How is this data collected?",
      text: "Applicants voluntarily submit their AOR date, stream, and milestone dates to AORTrack. All data is anonymous — no PII stored. It's aggregated by cohort month, stream, and type to produce the medians shown here.",
    },
  ],
  fsw: [
    {
      name: "What is the current FSW processing time in 2026?",
      text: "Based on AORTrack community data, the median FSW processing time (AOR to eCOPR) is approximately 267 days. The P25–P75 window spans roughly 192–315 days. This is community-sourced and not an official IRCC figure.",
    },
    {
      name: "Why does FSW take longer than CEC?",
      text: "CEC applicants are Canadian residents (inland), while FSW applicants are typically outside Canada (outland). IRCC processing workflows differ — outland applications involve additional verification steps that add to the overall time. Community data shows a consistent 80+ day gap in 2026.",
    },
    {
      name: "How does AORTrack track FSW processing time?",
      text: "Applicants voluntarily submit their AOR date, stream, type (inland/outland), and milestone dates. Data is anonymous and aggregated by cohort month. The median, P25, and P75 values come from real FSW profiles in the community dataset.",
    },
    {
      name: "Does inland vs outland affect FSW times on AORTrack?",
      text: "Yes — AORTrack tracks inland and outland separately. The headline figures represent the overall FSW pool. Sign up free to compare your specific inland or outland application against your exact cohort.",
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
      text: "Nominees often need extra verification (employment, nomination conditions, documents from two governments). Variance by province and stream is high — which is why the P25–P75 window is wider than for CEC or FSW in our community data.",
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
};

export const COHORT_FAQ: FaqEntry[] = [
  {
    name: "Is my percentile rank an IRCC score?",
    text: "No. It is purely derived from AORTrack user data in your cohort bucket. IRCC does not publish a public percentile for your file.",
  },
  {
    name: "Can competitors copy this concept?",
    text: "Anyone can describe cohorts — the differentiator is consistent methodology, open data pipeline, and community trust. Our source code and issue tracker are public so improvements are debated in the open.",
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
