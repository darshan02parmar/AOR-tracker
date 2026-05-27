"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { broadcastCommunityFeedRefresh } from "@/lib/community-broadcast";
import {
  COMMUNITY_FEED_PAGE_SIZE,
  type CommunityFeedPage,
} from "@/lib/community-feed";
import { serializePost } from "@/lib/seed";
import { normalizeEmail, isValidEmail } from "@/lib/profile";
import { normalizeStreamLabel } from "@/lib/cohort";
import { milestoneDate } from "@/lib/cohort-algorithm-v2";
import type { MilestoneKey, UserProfile } from "@/lib/types";
import { getGlobalMilestonePaceAction } from "@/app/actions/cohort";
import { getProfileAction } from "@/app/actions/profile";
import { mergeMilestoneDefsForCohort } from "@/lib/cohort-dynamic";
import { communityTimelineFromMs } from "@/lib/community-timeline";
import { notifyDiscordCommunityPost } from "@/lib/discord-webhook";

const MS_OPTIONS = ["ecopr", "p1", "p2", "bil", "bg", "med"] as const;
export type CommunityMs = (typeof MS_OPTIONS)[number];

const MS_TO_MILESTONE_KEY: Record<CommunityMs, MilestoneKey> = {
  ecopr: "ecopr",
  p1: "p1",
  p2: "p2",
  bil: "biometrics",
  bg: "background",
  med: "medical",
};

const MS_LABEL: Record<CommunityMs, string> = {
  ecopr: "eCOPR received",
  p1: "P1   PR Portal (first)",
  p2: "P2   PR Portal (photo & address)",
  bil: "BIL",
  bg: "BGC Started",
  med: "Medical Done",
};

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "?";
  const clean = local.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 2) return clean.slice(0, 2).toUpperCase();
  return (local.slice(0, 2) || "??").toUpperCase();
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "applicant";
  return `Applicant · ${local}`;
}

function metaFromProfile(p: UserProfile): string {
  const parts = [
    normalizeStreamLabel(p.stream),
    p.aorDate ? `${p.aorDate} AOR` : null,
    p.type,
  ].filter(Boolean);
  return parts.join(" · ");
}

function postPlainSnippet(
  body: string,
  bodyIsHtml: boolean,
  max = 100,
): string {
  const raw = bodyIsHtml
    ? body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : body.replace(/\s+/g, " ").trim();
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1)}…`;
}

export type CommunityMsCounts = {
  total: number;
  ecopr: number;
  p1: number;
  p2: number;
  bil: number;
  bg: number;
  med: number;
};

/**
 * Returns aggregate counts of approved community posts grouped by their
 * milestone tag. Used by the public `/community` page to show real numbers
 * next to the filter chips and the sidebar's milestone links.
 *
 * Cheap: one indexed aggregation, one round-trip. Safe to call on every
 * page render (no auth required   read-only public data).
 */
export async function getCommunityMsCountsAction(): Promise<CommunityMsCounts> {
  const db = await getDb();
  const rows = await db
    .collection("community_posts")
    .aggregate([
      { $match: { approved: true, replyToId: { $exists: false } } },
      { $group: { _id: "$ms", n: { $sum: 1 } } },
    ])
    .toArray();

  const counts: CommunityMsCounts = {
    total: 0,
    ecopr: 0,
    p1: 0,
    p2: 0,
    bil: 0,
    bg: 0,
    med: 0,
  };
  for (const r of rows) {
    const key = String(r._id);
    const n = typeof r.n === "number" ? r.n : 0;
    counts.total += n;
    if (key === "ecopr") counts.ecopr += n;
    else if (key === "p1") counts.p1 += n;
    else if (key === "p2") counts.p2 += n;
    else if (key === "bil") counts.bil += n;
    else if (key === "bg") counts.bg += n;
    else if (key === "med") counts.med += n;
  }
  return counts;
}

/** Keys that map to `CommunityMs` tags   same subset the feed accepts. */
const SUBMIT_TIMELINE_KEYS = new Set<MilestoneKey>([
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
]);

export type CommunitySubmitMilestoneOption = {
  key: MilestoneKey;
  label: string;
  desc: string;
  est: string;
};

/**
 * Milestone rows for the Submit Milestone modal: same pipeline as the
 * dashboard timeline (`mergeMilestoneDefsForCohort` + global seeded pace), filtered
 * to milestones that can be tagged on a community post.
 */
export async function getCommunitySubmitMilestoneTimelineOptionsAction(
  email: string,
): Promise<
  | { ok: true; options: CommunitySubmitMilestoneOption[] }
  | { ok: false; error: string }
> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const prof = await getProfileAction(email);
  if (!prof.ok) return { ok: false, error: "Profile not found" };
  const p = prof.profile;
  const aorDate =
    p.aorDate.trim() ||
    (p.milestones.aor?.date as string | undefined)?.trim() ||
    "";
  const pace = await getGlobalMilestonePaceAction();
  const defs = mergeMilestoneDefsForCohort(
    aorDate || "2000-01-01",
    pace,
    p,
  );
  const options: CommunitySubmitMilestoneOption[] = defs
    .filter((d) => SUBMIT_TIMELINE_KEYS.has(d.key))
    .map((d) => ({
      key: d.key,
      label: d.label,
      desc: d.desc,
      est: d.est,
    }));
  return { ok: true, options };
}

export type CommunityFeedSort = "newest" | "helpful";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getCommunityFeedAction(
  viewerEmail?: string | null,
  opts?: {
    page?: number;
    pageSize?: number;
    /** When set (not `all`), only posts with this `ms` value. */
    msFilter?: string | null;
    /** Case-insensitive match on body, milestone label, or meta. */
    searchQuery?: string | null;
    sortBy?: CommunityFeedSort;
  },
): Promise<CommunityFeedPage> {
  const db = await getDb();
  const viewerNorm = viewerEmail && isValidEmail(viewerEmail)
    ? normalizeEmail(viewerEmail)
    : null;

  const pageSize = Math.min(
    100,
    Math.max(1, opts?.pageSize ?? COMMUNITY_FEED_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(opts?.page ?? 1));

  const filter: Record<string, unknown> = {
    approved: true,
    replyToId: { $exists: false },
  };
  const mf = opts?.msFilter?.trim();
  if (mf && mf !== "all" && MS_OPTIONS.includes(mf as CommunityMs)) {
    filter.ms = mf;
  }

  const q = opts?.searchQuery?.trim();
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ body: rx }, { meta: rx }, { msl: rx }];
  }

  const sortBy = opts?.sortBy === "helpful" ? "helpful" : "newest";

  const col = db.collection("community_posts");
  const total = await col.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const rows = await col
    .find(filter)
    .sort(
      sortBy === "helpful"
        ? { helpful: -1, createdAt: -1 }
        : { createdAt: -1 },
    )
    .skip(skip)
    .limit(pageSize)
    .toArray();

  const parentIds = rows.map((r) => r._id as ObjectId);
  const replyDocs =
    parentIds.length > 0
      ? await col
          .find({ approved: true, replyToId: { $in: parentIds } })
          .sort({ createdAt: 1 })
          .toArray()
      : [];

  const repliesByParent = new Map<string, Record<string, unknown>[]>();
  for (const doc of replyDocs) {
    const pid = String(doc.replyToId);
    const bucket = repliesByParent.get(pid);
    if (bucket) bucket.push(doc as Record<string, unknown>);
    else repliesByParent.set(pid, [doc as Record<string, unknown>]);
  }

  return {
    posts: rows.map((r) => {
      const parentId = String(r._id);
      const serialized = serializePost(
        r as Record<string, unknown>,
        viewerNorm,
      );
      const nested = repliesByParent.get(parentId);
      if (!nested?.length) return serialized;
      return {
        ...serialized,
        replies: nested.map((doc) => serializePost(doc, viewerNorm)),
      };
    }),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function createCommunityPostAction(
  email: string,
  input: { body: string; ms: CommunityMs; replyToId?: string | null },
): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const body = input.body.trim();
  if (body.length < 3) return { ok: false, error: "Message is too short" };
  if (body.length > 2000) return { ok: false, error: "Message is too long" };
  if (!MS_OPTIONS.includes(input.ms)) return { ok: false, error: "Invalid tag" };

  const prof = await getProfileAction(email);
  if (!prof.ok) return { ok: false, error: "Profile not found" };

  const rawReply = input.replyToId?.trim();
  const isReply = Boolean(rawReply);

  // Milestone dates are required only for top-level posts, not replies.
  if (!isReply) {
    const milestoneKey = MS_TO_MILESTONE_KEY[input.ms];
    if (!milestoneDate(prof.profile.milestones, milestoneKey)) {
      return {
        ok: false,
        error: "Add this milestone date on your dashboard before posting.",
      };
    }
  }

  const norm = normalizeEmail(email);
  const db = await getDb();
  const p = prof.profile;
  const col = db.collection("community_posts");

  let replyToId: ObjectId | undefined;
  let replyToPreview:
    | { initials: string; name: string; snippet: string }
    | undefined;
  if (rawReply) {
    let parentOid: ObjectId;
    try {
      parentOid = new ObjectId(rawReply);
    } catch {
      return { ok: false, error: "Invalid reply target" };
    }
    const parent = await col.findOne({ _id: parentOid, approved: true });
    if (!parent) return { ok: false, error: "Original post not found" };
    replyToId = parentOid;
    replyToPreview = {
      initials: String(parent.initials ?? "?"),
      name: String(parent.name ?? "Member"),
      snippet: postPlainSnippet(
        String(parent.body ?? ""),
        parent.bodyIsHtml !== false,
      ),
    };
  }

  const authorName = displayNameFromEmail(email);
  const authorInitials = initialsFromEmail(email);
  const meta = metaFromProfile(p);
  const msLabel = MS_LABEL[input.ms];

  await col.insertOne({
    initials: authorInitials,
    name: authorName,
    meta,
    ms: input.ms,
    msl: msLabel,
    body,
    bodyIsHtml: false,
    tl: communityTimelineFromMs(input.ms),
    helpful: 0,
    helpfulVoters: [] as string[],
    approved: true,
    authorEmailNorm: norm,
    createdAt: new Date(),
    ...(replyToId && replyToPreview
      ? { replyToId, replyToPreview }
      : {}),
  });

  await notifyDiscordCommunityPost({
    kind: replyToPreview ? "reply" : "milestone",
    authorEmail: norm,
    authorName,
    authorInitials,
    meta,
    ms: input.ms,
    msLabel,
    body,
    stream: normalizeStreamLabel(p.stream),
    type: p.type,
    province: p.province,
    caseNo: p.caseNo,
    username: p.username,
    ...(replyToPreview
      ? { replyTo: { name: replyToPreview.name, snippet: replyToPreview.snippet } }
      : {}),
  });

  broadcastCommunityFeedRefresh();
  return { ok: true };
}

export async function markCommunityHelpfulAction(
  email: string,
  postId: string,
): Promise<
  | { ok: true; helpful: number; viewerHasMarkedHelpful: boolean }
  | { ok: false; error: string }
> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  let oid: ObjectId;
  try {
    oid = new ObjectId(postId);
  } catch {
    return { ok: false, error: "Invalid post" };
  }

  const norm = normalizeEmail(email);
  const db = await getDb();
  const col = db.collection("community_posts");

  const res = await col.updateOne(
    { _id: oid, approved: true, helpfulVoters: { $ne: norm } },
    {
      $addToSet: { helpfulVoters: norm },
      $inc: { helpful: 1 },
    },
  );

  if (res.matchedCount === 0) {
    const doc = await col.findOne({ _id: oid, approved: true });
    if (!doc) return { ok: false, error: "Post not found" };
    const voters = (doc.helpfulVoters as string[]) ?? [];
    return {
      ok: true,
      helpful:
        typeof doc.helpful === "number"
          ? Math.max(doc.helpful, voters.length)
          : voters.length,
      viewerHasMarkedHelpful: voters.includes(norm),
    };
  }

  const updated = await col.findOne({ _id: oid });
  const voters = (updated?.helpfulVoters as string[]) ?? [];
  const helpful =
    typeof updated?.helpful === "number"
      ? Math.max(updated.helpful, voters.length)
      : voters.length;

  broadcastCommunityFeedRefresh();
  return {
    ok: true,
    helpful,
    viewerHasMarkedHelpful: true,
  };
}
