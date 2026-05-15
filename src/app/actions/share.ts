"use server";

import { randomBytes } from "crypto";
import type { DnTimelineRow } from "@/components/dashboard/v2/data";
import { getCohortStatsForProfileAction } from "@/app/actions/cohort";
import { getDb } from "@/lib/db";
import { humanizeCohortKey } from "@/lib/cohort";
import { fmtDate } from "@/lib/format";
import { emptyMilestones, isValidEmail, normalizeEmail } from "@/lib/profile";
import {
  applicantIdFromEmail,
  timelineRowsFromProfile,
} from "@/lib/share-timeline-vm";
import {
  daysSinceAor,
  estimatePprWindow,
  pctThroughMedian,
} from "@/lib/ppr-estimate";
import type { UserProfile } from "@/lib/types";
import { mergeMilestoneDefsForCohort } from "@/lib/cohort-dynamic";

const TOKEN_RE = /^[a-f0-9]{36}$/i;

export type PublicSharePayload = {
  displayName: string;
  stream: string;
  province: string;
  type: string;
  aorDate: string;
  days: number;
  median: number;
  pct: number;
  pprP50: string;
  pprWindow: string;
  /** Matches signed-in dashboard sidebar card (`#1234`). */
  applicantId: string;
  aorDateLabel: string;
  typeLabel: string;
  /** Read-only milestone rows (no `edit` affordances). */
  timelineRows: DnTimelineRow[];
  timelineNote: string;
};

function sliceProfileFromDoc(doc: Record<string, unknown>): Pick<
  UserProfile,
  "aorDate" | "stream" | "type" | "province" | "milestones" | "email"
> {
  const m = doc.milestones as UserProfile["milestones"] | undefined;
  return {
    email: doc.emailNorm as string,
    aorDate: (doc.aorDate as string) ?? "",
    stream: (doc.stream as string) ?? "CEC General",
    type: (doc.type as string) ?? "Inland",
    province: (doc.province as string) ?? "Ontario",
    milestones: m ?? emptyMilestones(),
  };
}

function userProfileFromShareDoc(doc: Record<string, unknown>): UserProfile {
  const p = sliceProfileFromDoc(doc);
  const createdAt =
    typeof doc.createdAt === "string"
      ? doc.createdAt
      : new Date(0).toISOString();
  const updatedAt =
    typeof doc.updatedAt === "string" ? doc.updatedAt : createdAt;
  const aorDate =
    p.aorDate.trim() ||
    (p.milestones.aor?.date as string | undefined)?.trim() ||
    "";
  return {
    email: p.email,
    createdAt,
    updatedAt,
    aorDate,
    stream: p.stream,
    type: p.type,
    province: p.province,
    milestones: p.milestones,
  };
}

export async function ensureShareTokenForEmailAction(
  email: string,
): Promise<
  { ok: true; token: string } | { ok: false; error: string }
> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const norm = normalizeEmail(email);
  const db = await getDb();
  const col = db.collection("profiles");

  const existing = await col.findOne(
    { emailNorm: norm },
    { projection: { shareToken: 1 } },
  );
  if (!existing) return { ok: false, error: "not_found" };

  const current = existing.shareToken;
  if (typeof current === "string" && TOKEN_RE.test(current)) {
    return { ok: true, token: current.toLowerCase() };
  }

  const token = randomBytes(18).toString("hex");
  await col.updateOne({ emailNorm: norm }, { $set: { shareToken: token } });
  const doc = await col.findOne(
    { emailNorm: norm },
    { projection: { shareToken: 1 } },
  );
  const t = doc?.shareToken;
  if (typeof t === "string" && TOKEN_RE.test(t)) {
    return { ok: true, token: t.toLowerCase() };
  }
  return { ok: false, error: "Could not create share link" };
}

export async function getPublicSharePayloadAction(
  token: string,
): Promise<PublicSharePayload | null> {
  const t = token.trim().toLowerCase();
  if (!TOKEN_RE.test(t)) return null;

  const db = await getDb();
  const doc = await db.collection("profiles").findOne({ shareToken: t });
  if (!doc) return null;

  const profile = userProfileFromShareDoc(doc as Record<string, unknown>);
  const aorDate =
    profile.aorDate.trim() ||
    (profile.milestones.aor?.date as string | null | undefined)?.trim() ||
    "";

  const cohort = await getCohortStatsForProfileAction({
    aorDate: aorDate || "2000-01-01",
    stream: profile.stream,
    type: profile.type,
    province: profile.province,
  });

  const median = cohort.median_days_to_ppr;
  const days = aorDate ? daysSinceAor(aorDate) : 0;
  const pct = pctThroughMedian(days, median);

  let pprP50 = "—";
  let pprWindow = "—";
  if (aorDate) {
    const est = estimatePprWindow(aorDate, cohort);
    pprP50 = est.p50Approx;
    pprWindow = est.windowLabel;
  }

  const displayName =
    (profile.email.split("@")[0] ?? "applicant")
      .replace(/[._-]+/g, " ")
      .trim() || "Applicant";

  const defs = mergeMilestoneDefsForCohort(
    aorDate || "2000-01-01",
    median,
  );
  const timelineRows = timelineRowsFromProfile(defs, profile, {
    includeEdit: false,
  });
  const timelineNote = `Public read-only snapshot · Cohort: ${humanizeCohortKey(cohort.cohortKey)} · ${cohort.n_verified} verified profiles`;

  return {
    displayName,
    stream: profile.stream,
    province: profile.province,
    type: profile.type,
    aorDate,
    days,
    median,
    pct,
    pprP50,
    pprWindow,
    applicantId: applicantIdFromEmail(profile.email),
    aorDateLabel: aorDate ? fmtDate(aorDate) : "Not set",
    typeLabel: profile.type || "—",
    timelineRows,
    timelineNote,
  };
}
