/**
 * Adapter: backend `CommunityPost` (from MongoDB, defined in @/lib/types) →
 * marketing `ApprovedPost` (defined in ./data.ts, consumed by FeedCard).
 *
 * The marketing UI uses a much richer shape than the DB (discriminated union
 * with `approved | ownPending | ownRemoved`, plus structured `cohort`,
 * `timeline`, `replies`, etc.). This file is the single seam where the two
 * shapes are reconciled — keep all the mapping logic here so the components
 * downstream just consume one well-typed type.
 *
 * Security note: posts created by users are stored with `bodyIsHtml: false`.
 * `bodyHtml` is only ever set for trusted seed posts. For user posts we
 * escape and wrap in a `<p>` so FeedCard's `dangerouslySetInnerHTML` always
 * receives safe markup. Never relax this without adding HTML sanitisation.
 */

import { normalizeStreamLabel } from "@/lib/cohort";
import { communityTimelineFromMs } from "@/lib/community-timeline";
import type { CommunityPost, CommunityReplyRef } from "@/lib/types";
import type {
  ApprovedPost,
  CohortItem,
  MilestoneAccent,
  MilestoneChipColor,
  Reply,
  TimelineDot,
} from "./data";

/* ─── ms → marketing tokens ─────────────────────────────────────────── */

/** Backend stores `bg`/`med`; the marketing tokens use `bgc`/`med`. */
const MS_TO_ACCENT: Record<string, MilestoneAccent> = {
  ecopr: "ecopr",
  p1: "p1",
  p2: "p2",
  bil: "bil",
  bg: "bgc",
  med: "med",
};

/** Same mapping for the chip color token. */
const MS_TO_CHIP_COLOR: Record<string, MilestoneChipColor> = {
  ecopr: "ecopr",
  p1: "p1",
  p2: "p2",
  bil: "bil",
  bg: "bgc",
  med: "med",
};

/** Short chip labels on feed cards (canonical display; overrides legacy `msl`). */
const MS_CHIP_LABEL: Record<string, string> = {
  ecopr: "eCOPR received",
  p1: "P1 — PR Portal (first)",
  p2: "P2 — PR Portal (photo & address)",
  bil: "BIL",
  bg: "BGC Started",
  med: "Medical Done",
};

function milestoneChipLabel(ms: string, msl: string): string {
  return MS_CHIP_LABEL[ms] ?? msl;
}

/* ─── helpers ───────────────────────────────────────────────────────── */

/** "Applicant · <local>" → "#<local>". Keeps the leading "#" so it lines up
 *  with the seeded "#3847"-style ids in `data.ts`. */
function displayIdFromName(name: string): string {
  const tail = name.replace(/^Applicant\s*·\s*/i, "").trim();
  if (!tail) return "#anon";
  return tail.startsWith("#") ? tail : `#${tail}`;
}

/** Pull the first " · "-separated segment of `meta` to use as `stream`.
 *  `meta` is built by `metaFromProfile` in @/app/actions/community.ts as
 *  `<stream> · <aorDate> AOR · <type>`. */
function streamFromMeta(meta: string): string | undefined {
  const first = meta.split("·")[0]?.trim();
  return first ? normalizeStreamLabel(first) : undefined;
}

/** Build the structured `cohort` rows from the loose `meta` string.
 *  Best-effort — anything we can't classify becomes a generic "Detail" row. */
function cohortFromMeta(meta: string): CohortItem[] {
  const items: CohortItem[] = [];
  const segments = meta
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (i === 0) {
      items.push({ label: "Stream", value: normalizeStreamLabel(seg) });
      continue;
    }
    const aorMatch = seg.match(/^(\d{4}-\d{2}-\d{2})\s*AOR$/i);
    if (aorMatch) {
      const d = new Date(`${aorMatch[1]}T12:00:00`);
      const label = Number.isNaN(d.getTime())
        ? aorMatch[1]
        : d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
      items.push({ label: "AOR Month", value: label });
      continue;
    }
    if (/inland|outland/i.test(seg)) {
      items.push({ label: "Type", value: seg });
      continue;
    }
    items.push({ label: "Detail", value: seg });
  }
  return items;
}

/** Mini-timeline from post milestone tag — filled through the tagged step. */
function timelineFromPostMs(ms: string): TimelineDot[] {
  const steps = communityTimelineFromMs(ms);
  return steps.map((t, idx) => {
    const isLast = idx === steps.length - 1;
    return {
      state: t.done ? "done" : "wait",
      label: t.label,
      highlight: isLast && t.done,
    };
  });
}

/** Escape user-supplied text so it can be handed to dangerouslySetInnerHTML
 *  safely. Preserves newlines via `<br>` so the marketing card body keeps
 *  its line breaks (the dashboard panel achieves the same via
 *  `whitespace-pre-wrap`; for parity with the seed cards which expect HTML,
 *  we render `<br>` here). */
const REPLY_AVATAR_COLORS = [
  "#1e5f8c",
  "#7c3aed",
  "#0d9488",
  "#b45309",
  "#be123c",
  "#4338ca",
] as const;

function avatarColorFromInitials(initials: string): string {
  let h = 0;
  for (let i = 0; i < initials.length; i++) {
    h = (h + initials.charCodeAt(i)) % REPLY_AVATAR_COLORS.length;
  }
  return REPLY_AVATAR_COLORS[h] ?? REPLY_AVATAR_COLORS[0];
}

function plainBodyText(body: string, bodyIsHtml: boolean): string {
  if (!bodyIsHtml) return body;
  return body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function communityPostToReply(src: CommunityPost): Reply {
  return {
    id: src.id,
    authorId: displayIdFromName(src.name),
    avatarLabel: src.initials,
    avatarColor: avatarColorFromInitials(src.initials),
    text: plainBodyText(src.body, src.bodyIsHtml),
    timestamp: timeAgo(src.createdAt),
  };
}

function escapeAndWrap(plain: string): string {
  const escaped = plain
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return `<p>${escaped.replace(/\n/g, "<br/>")}</p>`;
}

/**
 * Best-effort relative time. Matches the seed timestamps ("4 min ago",
 * "1 hr ago"). Anything older than a week falls back to a short date.
 */
export function timeAgo(input: string | Date | undefined | null): string {
  if (!input) return "";
  const ts = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(ts.getTime())) return "";
  const diff = Date.now() - ts.getTime();
  if (diff < 45_000) return "Just now";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return ts.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

/* ─── main converter ───────────────────────────────────────────────── */

/**
 * Convert one DB post into a marketing `ApprovedPost`. The DB shape doesn't
 * currently encode `ownPending` / `ownRemoved` (no moderation pipeline yet),
 * so every live row maps to `kind: "approved"`. Seeded ownPending/ownRemoved
 * still come from `data.ts` and are merged in `buildCommunityPageData`.
 */
export function communityPostToApproved(
  src: CommunityPost,
  /** Falls back to "med" if the backend ever stores an unknown ms. */
  options?: { fallbackAccent?: MilestoneAccent },
): ApprovedPost {
  const accent =
    MS_TO_ACCENT[src.ms] ?? options?.fallbackAccent ?? "med";
  const chipColor = MS_TO_CHIP_COLOR[src.ms] ?? "med";
  const cohortRows = cohortFromMeta(src.meta);
  const nestedReplies = src.replies?.map(communityPostToReply) ?? [];
  const replyCount = nestedReplies.length;

  return {
    kind: "approved",
    id: src.id,
    displayId: displayIdFromName(src.name),
    accent,
    milestoneChip: { label: milestoneChipLabel(src.ms, src.msl), color: chipColor },
    stream: streamFromMeta(src.meta),
    timestamp: timeAgo(src.createdAt),
    communityVerified: false,
    cohort: cohortRows,
    timeline: timelineFromPostMs(src.ms),
    bodyHtml: src.bodyIsHtml ? src.body : escapeAndWrap(src.body),
    helpfulCount: src.helpful ?? 0,
    helpfulActive: src.viewerHasMarkedHelpful ?? false,
    replyCount,
    replies: nestedReplies,
  };
}

export type { CommunityPost, CommunityReplyRef };
