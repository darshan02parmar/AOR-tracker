"use server";

import { getDb } from "@/lib/db";
import {
  buildStatsCohortKey,
  cohortKeyFromProfile,
  normalizeStreamLabel,
  streamFallbackKey,
} from "@/lib/cohort";
import { ensureCohortStatsPlaceholder } from "@/lib/ensure-cohort-stats";
import {
  milestoneLabelForKey,
  notifyDiscordNewCohortPlaceholder,
  notifyDiscordProfileEvent,
} from "@/lib/discord-webhook";
import {
  emptyMilestones,
  isValidEmail,
  newProfile,
  normalizeEmail,
  normalizeMilestonesFromDoc,
  normalizeProfileForPersistence,
} from "@/lib/profile";
import type { MilestoneKey, UserProfile } from "@/lib/types";

function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return new Date().toISOString();
}

function docToProfile(doc: Record<string, unknown>): UserProfile {
  const purity =
    typeof doc.purity === "number" && !Number.isNaN(doc.purity)
      ? doc.purity
      : undefined;
  return {
    email: doc.emailNorm as string,
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
    aorDate: (doc.aorDate as string) ?? "",
    stream: normalizeStreamLabel((doc.stream as string) ?? "CEC"),
    type: (doc.type as string) ?? "Inland",
    province: (doc.province as string) ?? "Ontario",
    milestones: normalizeMilestonesFromDoc(doc.milestones),
    ...(typeof doc.caseNo === "string" && doc.caseNo
      ? { caseNo: doc.caseNo }
      : {}),
    ...(typeof doc.username === "string" && doc.username
      ? { username: doc.username }
      : {}),
    ...(doc.seededData === true ? { seededData: true } : {}),
    ...(purity != null ? { purity } : {}),
    ...(typeof doc.currentStatus === "string" && doc.currentStatus
      ? { currentStatus: doc.currentStatus }
      : {}),
  };
}

export async function getProfileAction(
  email: string,
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Invalid email" };
  }
  const db = await getDb();
  const norm = normalizeEmail(email);
  const doc = await db.collection("profiles").findOne({ emailNorm: norm });
  if (!doc) return { ok: false, error: "not_found" };
  return { ok: true, profile: docToProfile(doc as Record<string, unknown>) };
}

export async function saveProfileAction(profile: UserProfile): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!isValidEmail(profile.email)) return { ok: false, error: "Invalid email" };
  const db = await getDb();
  const norm = normalizeEmail(profile.email);
  const persisted = normalizeProfileForPersistence(profile);
  const now = new Date();
  await db.collection("profiles").updateOne(
    { emailNorm: norm },
    {
      $set: {
        emailNorm: norm,
        aorDate: persisted.aorDate,
        stream: persisted.stream,
        type: persisted.type,
        province: persisted.province,
        milestones: persisted.milestones,
        cohortKey: persisted.cohortKey,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
        seededData: false,
      },
    },
    { upsert: true },
  );
  const saved = await db.collection("profiles").findOne({ emailNorm: norm });
  if (saved) {
    const p = docToProfile(saved as Record<string, unknown>);
    const cohortKey =
      (typeof saved.cohortKey === "string" && saved.cohortKey) ||
      cohortKeyFromProfile(p);
    let created = false;
    try {
      ({ created } = await ensureCohortStatsPlaceholder(db, cohortKey));
    } catch (e) {
      console.warn("[ensure-cohort-stats] insert failed", cohortKey, e);
    }
    if (created) {
      await notifyDiscordNewCohortPlaceholder({
        cohortKey,
        triggerEmail: norm,
        stream: p.stream,
        type: p.type,
        province: p.province,
        aorDate: p.aorDate,
        seededData: saved.seededData === true,
        caseNo: typeof saved.caseNo === "string" ? saved.caseNo : undefined,
        username: typeof saved.username === "string" ? saved.username : undefined,
      });
    }
    await notifyDiscordProfileEvent({
      kind: "profile_saved",
      email: norm,
      cohortKey,
      stream: p.stream,
      type: p.type,
      province: p.province,
      aorDate: p.aorDate,
      seededData: saved.seededData === true,
      caseNo: typeof saved.caseNo === "string" ? saved.caseNo : undefined,
      username: typeof saved.username === "string" ? saved.username : undefined,
    });
  }
  return { ok: true };
}

/** Optional fields from the track wizard so the draft row matches the user’s choices (not `newProfile()` defaults). */
export type CreateDraftProfileHints = Partial<
  Pick<UserProfile, "aorDate" | "stream" | "type" | "province">
>;

function applyDraftHints(
  base: UserProfile,
  hints?: CreateDraftProfileHints,
): UserProfile {
  if (!hints) return base;
  return {
    ...base,
    aorDate:
      hints.aorDate !== undefined ? String(hints.aorDate).trim() : base.aorDate,
    stream: hints.stream?.trim()
      ? normalizeStreamLabel(hints.stream)
      : base.stream,
    type: hints.type?.trim() || base.type,
    province: hints.province?.trim() || base.province,
  };
}

export async function createDraftProfileAction(
  email: string,
  hints?: CreateDraftProfileHints,
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const db = await getDb();
  const norm = normalizeEmail(email);
  const existing = await db.collection("profiles").findOne({ emailNorm: norm });
  if (existing) {
    return { ok: true, profile: docToProfile(existing as Record<string, unknown>) };
  }
  const profile = applyDraftHints(newProfile(norm), hints);
  const persisted = normalizeProfileForPersistence(profile);
  await db.collection("profiles").insertOne({
    emailNorm: norm,
    createdAt: new Date(profile.createdAt),
    updatedAt: new Date(profile.updatedAt),
    aorDate: persisted.aorDate,
    stream: persisted.stream,
    type: persisted.type,
    province: persisted.province,
    milestones: persisted.milestones,
    cohortKey: persisted.cohortKey,
    seededData: false,
  });
  return { ok: true, profile };
}

export async function updateMilestoneAction(
  email: string,
  key: MilestoneKey,
  date: string | null,
): Promise<{ ok: boolean; error?: string; profile?: UserProfile }> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const db = await getDb();
  const norm = normalizeEmail(email);
  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    [`milestones.${key}.date`]: date,
    [`milestones.${key}.updatedAt`]: date ? now : null,
    seededData: false,
    updatedAt: new Date(),
  };
  if (key === "aor") {
    update.aorDate = date?.trim() ?? "";
  }
  await db.collection("profiles").updateOne({ emailNorm: norm }, { $set: update });
  let doc = await db.collection("profiles").findOne({ emailNorm: norm });
  if (!doc) return { ok: false, error: "not_found" };
  let profile = docToProfile(doc as Record<string, unknown>);
  const persisted = normalizeProfileForPersistence(profile);
  await db.collection("profiles").updateOne(
    { emailNorm: norm },
    {
      $set: {
        aorDate: persisted.aorDate,
        milestones: persisted.milestones,
        cohortKey: persisted.cohortKey,
      },
    },
  );
  doc = await db.collection("profiles").findOne({ emailNorm: norm });
  if (!doc) return { ok: false, error: "not_found" };
  profile = docToProfile(doc as Record<string, unknown>);
  const cohortKey =
    (typeof doc.cohortKey === "string" && doc.cohortKey) ||
    cohortKeyFromProfile(profile);
  let created = false;
  try {
    ({ created } = await ensureCohortStatsPlaceholder(db, cohortKey));
  } catch (e) {
    console.warn("[ensure-cohort-stats] insert failed", cohortKey, e);
  }
  if (created) {
    await notifyDiscordNewCohortPlaceholder({
      cohortKey,
      triggerEmail: norm,
      stream: profile.stream,
      type: profile.type,
      province: profile.province,
      aorDate: profile.aorDate,
      seededData: doc.seededData === true,
      caseNo: typeof doc.caseNo === "string" ? doc.caseNo : undefined,
      username: typeof doc.username === "string" ? doc.username : undefined,
    });
  }
  await notifyDiscordProfileEvent({
    kind: "milestone",
    email: norm,
    cohortKey,
    stream: profile.stream,
    type: profile.type,
    province: profile.province,
    milestoneKey: key,
    milestoneLabel: milestoneLabelForKey(key),
    date,
    seededData: doc.seededData === true,
    caseNo: typeof doc.caseNo === "string" ? doc.caseNo : undefined,
    username: typeof doc.username === "string" ? doc.username : undefined,
  });
  return { ok: true, profile };
}

const DEMO_EMAIL = "demo@aortrack.ca";

export async function ensureDemoProfileAction(): Promise<UserProfile> {
  const db = await getDb();
  const norm = normalizeEmail(DEMO_EMAIL);
  const now = new Date().toISOString();
  const milestones = emptyMilestones();
  milestones.aor = { date: "2025-02-25", updatedAt: now };
  milestones.biometrics = { date: "2025-03-24", updatedAt: now };
  const profile: UserProfile = {
    email: norm,
    createdAt: now,
    updatedAt: now,
    aorDate: "2025-02-25",
    stream: "CEC",
    type: "Inland",
    province: "Ontario",
    milestones,
  };
  await db.collection("profiles").updateOne(
    { emailNorm: norm },
    {
      $set: {
        emailNorm: norm,
        aorDate: profile.aorDate,
        stream: profile.stream,
        type: profile.type,
        province: profile.province,
        milestones: profile.milestones,
        cohortKey: buildStatsCohortKey({
          aorDate: profile.aorDate,
          stream: profile.stream,
          type: profile.type,
        }),
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), seededData: false },
    },
    { upsert: true },
  );
  const saved = await db.collection("profiles").findOne({ emailNorm: norm });
  return docToProfile(saved as Record<string, unknown>);
}
