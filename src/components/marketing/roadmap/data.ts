/**
 * Roadmap data — types and async loader.
 *
 * Kanban cards, stats, hero pills, and milestones come from GitHub
 * (org project board + REST) via `src/lib/github-roadmap.ts`. When the token
 * is missing or the API fails, static page chrome is kept with empty live slices.
 */

import { ISSUES_URL, loadLiveRoadmapSlice, REPO_URL } from "@/lib/github-roadmap";

// ─── Types ──────────────────────────────────────────────────────────────────

export type RoadmapStatus = "planned" | "in-progress" | "done";

export type RoadmapPriority = "high" | "medium" | "low";

/**
 * Tag/category labels that we filter the kanban by. Each is rendered with a
 * coloured pill on the card and with a colored dot in the filter bar.
 */
export type RoadmapCategory =
  | "feat"
  | "bug"
  | "data"
  | "seo"
  | "sec"
  | "perf"
  | "ux";

export type RoadmapAvatarTone =
  | "blue"
  | "green"
  | "amber"
  | "purple"
  | "red"
  | "navy";

export type RoadmapAssignee = {
  initials: string;
  /** e.g. "@community-dev" — optional handle. */
  handle?: string;
  tone: RoadmapAvatarTone;
};

export type RoadmapCard = {
  /**
   * GitHub issue number. We render `#NN` and link to
   * `${REPO}/issues/${issue}` on click.
   */
  issue: number;
  title: string;
  description: string;
  status: RoadmapStatus;
  priority: RoadmapPriority;
  /** All matching filter chips; first one is used as the visual primary. */
  categories: RoadmapCategory[];
  votes: number;
  /** Did the current visitor already upvote this issue? */
  voted?: boolean;
  /** Progress 0-100 for in-progress cards. */
  progress?: number;
  /** Short PR / status line shown in a pale-blue note row. */
  note?: string;
  /** For shipped cards: human-readable ship date label. */
  shippedAt?: string;
  /** Optional version suffix in the right-rail (e.g. "v0.4.0"). */
  shippedVersion?: string;
  /** Optional second avatar slot for in-progress cards. */
  assignee?: RoadmapAssignee;
  /** When set, the card links here instead of GitHub issue URL. */
  linkOverride?: string;
};

export type RoadmapMilestoneState = "reached" | "current" | "planned";

export type RoadmapMilestone = {
  /** e.g. "v0.4". */
  version: string;
  /** e.g. "May 1, 2026". */
  date: string;
  /** "Reached" / "In Progress" / "Planned" / "Target" — purely cosmetic. */
  status: string;
  state: RoadmapMilestoneState;
  title: string;
  description: string;
  chips: string[];
};

export type RoadmapHeroPill = {
  label: string;
  value: string;
};

export type RoadmapStatCell = {
  value: number;
  label: string;
  tone?: "default" | "red" | "blue" | "green";
};

export type RoadmapFilterChip = {
  id: "all" | RoadmapCategory;
  label: string;
  /** Bullet colour (CSS var); omitted for "All". */
  dot?: string;
};

export type RoadmapData = {
  hero: {
    eyebrow: string;
    headlineLead: string;
    headlineEmphasis: string;
    sub: string;
    pills: RoadmapHeroPill[];
  };
  stats: RoadmapStatCell[];
  filters: RoadmapFilterChip[];
  cards: RoadmapCard[];
  milestones: RoadmapMilestone[];
  /**
   * Anchor URLs the page links to in various places.
   * Kept as plain strings so the whole shape is serialisable and can cross
   * the server → client component boundary (Next.js disallows functions
   * being passed into client components).
   */
  links: {
    repo: string;
    issues: string;
    feedback: string;
    changelog: string;
    /** Base URL of an individual issue page — append `/${number}` to it. */
    issueBase: string;
  };
};

// ─── Static page chrome ─────────────────────────────────────────────────────

const ROADMAP_FILTERS: RoadmapFilterChip[] = [
  { id: "all", label: "All" },
  { id: "feat", label: "Feature", dot: "var(--blue)" },
  { id: "bug", label: "Bug Fix", dot: "var(--red)" },
  { id: "data", label: "Data Quality", dot: "var(--green)" },
  { id: "seo", label: "SEO", dot: "var(--purple)" },
  { id: "perf", label: "Performance", dot: "var(--teal)" },
];

const ROADMAP_LINKS: RoadmapData["links"] = {
  repo: REPO_URL,
  issues: ISSUES_URL,
  feedback: `${REPO_URL}/issues/new/choose`,
  changelog: "/changelog",
  issueBase: ISSUES_URL,
};

function emptyHeroPills(): RoadmapHeroPill[] {
  return [
    { label: "Last synced", value: "—" },
    { label: "Open issues", value: "0" },
    { label: "Contributors", value: "0" },
    { label: "GitHub stars", value: "0" },
  ];
}

function emptyStats(): RoadmapStatCell[] {
  return [
    { value: 0, label: "Planned features" },
    { value: 0, label: "In progress", tone: "blue" },
    { value: 0, label: "Shipped this cycle", tone: "green" },
    { value: 0, label: "Community votes", tone: "red" },
  ];
}

// ─── Loader ─────────────────────────────────────────────────────────────────

/** Loads roadmap data from GitHub (ISR-cached). */
export async function getRoadmap(): Promise<RoadmapData> {
  const live = await loadLiveRoadmapSlice();

  return {
    hero: {
      eyebrow: "Open Source · Built in Public",
      headlineLead: "What we're building",
      headlineEmphasis: "next.",
      sub: "Every feature here was requested by the community. Upvote what matters. Claim an issue and ship code. This board syncs live from GitHub.",
      pills: live?.heroPills ?? emptyHeroPills(),
    },
    stats: live?.stats ?? emptyStats(),
    filters: ROADMAP_FILTERS,
    cards: live?.cards ?? [],
    milestones: live?.milestones ?? [],
    links: ROADMAP_LINKS,
  };
}

// ─── Helper sets ────────────────────────────────────────────────────────────

export const ROADMAP_STATUSES: ReadonlyArray<{
  id: RoadmapStatus;
  title: string;
  countLabel: (n: number) => string;
  badgeClass: string;
  barClass: string;
}> = [
  {
    id: "planned",
    title: "Planned",
    countLabel: (n) => `${n} issues`,
    badgeClass: "cb-plan",
    barClass: "bar-p",
  },
  {
    id: "in-progress",
    title: "In Progress",
    countLabel: (n) => `${n} issues`,
    badgeClass: "cb-prog",
    barClass: "bar-i",
  },
  {
    id: "done",
    title: "Done",
    countLabel: (n) => `${n} shipped`,
    badgeClass: "cb-done",
    barClass: "bar-d",
  },
];
