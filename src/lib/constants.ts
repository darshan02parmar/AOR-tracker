import type { MilestoneKey } from "./types";

export const MILESTONE_DEFS: {
  key: MilestoneKey;
  label: string;
  est: string;
  desc: string;
}[] = [
  {
    key: "aor",
    label: "AOR received",
    est: "~Feb 2025",
    desc: "Acknowledgement of receipt confirmed by IRCC",
  },
  {
    key: "bil",
    label: "Biometrics instruction letter",
    est: "~15d after AOR",
    desc: "Avg. 15 days after AOR in your cohort",
  },
  {
    key: "biometrics",
    label: "Biometrics completed",
    est: "~27d after AOR",
    desc: "Tracker may lag 3–5 days after completion",
  },
  {
    key: "background",
    label: "Background check initiated",
    est: "~Apr–May 2025",
    desc: "Appears on IRCC tracker · median day 58",
  },
  {
    key: "medical",
    label: "Medical results received",
    est: "~Jun–Jul 2025",
    desc: "Officer review begins shortly after · median 112d",
  },
  {
    key: "p1",
    label: "P1 — PR Portal (first invitation)",
    est: "~Aug–Sep 2025",
    desc:
      "IRCC invites you to the Permanent Residence Portal to confirm you are in Canada and submit the first set of details (see canada.ca PR confirmation portal).",
  },
  {
    key: "p2",
    label: "P2 — PR Portal (photo & address)",
    est: "~Sep 2025",
    desc:
      "Second portal step: submit your portrait photo and Canadian mailing address for your PR card after your file is approved in principle in the portal.",
  },
  {
    key: "ecopr",
    label: "eCOPR issued",
    est: "~Sep–Oct 2025",
    desc:
      "Electronic Confirmation of Permanent Residence uploaded to your portal — formal PR grant; valid proof of status while you wait for the PR card.",
  },
];

export const STREAM_OPTIONS = [
  "CEC General",
  // "CEC STEM",
  // "CEC Healthcare",
  // "CEC French",
  "FSW General",
  "PNP",
] as const;

export const PROVINCES = [
  "Ontario",
  "British Columbia",
  "Alberta",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "Other",
] as const;

/**
 * Base WES table; `buildWesRowsForCohort` in `cohort-dynamic.ts` scales `d` from cohort median timeline.
 */
export const WES_ROW_TEMPLATE = [
  {
    t: "Regular WES",
    s: "dl" as const,
    d: 62,
    n: "IRCC cannot verify — upload scanned copy",
  },
  {
    t: "IRCC Course-by-Course",
    s: "ok" as const,
    d: 5,
    n: "Recommended for PR applications",
  },
  { t: "ECA (General)", s: "ok" as const, d: 7, n: "Standard; verify expiry date" },
  { t: "WES Premium", s: "pe" as const, d: 14, n: "No IRCC-direct option" },
] as const;
