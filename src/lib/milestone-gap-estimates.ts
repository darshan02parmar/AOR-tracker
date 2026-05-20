import {
  daysBetween,
  milestoneDate,
} from "@/lib/cohort-algorithm-v2";
import type { GlobalMilestonePace, MilestoneKey, UserProfile } from "@/lib/types";

export const MILESTONE_PACE_DOC_ID = "global_seeded" as const;

/** Minimum seeded profiles with both segment dates to show an estimate. */
export const MIN_SEGMENT_N = 5;

export const MILESTONE_SEGMENT_ORDER: {
  prev: MilestoneKey | "aor";
  key: MilestoneKey;
}[] = [
  { prev: "aor", key: "biometrics" },
  { prev: "biometrics", key: "background" },
  { prev: "background", key: "medical" },
  { prev: "medical", key: "p1" },
  { prev: "p1", key: "p2" },
  { prev: "p2", key: "ecopr" },
];

const TIMELINE_ORDER: MilestoneKey[] = [
  "aor",
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
];

export type ProfileForMilestonePace = {
  aorDate?: string;
  milestones?: Record<string, { date?: string | null }>;
  seededData?: boolean;
};

function dateForMilestone(
  p: ProfileForMilestonePace,
  key: MilestoneKey | "aor",
): string {
  if (key === "aor") {
    return p.aorDate?.trim() || milestoneDate(p.milestones, "aor");
  }
  return milestoneDate(p.milestones, key);
}

function meanRounded(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Average inter-milestone gaps from seeded profiles only (global table).
 * Inspired by aortrack-backend milestone pace spec.
 */
export function computeGlobalSeededMilestonePace(
  profiles: ProfileForMilestonePace[],
): GlobalMilestonePace {
  const seeded = profiles.filter((p) => p.seededData === true);
  const segment_avg_days: Partial<Record<MilestoneKey, number>> = {};
  const segment_n: Partial<Record<MilestoneKey, number>> = {};

  for (const { prev, key } of MILESTONE_SEGMENT_ORDER) {
    const gaps: number[] = [];
    for (const p of seeded) {
      const prevDate = dateForMilestone(p, prev);
      const keyDate = dateForMilestone(p, key);
      if (!prevDate || !keyDate) continue;
      const gap = daysBetween(prevDate, keyDate);
      if (Number.isNaN(gap) || gap < 0) continue;
      gaps.push(gap);
    }
    segment_n[key] = gaps.length;
    if (gaps.length >= MIN_SEGMENT_N) {
      segment_avg_days[key] = meanRounded(gaps);
    }
  }

  const cumulative_avg_days: Partial<Record<MilestoneKey, number>> = {};
  let running = 0;
  let paceComplete = true;

  for (const { key } of MILESTONE_SEGMENT_ORDER) {
    const seg = segment_avg_days[key];
    if (seg == null || seg <= 0) {
      paceComplete = false;
      break;
    }
    running += seg;
    cumulative_avg_days[key] = running;
  }

  return {
    computed_at: new Date().toISOString(),
    segment_avg_days,
    segment_n,
    cumulative_avg_days,
    total_avg_days_to_ecopr: paceComplete ? running : 0,
    profiles_scanned: profiles.length,
    seeded_profiles: seeded.length,
  };
}

export function addDaysIso(aorDate: string, days: number): string {
  const target = new Date(`${aorDate.slice(0, 10)}T12:00:00`);
  target.setDate(target.getDate() + days);
  return target.toISOString().slice(0, 10);
}

export function formatEstDateFromAor(aorDate: string, daysAfter: number): string {
  return new Date(`${addDaysIso(aorDate, daysAfter)}T12:00:00`).toLocaleDateString(
    "en-CA",
    { month: "short", day: "numeric", year: "numeric" },
  );
}

function lastCompletedMilestone(
  profile: Pick<UserProfile, "milestones" | "aorDate">,
): { key: MilestoneKey | "aor"; date: string; index: number } {
  const aor = profile.aorDate?.trim() || milestoneDate(profile.milestones, "aor");
  let bestIdx = 0;
  let bestDate = aor;
  let bestKey: MilestoneKey | "aor" = "aor";

  for (let i = 0; i < TIMELINE_ORDER.length; i++) {
    const key = TIMELINE_ORDER[i]!;
    const d =
      key === "aor"
        ? aor
        : profile.milestones[key]?.date?.trim() || "";
    if (d) {
      bestIdx = i;
      bestDate = d;
      bestKey = key;
    }
  }

  return { key: bestKey, date: bestDate, index: bestIdx };
}

/**
 * Estimate ISO date for one milestone: forward from last completed step using segment avgs,
 * or cumulative from AOR when only AOR is logged (aortrack-backend dashboard behaviour).
 */
export function estimatedIsoForMilestone(
  targetKey: MilestoneKey,
  aorDate: string,
  pace: GlobalMilestonePace,
  profile?: Pick<UserProfile, "milestones" | "aorDate">,
): { iso: string; daysAfterAor: number; source: "pace_forward" | "pace_from_aor" } | null {
  if (targetKey === "aor" || !pace.total_avg_days_to_ecopr) return null;

  const targetIdx = TIMELINE_ORDER.indexOf(targetKey);
  if (targetIdx < 0) return null;

  const anchor = profile
    ? lastCompletedMilestone(profile)
    : { key: "aor" as const, date: aorDate, index: 0 };

  if (targetIdx <= anchor.index) return null;

  if (anchor.index === 0) {
    const cum = pace.cumulative_avg_days[targetKey];
    if (cum == null) return null;
    return {
      iso: addDaysIso(aorDate, cum),
      daysAfterAor: cum,
      source: "pace_from_aor",
    };
  }

  let cursor = anchor.date;
  for (const { key } of MILESTONE_SEGMENT_ORDER) {
    const keyIdx = TIMELINE_ORDER.indexOf(key);
    if (keyIdx <= anchor.index) continue;
    if (keyIdx > targetIdx) break;
    const seg = pace.segment_avg_days[key];
    if (seg == null) return null;
    cursor = addDaysIso(cursor, seg);
    if (key === targetKey) {
      const daysAfter = daysBetween(aorDate, cursor);
      return {
        iso: cursor,
        daysAfterAor: Number.isNaN(daysAfter) ? 0 : daysAfter,
        source: "pace_forward",
      };
    }
  }

  return null;
}

export type MilestoneEstimateRow = {
  estLabel: string;
  desc: string;
  available: boolean;
};

export function milestoneEstimatesFromPace(
  aorDate: string,
  pace: GlobalMilestonePace | null,
  profile?: Pick<UserProfile, "milestones" | "aorDate">,
): Partial<Record<MilestoneKey, MilestoneEstimateRow>> {
  const out: Partial<Record<MilestoneKey, MilestoneEstimateRow>> = {};
  if (!pace || pace.total_avg_days_to_ecopr <= 0) return out;

  for (const key of TIMELINE_ORDER) {
    if (key === "aor") continue;
    const row = estimatedIsoForMilestone(key, aorDate, pace, profile);
    const n = pace.segment_n[key] ?? 0;
    if (!row) {
      out[key] = {
        estLabel: "—",
        desc: `Insufficient seeded data for this step (need ≥${MIN_SEGMENT_N} paired dates).`,
        available: false,
      };
      continue;
    }
    out[key] = {
      estLabel: `~${formatEstDateFromAor(aorDate, row.daysAfterAor)}`,
      desc:
        row.source === "pace_forward"
          ? `Typical ~${row.daysAfterAor}d after AOR (avg gaps from ${n} seeded profiles; projected from your last logged step).`
          : `Typical ~${row.daysAfterAor}d after AOR (avg gaps from ${n} seeded profiles).`,
      available: true,
    };
  }

  return out;
}

export function milestonePaceFilter(): { paceKey: string } {
  return { paceKey: MILESTONE_PACE_DOC_ID };
}

export function parseMilestonePaceDoc(
  doc: Record<string, unknown> | null | undefined,
): GlobalMilestonePace | null {
  if (!doc) return null;
  const total = doc.total_avg_days_to_ecopr;
  if (typeof total !== "number" || total <= 0) return null;
  return {
    computed_at: String(doc.computed_at ?? ""),
    segment_avg_days: (doc.segment_avg_days ?? {}) as Partial<
      Record<MilestoneKey, number>
    >,
    segment_n: (doc.segment_n ?? {}) as Partial<Record<MilestoneKey, number>>,
    cumulative_avg_days: (doc.cumulative_avg_days ?? {}) as Partial<
      Record<MilestoneKey, number>
    >,
    total_avg_days_to_ecopr: total,
    profiles_scanned: Number(doc.profiles_scanned ?? 0),
    seeded_profiles: Number(doc.seeded_profiles ?? 0),
  };
}
