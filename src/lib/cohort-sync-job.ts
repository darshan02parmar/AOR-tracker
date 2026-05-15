import type { Db } from "mongodb";
import { cohortKeyFromProfile } from "@/lib/cohort";
import { emptyCohortStats } from "@/lib/seed";
import type { MilestoneKey } from "@/lib/types";

const MILESTONE_KEYS: MilestoneKey[] = [
  "aor",
  "bil",
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
];

const DIST_BUCKETS: { range: string; lo: number; hi: number }[] = [
  { range: "< 120d", lo: 0, hi: 120 },
  { range: "120–150d", lo: 120, hi: 150 },
  { range: "150–180d", lo: 150, hi: 180 },
  { range: "180–210d", lo: 180, hi: 210 },
  { range: "210–240d", lo: 210, hi: 240 },
  { range: "> 240d", lo: 240, hi: 1_000_000 },
];

function daysBetweenAorEcopr(aorIso: string, ecoprIso: string): number {
  const a = new Date(`${aorIso}T12:00:00`).getTime();
  const b = new Date(`${ecoprIso}T12:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  return Math.round(sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (idx - lo));
}

function milestoneDate(
  milestones: Record<string, { date?: string | null }> | undefined,
  key: string,
): string {
  const d = milestones?.[key]?.date;
  return typeof d === "string" ? d.trim() : "";
}

function profileFieldsFromDoc(doc: Record<string, unknown>): {
  aorDate: string;
  stream: string;
  type: string;
  province: string;
  milestones: Record<string, { date?: string | null }>;
} {
  const m = doc.milestones as Record<string, { date?: string | null }> | undefined;
  return {
    aorDate: (doc.aorDate as string)?.trim() ?? "",
    stream: (doc.stream as string) ?? "CEC General",
    type: (doc.type as string) ?? "Inland",
    province: (doc.province as string) ?? "Other",
    milestones: m ?? {},
  };
}

export async function reconcileProfileCohortKeys(db: Db): Promise<number> {
  const col = db.collection("profiles");
  const cursor = col.find(
    {},
    {
      projection: {
        cohortKey: 1,
        milestones: 1,
        aorDate: 1,
        stream: 1,
        type: 1,
        province: 1,
      },
    },
  );
  let updated = 0;
  for await (const doc of cursor) {
    const rec = doc as Record<string, unknown>;
    const p = profileFieldsFromDoc(rec);
    const next = cohortKeyFromProfile(p);
    if (rec.cohortKey !== next) {
      await col.updateOne({ _id: doc._id }, { $set: { cohortKey: next } });
      updated++;
    }
  }
  return updated;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

/** Deterministic pseudo-weekly counts for charts (no randomness in sync job). */
function pulseWeeklyForCohort(
  cohortKey: string,
  n: number,
  pprCount: number,
): number[] {
  const out: number[] = [];
  let seed = hashString(cohortKey) ^ n * 0x9e3779b9;
  const base = Math.max(0, Math.round((pprCount / Math.max(n, 1)) * 1.8));
  for (let w = 0; w < 10; w++) {
    seed = (Math.imul(seed, 1103515245) + 12345) | 0;
    const jitter = (Math.abs(seed) % 5) - 2;
    out.push(Math.max(0, base + jitter));
  }
  return out;
}

function aggregateOneCohort(
  cohortKey: string,
  profs: Record<string, unknown>[],
): Record<string, unknown> {
  const empty = emptyCohortStats(cohortKey);
  const n = profs.length;
  if (n === 0) {
    return { ...empty, last_updated: new Date() };
  }

  const perMilestone: Partial<Record<MilestoneKey, number>> = {};
  for (const k of MILESTONE_KEYS) perMilestone[k] = 0;

  const daysToPpr: number[] = [];

  for (const raw of profs) {
    const p = profileFieldsFromDoc(raw);
    const aor = p.aorDate || milestoneDate(p.milestones, "aor");
    const ecoprDate = milestoneDate(p.milestones, "ecopr");
    for (const k of MILESTONE_KEYS) {
      if (milestoneDate(p.milestones, k)) {
        perMilestone[k] = (perMilestone[k] ?? 0) + 1;
      }
    }
    if (aor && ecoprDate) {
      const d = daysBetweenAorEcopr(aor, ecoprDate);
      if (!Number.isNaN(d)) daysToPpr.push(d);
    }
  }

  const sorted = [...daysToPpr].sort((a, b) => a - b);
  const median = sorted.length ? percentile(sorted, 0.5) : 0;
  const p25 = sorted.length ? percentile(sorted, 0.25) : 0;
  const p75 = sorted.length ? percentile(sorted, 0.75) : 0;
  const pprCount = sorted.length;
  const completion_rate = n > 0 ? pprCount / n : 0;

  let dist = empty.dist;
  if (pprCount > 0) {
    dist = DIST_BUCKETS.map((b) => {
      const count = sorted.filter((d) => d >= b.lo && d < b.hi).length;
      const pct = Math.max(1, Math.round((count / pprCount) * 100));
      return { range: b.range, count, pct, you: false };
    });
  }

  const pulseWeekly =
    n > 0 ? pulseWeeklyForCohort(cohortKey, n, pprCount) : [];

  return {
    cohortKey,
    median_days_to_ppr: median,
    p25_days: p25,
    p75_days: p75,
    n_verified: n,
    completion_rate,
    weekly_delta: 0,
    per_milestone_n: perMilestone,
    dist,
    pulseWeekly,
    stream_medians: [],
    last_updated: new Date(),
  };
}

export async function runCohortStatsSyncJob(db: Db): Promise<{
  profilesCohortKeyUpdates: number;
  cohortsUpserted: number;
}> {
  const profilesCohortKeyUpdates = await reconcileProfileCohortKeys(db);
  const profCol = db.collection("profiles");
  const statsCol = db.collection("cohort_stats");

  const keys = (await profCol.distinct("cohortKey", {
    cohortKey: { $exists: true, $nin: [null, ""] },
  })) as string[];

  let cohortsUpserted = 0;
  for (const cohortKey of keys) {
    const profs = await profCol.find({ cohortKey }).toArray();
    const payload = aggregateOneCohort(
      cohortKey,
      profs as Record<string, unknown>[],
    );
    await statsCol.updateOne(
      { cohortKey },
      { $set: payload },
      { upsert: true },
    );
    cohortsUpserted++;
  }

  return { profilesCohortKeyUpdates, cohortsUpserted };
}
