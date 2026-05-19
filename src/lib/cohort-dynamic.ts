import type { LiveCohortAggregate } from "@/app/actions/aggregate";
import { MILESTONE_DEFS, WES_ROW_TEMPLATE } from "@/lib/constants";
import { fmtDate } from "@/lib/format";
import { humanizeCohortKey } from "@/lib/cohort";
import type { CohortStats, MilestoneKey } from "@/lib/types";

export type CohortInsightDot = "g" | "a" | "r" | "b";

export type CohortInsight = {
  t: CohortInsightDot;
  /** Safe HTML: only interpolated numeric/system strings, no user input. */
  txt: string;
};

/** Same threshold as `estimatePprWindow` limited-data flag (v2.0 §6.2). */
export const MIN_ELIGIBLE_FOR_MILESTONE_EST = 30;

/**
 * Typical share of v2.0 recency-weighted median days-to-eCOPR for each milestone.
 * All estimated dates are derived from `median_days_to_ppr` only — no global P1 tables.
 */
const MEDIAN_DAY_FRAC: Record<MilestoneKey, number> = {
  aor: 0,
  biometrics: 0.17,
  background: 0.36,
  medical: 0.63,
  p1: 0.78,
  p2: 0.9,
  ecopr: 1,
};

const ESTIMATE_ORDER: MilestoneKey[] = [
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
];

export type MilestoneDefRow = (typeof MILESTONE_DEFS)[number];

function addDaysFromAor(aorDate: string, days: number): string {
  const target = new Date(`${aorDate}T12:00:00`);
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cohortEligibleForEstimates(
  cohort?: Pick<CohortStats, "n_eligible" | "n_verified">,
): boolean {
  if (!cohort) return true;
  const n = cohort.n_eligible ?? cohort.n_verified ?? 0;
  return n >= MIN_ELIGIBLE_FOR_MILESTONE_EST;
}

/** v2.0 pacing: fraction × median, strictly increasing, eCOPR = median. */
function daysAfterAorByMilestone(medianDays: number): Map<MilestoneKey, number> {
  const med = Math.max(30, Math.round(medianDays));
  const out = new Map<MilestoneKey, number>();
  let prev = 0;

  for (const key of ESTIMATE_ORDER) {
    if (key === "ecopr") {
      out.set(key, med);
      continue;
    }
    let days = Math.max(1, Math.round(MEDIAN_DAY_FRAC[key] * med));
    days = Math.min(days, med - 1);
    days = Math.max(days, prev + 1);
    out.set(key, days);
    prev = days;
  }

  return out;
}

/**
 * Merge static milestone labels with dates estimated from v2.0 cohort median (to eCOPR).
 * Uses `MEDIAN_DAY_FRAC` only — not global P1 percentiles.
 */
export function mergeMilestoneDefsForCohort(
  aorDate: string,
  medianPpr: number,
  cohort?: Pick<CohortStats, "n_eligible" | "n_verified">,
): MilestoneDefRow[] {
  const aor = new Date(`${aorDate}T12:00:00`);
  if (Number.isNaN(aor.getTime())) {
    return [...MILESTONE_DEFS];
  }

  const insufficientMedian =
    !medianPpr || medianPpr <= 0 || !Number.isFinite(medianPpr);
  const insufficientSample =
    insufficientMedian || !cohortEligibleForEstimates(cohort);

  if (insufficientSample) {
    const desc = insufficientMedian
      ? "No cohort median yet — add eCOPR timelines in this group to unlock estimates."
      : "Insufficient cohort data for v2.0 estimates (need at least 30 eligible profiles).";
    return MILESTONE_DEFS.map((def) => ({
      ...def,
      est: def.key === "aor" ? fmtDate(aorDate) || "—" : "—",
      desc: def.key === "aor" ? def.desc : desc,
    }));
  }

  const med = Math.max(30, Math.round(medianPpr));
  const daysByKey = daysAfterAorByMilestone(med);

  return MILESTONE_DEFS.map((def) => {
    if (def.key === "aor") {
      return {
        ...def,
        est: fmtDate(aorDate),
        desc: def.desc,
      };
    }
    const daysAfter = daysByKey.get(def.key) ?? 1;
    const est = `~${addDaysFromAor(aorDate, daysAfter)}`;
    return {
      ...def,
      est,
      desc: `Typical ~${daysAfter}d after AOR (v2.0 cohort median to eCOPR ${med}d).`,
    };
  });
}

/**
 * Community insights for the right rail, from cohort_stats + live profile aggregate.
 */
export function buildCohortInsights(
  cohort: CohortStats,
  live: LiveCohortAggregate | null,
): CohortInsight[] {
  const out: CohortInsight[] = [];

  if (live && live.profileCount > 0) {
    const bio = live.perMilestoneFilled.biometrics ?? 0;
    const ecoprN = live.perMilestoneFilled.ecopr ?? 0;
    out.push({
      t: "g",
      txt: `<strong>Your cohort on AOR Track</strong> — <strong>${live.profileCount}</strong> saved profile${live.profileCount === 1 ? "" : "s"} for <strong>${humanizeCohortKey(cohort.cohortKey)}</strong>. <strong>${bio}</strong> logged biometrics · <strong>${ecoprN}</strong> eCOPR.`,
    });
  }

  const n = cohort.n_eligible ?? cohort.n_verified;
  if (n < 30) {
    out.push({
      t: "a",
      txt: `<strong>Sample size</strong> — cohort curve uses <strong>${n}</strong> eligible timelines (v2.0); confidence grows as more data is added.`,
    });
  }

  if (cohort.algorithm_version === "v2.0") {
    out.push({
      t: "b",
      txt: `<strong>v2.0 estimate</strong> — recency-weighted median with survival bias correction${cohort.n_imputed ? `; <strong>${cohort.n_imputed}</strong> still-waiting profiles imputed` : ""}.`,
    });
  }

  const cr = Math.round((cohort.completion_rate ?? 0) * 100);
  out.push({
    t: "b",
    txt: `<strong>Completion rate</strong> — about <strong>${cr}%</strong> with eCOPR logged in this cohort (eligible window).`,
  });

  const per = cohort.per_milestone_n;
  const bio = per.biometrics ?? 0;
  const bg = per.background ?? 0;
  if (n > 0 && (bio > 0 || bg > 0)) {
    out.push({
      t: "b",
      txt: `<strong>Milestone spread</strong> — <strong>${bio}</strong> past biometrics · <strong>${bg}</strong> past background check (of <strong>${n}</strong>).`,
    });
  }

  return out.slice(0, 6);
}

type WesTemplateRow = (typeof WES_ROW_TEMPLATE)[number];
export type WesRow = Omit<WesTemplateRow, "d" | "n"> & { d: number; n: string };

/** Scale illustrative WES delays by how fast/slow this cohort’s median is vs baseline (184d). */
export function buildWesRowsForCohort(cohort: CohortStats): WesRow[] {
  const baseline = 184;
  const med = cohort.median_days_to_ppr > 0 ? cohort.median_days_to_ppr : baseline;
  const f = Math.max(0.65, Math.min(1.45, med / baseline));
  return WES_ROW_TEMPLATE.map((r) => ({
    ...r,
    d: Math.max(3, Math.round(r.d * f)),
    n:
      r.n +
      (cohort.median_days_to_ppr > 0
        ? ` (scaled ~${Math.round(f * 100)}% vs baseline for a ${cohort.median_days_to_ppr}d median cohort).`
        : " (baseline pacing — cohort median not available yet)."),
  }));
}
