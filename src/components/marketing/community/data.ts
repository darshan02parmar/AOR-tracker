/**
 * Community feed shapes + seeded scaffolding.
 *
 * The /community page is now backed by the live MongoDB community feed via
 * `getCommunityFeedAction` + `getCommunityMsCountsAction` (see
 * `src/app/community/page.tsx`). The conversion from DB rows
 * (`CommunityPost` in @/lib/types) to the `ApprovedPost` shape consumed by
 * `FeedCard.tsx` lives in `./adapter.ts`.
 *
 * This file is now the source of truth for:
 *   - the marketing-side TypeScript shapes (`Post`, `CommunityPageData`,
 *     etc.) — UI components consume these regardless of where the data
 *     actually came from.
 *   - the seeded scaffolding that still has no backend: insights, pulse,
 *     contributors, discord card, browseLinks / quickLinks / sortOptions /
 *     submitCta, and the `ownPending` / `ownRemoved` demo cards
 *     (moderation pipeline TODO).
 *
 * `buildCommunityPageData(posts, counts)` merges the live feed into the
 * seeded scaffolding — see the bottom of this file.
 */

import type { CommunityMsCounts } from "@/app/actions/community";

const SUBMIT_HREF = "/track";
const DASHBOARD_HREF = "/dashboard";
const FEEDBACK_HREF =
  "https://github.com/Get-North-Path/AOR-tracker/issues/new";
const DISCORD_HREF = "https://discord.gg/aortrack";

// ─── Types ──────────────────────────────────────────────────────────────────

export type MilestoneKey = "aor" | "bil" | "bgc" | "med" | "ecopr" | "p1" | "p2" | "copr";

/** Accent stripe color on the left edge of each card. */
export type MilestoneAccent = "ecopr" | "p1" | "p2" | "bil" | "bgc" | "med" | "aor";

/** Milestone chip styling token (matches the `.ms-*` CSS classes). */
export type MilestoneChipColor = "ecopr" | "p1" | "p2" | "bil" | "bgc" | "med" | "aor";

export type CohortItem = {
  label: string;
  value: string;
  /** Optional accent for the value (matches `.fcc-val.green` / `.fcc-val.blue`). */
  emphasis?: "green" | "blue";
};

export type TimelineDot = {
  state: "done" | "now" | "wait";
  /** Hover label for accessibility (`title` attr). */
  label: string;
  /** Render the dot with an extra ring (used for the final PPR dot). */
  highlight?: boolean;
};

export type Reply = {
  id: string;
  authorId: string;
  /** Two-digit shorthand or first initials shown inside the avatar circle. */
  avatarLabel: string;
  /** CSS color (var or hex) for the avatar circle. */
  avatarColor: string;
  text: string;
  /** Relative time, e.g. "2 hrs ago". */
  timestamp?: string;
};

export type PostBase = {
  id: string;
  /** Human-readable id shown in the header, e.g. "#3847" or "You (#4821)". */
  displayId: string;
  /** Card accent stripe key. */
  accent: MilestoneAccent;
  milestoneChip: { label: string; color: MilestoneChipColor };
  stream?: string;
  timestamp: string;
  /** Show "Gemini Verified" mod-soft badge in the meta row. */
  geminiVerified?: boolean;
  cohort: CohortItem[];
  /** Optional mini progress timeline (shown on rich PPR cards). */
  timeline?: TimelineDot[];
  /** Body copy. Authored HTML allowed for inline `<strong>` etc. */
  bodyHtml: string;
  helpfulCount: number;
  helpfulActive?: boolean;
  replyCount: number;
  /** Right-side info string like "Gemini-verified · Feb 2026 cohort". */
  dataSource?: string;
  /** Existing approved replies (shown if non-empty). */
  replies?: Reply[];
  /**
   * When this post is itself a reply, this references the parent (rendered
   * as a quoted bar at the top of the card). Mirrors the DB's
   * `CommunityReplyRef` so the adapter can copy it across verbatim.
   */
  replyTo?: {
    id: string;
    initials: string;
    name: string;
    snippet: string;
  };
};

export type ApprovedPost = PostBase & {
  kind: "approved";
};

export type OwnPendingPost = PostBase & {
  kind: "ownPending";
  /** Amber banner copy shown above the card body. */
  pendingMessage: string;
};

export type OwnRemovedPost = Omit<
  PostBase,
  "helpfulCount" | "replyCount" | "replies" | "timeline"
> & {
  kind: "ownRemoved";
  /** Banner heading (bold). */
  removedTitle: string;
  /** Banner long-form explanation. */
  removedReason: string;
  /** Days remaining in the appeal window. */
  appealDaysRemaining: number;
};

export type Post = ApprovedPost | OwnPendingPost | OwnRemovedPost;

export type FilterChip = {
  id: string;
  label: string;
  count?: number;
  /** CSS color of the chip dot, e.g. "var(--green)". Omitted for "All". */
  dotColor?: string;
  active?: boolean;
};

export type SidebarLink = {
  id: string;
  label: string;
  badge?: string;
  active?: boolean;
  href?: string;
};

export type CohortMini = {
  /** Header label, e.g. "Active Session". */
  label: string;
  rows: { key: string; value: string; emphasis?: "green" }[];
};

export type Insight = {
  id: string;
  tone: "amber" | "green" | "red" | "blue";
  title: string;
  body: string;
  reporters: string;
  age: string;
  /** Optional "View all …" link displayed under the body. */
  link?: { label: string; href: string };
};

export type PulseWeek = {
  label: string;
  value: number;
  isPeak?: boolean;
  isThisWeek?: boolean;
};

export type Pulse = {
  /** Headline e.g. "Weekly PPR Pulse — CEC General". */
  label: string;
  weeks: PulseWeek[];
  thisWeekValue: number;
  lastWeekValue: number;
  /** Pre-computed percentage delta vs last week. */
  deltaPct: number;
};

export type Contributor = {
  rank: number;
  avatarLabel: string;
  avatarColor: string;
  name: string;
  verifiedCount: number;
};

export type SortOption = { value: string; label: string };

export type CommunityPageData = {
  /** Live counter shown in the sub-banner (e.g., live online sessions). */
  liveCount: number;
  cohortMini: CohortMini;
  browseLinks: SidebarLink[];
  milestoneLinks: SidebarLink[];
  quickLinks: SidebarLink[];
  filterChips: FilterChip[];
  sortOptions: SortOption[];
  defaultSort: string;
  submitCta: {
    heading: string;
    sub: string;
    buttonLabel: string;
    href: string;
  };
  posts: Post[];
  insights: Insight[];
  pulse: Pulse;
  contributors: Contributor[];
  discord: {
    title: string;
    sub: string;
    buttonLabel: string;
    href: string;
  };
};

// ─── Static seed ────────────────────────────────────────────────────────────

/**
 * Marketing-side seed data. After the live-data migration this object only
 * provides the bits that don't yet have a backend:
 *   - insights / pulse / contributors / discord (no aggregation pipelines)
 *   - browseLinks / quickLinks / sortOptions / submitCta (UI scaffolding)
 *   - the `ownPending` / `ownRemoved` sample cards (no moderation pipeline)
 *
 * `posts`, `filterChips` and `liveCount` are overridden by
 * `buildCommunityPageData` using real `getCommunityFeedAction` results.
 */
export const seedCommunity: CommunityPageData = {
  liveCount: 14831,

  cohortMini: {
    label: "Active Session",
    rows: [
      { key: "Stream", value: "CEC", emphasis: "green" },
      { key: "AOR Month", value: "Feb 2026" },
      { key: "Day", value: "72", emphasis: "green" },
      { key: "Submissions", value: "3" },
    ],
  },

  browseLinks: [
    {
      id: "all",
      label: "All Posts",
      badge: "1,240",
      active: true,
    },
    { id: "my-cohort", label: "My Cohort Only", badge: "87" },
  ],

  milestoneLinks: [
    { id: "ecopr", label: "eCOPR received", badge: "482" },
    { id: "p1", label: "P1 — PR Portal", badge: "120" },
    { id: "p2", label: "P2 — PR Portal", badge: "95" },
    { id: "bil", label: "BIL", badge: "318" },
    { id: "bgc", label: "Background Check", badge: "241" },
    { id: "medical", label: "Medical Passed", badge: "199" },
  ],

  quickLinks: [
    { id: "submit", label: "Submit Milestone", href: SUBMIT_HREF },
    { id: "feedback", label: "Give Feedback", href: FEEDBACK_HREF },
  ],

  filterChips: [
    { id: "all", label: "All", count: 1240, active: true },
    { id: "ecopr", label: "eCOPR", count: 482, dotColor: "var(--green)" },
    { id: "p1", label: "P1", count: 120, dotColor: "var(--blue)" },
    { id: "p2", label: "P2", count: 95, dotColor: "var(--teal)" },
    { id: "bil", label: "BIL", count: 318, dotColor: "var(--amber)" },
    { id: "bgc", label: "BGC", count: 241, dotColor: "var(--amber)" },
    { id: "medical", label: "Medical", dotColor: "var(--purple)" },
  ],

  sortOptions: [
    { value: "newest", label: "Most Recent" },
    { value: "helpful", label: "Most Helpful" },
  ],
  defaultSort: "newest",

  submitCta: {
    heading: "Got a milestone? Share it.",
    sub: "Your BIL, BGC, portal steps (P1/P2), eCOPR — every date you log helps 1,240 applicants in your cohort predict their timeline.",
    buttonLabel: "Submit Milestone",
    href: SUBMIT_HREF,
  },

  /**
   * Replaced wholesale by `buildCommunityPageData(...)` with live approved
   * rows from MongoDB. Empty here on purpose — the previous seed cards
   * have moved out of the way for the real feed.
   *
   * TODO(moderation): once the moderation queue exists, surface the
   *   viewer's own most-recent `pending` / `removed` submissions and merge
   *   them ahead of the live feed (using the `ownPending` / `ownRemoved`
   *   `Post` variants declared in this file).
   */
  posts: [],

  insights: [
    {
      id: "ins-1",
      tone: "amber",
      title: "WES Tracker Lag — CEC",
      body: "12 applicants report WES results showing up 7–14 days after the IRCC tracker reflects them. May delay your BGC initiation.",
      reporters: "12 reporters",
      age: "3 days ago",
      link: { label: "View all community reports", href: "#alerts" },
    },
    {
      id: "ins-2",
      tone: "green",
      title: "eCOPR velocity up this week",
      body: "18 eCOPR issuances logged in the Feb 2026 CEC cohort this week — highest since tracking began.",
      reporters: "18 reporters",
      age: "1 day ago",
    },
    {
      id: "ins-3",
      tone: "blue",
      title: "IRCC Tracker Maintenance",
      body: "IRCC online tracker had a 4-hour outage on Apr 30. Status updates may be delayed by 1 day.",
      reporters: "System report",
      age: "2 days ago",
    },
  ],

  pulse: {
    label: "Weekly eCOPR pulse — CEC",
    weeks: [
      { label: "Apr 7", value: 8 },
      { label: "Apr 14", value: 11 },
      { label: "Apr 21", value: 13 },
      { label: "Apr 28", value: 13 },
      { label: "May 3", value: 18, isThisWeek: true, isPeak: true },
    ],
    thisWeekValue: 18,
    lastWeekValue: 13,
    deltaPct: 38,
  },

  contributors: [
    {
      rank: 1,
      avatarLabel: "#38",
      avatarColor: "var(--amber)",
      name: "#3847",
      verifiedCount: 14,
    },
    {
      rank: 2,
      avatarLabel: "#55",
      avatarColor: "var(--blue)",
      name: "#5502",
      verifiedCount: 11,
    },
    {
      rank: 3,
      avatarLabel: "#22",
      avatarColor: "var(--green)",
      name: "#2291",
      verifiedCount: 9,
    },
    {
      rank: 4,
      avatarLabel: "#41",
      avatarColor: "var(--teal)",
      name: "#4102",
      verifiedCount: 8,
    },
    {
      rank: 5,
      avatarLabel: "#68",
      avatarColor: "var(--purple)",
      name: "#6841",
      verifiedCount: 6,
    },
  ],

  discord: {
    title: "Join our Discord",
    sub: "Real-time alerts, IRCC tracker updates, and direct discussion with your cohort.",
    buttonLabel: "Join #aortrack-general",
    href: DISCORD_HREF,
  },
};

// Re-export the dashboard URL so the small links inside components don't need
// to redeclare it.
export const COMMUNITY_NAV = {
  submitHref: SUBMIT_HREF,
  dashboardHref: DASHBOARD_HREF,
  feedbackHref: FEEDBACK_HREF,
};

// ─── Loader ────────────────────────────────────────────────────────────────

/**
 * Mix the live `getCommunityFeedAction` result (adapted via
 * `./adapter.communityPostToApproved`) and `getCommunityMsCountsAction`
 * output into the rich `CommunityPageData` shape the marketing page expects.
 *
 * Anything live overrides the seed:
 *   - `posts` ← adapted live posts (own-pending / own-removed seeded cards
 *      are not merged here; the moderation pipeline isn't wired yet.)
 *   - `filterChips` counts ← per-ms counts.
 *   - `browseLinks[id="all"].badge` ← total.
 *   - `milestoneLinks[*].badge` ← per-ms counts.
 *   - `liveCount` ← total approved posts (proxy for "active session"
 *      until we have a real online-presence signal).
 */
export function buildCommunityPageData(
  posts: Post[],
  counts: CommunityMsCounts,
): CommunityPageData {
  return {
    ...seedCommunity,
    liveCount: counts.total || seedCommunity.liveCount,
    posts,
    browseLinks: seedCommunity.browseLinks.map((l) =>
      l.id === "all" ? { ...l, badge: counts.total.toLocaleString() } : l,
    ),
    milestoneLinks: seedCommunity.milestoneLinks.map((l) => {
      const map: Record<string, number> = {
        ecopr: counts.ecopr,
        p1: counts.p1,
        p2: counts.p2,
        bil: counts.bil,
        bgc: counts.bg,
        medical: counts.med,
      };
      const n = map[l.id];
      return n == null ? l : { ...l, badge: n.toLocaleString() };
    }),
    filterChips: seedCommunity.filterChips.map((c) => {
      const map: Record<string, number> = {
        all: counts.total,
        ecopr: counts.ecopr,
        p1: counts.p1,
        p2: counts.p2,
        bil: counts.bil,
        bgc: counts.bg,
        medical: counts.med,
      };
      const n = map[c.id];
      return n == null ? c : { ...c, count: n };
    }),
  };
}
