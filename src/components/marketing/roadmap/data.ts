/**
 * Roadmap data — static seed.
 *
 * TODO(github-projects-integration): Today this file is the single source of
 *   truth for everything rendered on `/roadmap`. In the future we want the
 *   board to come straight from the GitHub repo (Get-North-Path/AOR-tracker)
 *   so opening an issue, adding a label, moving a card on the Project board,
 *   or merging a release is enough to update this page.
 *
 *   Target shape:
 *
 *     async function loadRoadmap(): Promise<RoadmapData> {
 *       // 1. GET /repos/Get-North-Path/AOR-tracker/issues?state=open&labels=roadmap
 *       //    -> partition into planned / in-progress using the `status` field
 *       //       on the Project (Projects V2 GraphQL API) or label heuristics.
 *       // 2. GET /repos/Get-North-Path/AOR-tracker/releases (recent N)
 *       //    -> map each to a RoadmapCard in the "done" column with
 *       //       shippedAt = release.published_at and link → /changelog#vXYZ.
 *       // 3. GET /repos/Get-North-Path/AOR-tracker/milestones
 *       //    -> map to RoadmapMilestone[] for the bottom timeline section.
 *       // 4. Aggregate /repos/.../stargazers_count, /contributors etc for
 *       //    the hero pills + stats bar counters.
 *       // 5. Cache server-side via Next.js fetch revalidate (e.g. 600s).
 *     }
 *
 *   When that lands:
 *     - delete `seedRoadmap` below,
 *     - replace `getRoadmap()` with the async loader,
 *     - bump the page (page.tsx) to `export const revalidate = 600;` for ISR.
 *   The component layer is already typed against the shape declared here, so
 *   no JSX changes will be required.
 */

const REPO = "https://github.com/Get-North-Path/AOR-tracker";
const ISSUES_URL = `${REPO}/issues`;

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
  /** Did the current visitor already upvote this issue? (seed only flag). */
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

// ─── Static seed ────────────────────────────────────────────────────────────

const seedRoadmap: RoadmapData = {
  hero: {
    eyebrow: "Open Source · Built in Public",
    headlineLead: "What we're building",
    headlineEmphasis: "next.",
    sub: "Every feature here was requested by the community. Upvote what matters. Claim an issue and ship code. This board syncs live from GitHub.",
    pills: [
      { label: "Last synced", value: "3 min ago" },
      { label: "Open issues", value: "24" },
      { label: "Contributors", value: "8" },
      // "GitHub stars" pill carries a trailing star icon — see RoadmapHero.
      { label: "GitHub stars", value: "147" },
    ],
  },

  stats: [
    { value: 9, label: "Planned features" },
    { value: 6, label: "In progress", tone: "blue" },
    { value: 31, label: "Shipped this cycle", tone: "green" },
    { value: 147, label: "Community votes", tone: "red" },
  ],

  filters: [
    { id: "all", label: "All" },
    { id: "feat", label: "Feature", dot: "var(--blue)" },
    { id: "bug", label: "Bug Fix", dot: "var(--red)" },
    { id: "data", label: "Data Quality", dot: "var(--green)" },
    { id: "seo", label: "SEO", dot: "var(--purple)" },
    { id: "perf", label: "Performance", dot: "var(--teal)" },
  ],

  cards: [
    // ── PLANNED ──────────────────────────────────────────────────────────
    {
      issue: 47,
      title: "Add OINP stream processing data",
      description:
        "Ontario Immigrant Nominee Program — most requested stream. Requires new cohort key, stream seeding, and province-based cohort grouping.",
      status: "planned",
      priority: "high",
      categories: ["feat", "data"],
      votes: 38,
    },
    {
      issue: 61,
      title: "Province filter for PNP cohort view",
      description:
        "PNP processing varies significantly by province. Let users filter their cohort by province of nomination for accurate estimates.",
      status: "planned",
      priority: "high",
      categories: ["feat"],
      votes: 22,
    },
    {
      issue: 58,
      title: "Weekly email digest",
      description:
        "Opt-in weekly email with stream average change, cohort PPR rate, and active community alerts. Sent Monday 8am ET.",
      status: "planned",
      priority: "medium",
      categories: ["feat"],
      votes: 19,
    },
    {
      issue: 63,
      title: "WES verification timeline table",
      description:
        "Community-sourced table showing WES report type, IRCC acceptance status, and timing notes. Clarifies the Course-by-Course vs Regular report confusion.",
      status: "planned",
      priority: "medium",
      categories: ["data", "feat"],
      votes: 15,
    },
    {
      issue: 70,
      title: "JSON open data export endpoint",
      description:
        "Anonymized aggregate dataset as downloadable JSON/CSV, updated weekly. Supports independent research and journalism on Canadian immigration.",
      status: "planned",
      priority: "low",
      categories: ["data"],
      votes: 11,
    },

    // ── IN PROGRESS ──────────────────────────────────────────────────────
    {
      issue: 52,
      title: "Fix BIL date not saving on mobile Safari",
      description:
        "Mobile Safari blocks the inline date picker onChange event. Affects iOS 17+ users logging milestone dates from dashboard.",
      status: "in-progress",
      priority: "high",
      categories: ["bug"],
      votes: 12,
      voted: true,
      progress: 70,
      note: "PR #66 open — native input fallback fix",
      assignee: { initials: "cd", handle: "@community-dev", tone: "blue" },
    },
    {
      issue: 49,
      title: "Stream SSR pages with JSON-LD schema",
      description:
        "Each stream gets a unique SSR URL, title, meta description, canonical, and Dataset JSON-LD schema for Google indexing.",
      status: "in-progress",
      priority: "high",
      categories: ["seo", "feat"],
      votes: 18,
      progress: 85,
      note: "All stream pages built — schema validation in QA",
      assignee: { initials: "sc", tone: "purple" },
    },
    {
      issue: 45,
      title: "Discord webhook notifications",
      description:
        "Colour-coded Discord embeds to #aortrack-issues. Bug = red, feature = blue, data = green. High demand alert at 10+ upvotes.",
      status: "in-progress",
      priority: "medium",
      categories: ["feat"],
      votes: 14,
      voted: true,
      progress: 95,
      note: "PR #64 merged — deploying to staging today",
      assignee: { initials: "dd", tone: "amber" },
    },
    {
      issue: 55,
      title: "Feb 2025 CEC STEM average audit",
      description:
        "3 members report the Feb 2025 CEC STEM cohort average is ~20d too high. Investigating outliers not caught by Z-score filter.",
      status: "in-progress",
      priority: "medium",
      categories: ["data"],
      votes: 7,
      progress: 40,
      note: "Automated audit running on flagged submissions",
      assignee: { initials: "gn", tone: "green" },
    },
    {
      issue: 50,
      title: "Cohort dot map visualisation",
      description:
        "500-dot interactive grid colour-coded by milestone stage. User's dot has white outline ring. Sampled for performance.",
      status: "in-progress",
      priority: "medium",
      categories: ["feat", "perf"],
      votes: 9,
      progress: 60,
      note: "Dot grid rendering complete — legend in progress",
    },
    {
      issue: 53,
      title: "90-day anonymous session + add-email upgrade",
      description:
        "Extend anon session from 7 to 90 days. Add dashboard warning when no email saved. Implement POST /api/v1/profile/add-email.",
      status: "in-progress",
      priority: "low",
      categories: ["feat", "sec"],
      votes: 6,
      progress: 50,
    },

    // ── DONE ─────────────────────────────────────────────────────────────
    {
      issue: 31,
      title: "Community moderation pipeline v1",
      description:
        "Full 7-category automated moderation pipeline, BullMQ queue, 5-tier action-service verdict execution.",
      status: "done",
      priority: "low",
      categories: ["feat", "sec"],
      votes: 0,
      shippedAt: "Shipped May 1, 2026",
      shippedVersion: "v0.4.0",
      linkOverride: "/changelog",
    },
    {
      issue: 28,
      title: "3-step onboarding wizard",
      description:
        "Application Details → Milestones → Review with localStorage draft persistence and stream average previews.",
      status: "done",
      priority: "low",
      categories: ["feat", "ux"],
      votes: 0,
      shippedAt: "Shipped Apr 21, 2026",
      shippedVersion: "v0.3.0",
      linkOverride: "/changelog",
    },
    {
      issue: 22,
      title: "Community feed with SSE live updates",
      description:
        "Paginated feed of moderated posts with SSE real-time new post bar. Filter chips persisted to localStorage.",
      status: "done",
      priority: "low",
      categories: ["feat", "perf"],
      votes: 0,
      shippedAt: "Shipped Apr 21, 2026",
      shippedVersion: "v0.3.0",
    },
    {
      issue: 19,
      title: "SVG progress ring (WCAG 2.1 AA)",
      description:
        "Animated SVG ring with text equivalent for screen readers. Animates from 0% on dashboard load.",
      status: "done",
      priority: "low",
      categories: ["ux"],
      votes: 0,
      shippedAt: "Shipped Apr 10, 2026",
      shippedVersion: "v0.2.0",
    },
    {
      issue: 14,
      title: "SHA-256 email hashing + PIPEDA deletion",
      description:
        "Email stored as SHA-256 hash only. One-click deletion from dashboard cascades to all collections.",
      status: "done",
      priority: "low",
      categories: ["sec"],
      votes: 0,
      shippedAt: "Shipped Apr 10, 2026",
      shippedVersion: "v0.2.0",
    },
  ],

  milestones: [
    {
      version: "v0.1",
      date: "Mar 2026",
      status: "Reached",
      state: "reached",
      title: "Foundation",
      description:
        "Core tracker, MongoDB schema, cohort key design, basic dashboard with days counter and stream selection.",
      chips: [
        "AOR Submission",
        "MongoDB Schema",
        "Cohort Keys",
        "Basic Dashboard",
      ],
    },
    {
      version: "v0.2",
      date: "Apr 10, 2026",
      status: "Reached",
      state: "reached",
      title: "Data Quality & Security",
      description:
        "SHA-256 hashing, PIPEDA deletion, progress ring, P25–P75 PPR window, cohort progress bars.",
      chips: [
        "SHA-256",
        "PIPEDA",
        "Progress Ring",
        "PPR Window",
        "Cohort Bars",
      ],
    },
    {
      version: "v0.3",
      date: "Apr 21, 2026",
      status: "Reached",
      state: "reached",
      title: "Community Layer",
      description:
        "Community feed with SSE, 3-step onboarding, share slugs, histogram and dot map charts.",
      chips: ["Community Feed", "SSE", "Onboarding", "Share Slugs", "Charts"],
    },
    {
      version: "v0.4",
      date: "May 1, 2026",
      status: "Reached",
      state: "reached",
      title: "Community moderation",
      description:
        "Full pipeline, 7 categories, BullMQ queue, action-service verdict execution, admin review queue with appeal flow.",
      chips: [
        "Moderation pipeline",
        "7 Categories",
        "BullMQ",
        "Admin Queue",
        "Appeals",
      ],
    },
    {
      version: "v0.5",
      date: "May 2026",
      status: "In Progress",
      state: "current",
      title: "SEO & Growth Infrastructure",
      description:
        "Stream SSR pages, sitemap.xml, OG images, Discord webhooks, OINP stream launch, 90-day sessions.",
      chips: ["Stream SSR", "Sitemap", "OG Images", "Discord", "OINP"],
    },
    {
      version: "v0.6",
      date: "June 2026",
      status: "Planned",
      state: "planned",
      title: "Data Richness",
      description:
        "PNP province filter, WES table, weekly email digest, open data JSON export, PPR pulse chart.",
      chips: ["PNP Province", "WES Table", "Email Digest", "Open Data"],
    },
    {
      version: "v1.0",
      date: "Aug 2026",
      status: "Target",
      state: "planned",
      title: "25,000 Timelines & Community Governance",
      description:
        "All planned items shipped. 25k active timelines, 1,500 GitHub stars. Full open-source community handover.",
      chips: ["25k Timelines", "Community Gov", "Full Parity"],
    },
  ],

  links: {
    repo: REPO,
    issues: ISSUES_URL,
    feedback: "https://github.com/Get-North-Path/AOR-tracker/issues/new",
    changelog: "/changelog",
    issueBase: ISSUES_URL,
  },
};

// ─── Loader ─────────────────────────────────────────────────────────────────

/**
 * Synchronous accessor today; will become `async` once we wire to the GitHub
 * Projects v2 GraphQL API. See file header for the planned migration.
 */
export function getRoadmap(): RoadmapData {
  return seedRoadmap;
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
