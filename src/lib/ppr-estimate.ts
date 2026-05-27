import { estimatedIsoForMilestone } from "@/lib/milestone-gap-estimates";
import type { CohortStats, GlobalMilestonePace, UserProfile } from "./types";

export type PprEstimate = {
  windowLabel: string;
  p50Approx: string;
  windowStart: Date;
  windowEnd: Date;
  limitedData: boolean;
};

function monthYear(d: Date): string {
  return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

function rangeLabel(a: Date, b: Date): string {
  const ma = a.getMonth();
  const ya = a.getFullYear();
  const mb = b.getMonth();
  const yb = b.getFullYear();
  if (ma === mb && ya === yb) return monthYear(a);
  return `${a.toLocaleDateString("en-CA", { month: "short" })}–${b.toLocaleDateString("en-CA", { month: "short", year: "numeric" })}`;
}

function addDays(iso: string, days: number): Date {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Expected eCOPR month from global seeded pace (sum of segment gap averages).
 * Matches milestone timeline "Est." pills.
 */
export function estimateEcoprFromSeededPace(
  aorDateIso: string,
  pace: GlobalMilestonePace,
): PprEstimate {
  const aor = aorDateIso?.trim();
  const days = pace.total_avg_days_to_ecopr;
  const limitedData = (pace.seeded_profiles ?? 0) < 30;

  if (!aor || !days || days <= 0) {
    const today = new Date();
    return {
      windowLabel: "Insufficient milestone timing data",
      p50Approx: " ",
      windowStart: today,
      windowEnd: today,
      limitedData: true,
    };
  }

  const ecoprDate = addDays(aor, days);
  const label = monthYear(ecoprDate);

  return {
    windowLabel: label,
    p50Approx: label,
    windowStart: ecoprDate,
    windowEnd: ecoprDate,
    limitedData,
  };
}

/** eCOPR window per v2.0 §6.2: AOR + P25 … AOR + P75. */
export function estimatePprWindow(
  aorDateIso: string,
  cohort: CohortStats,
): PprEstimate {
  const aor = aorDateIso?.trim();
  const med = cohort.median_days_to_ppr;
  const p25 = cohort.p25_days;
  const p75 = cohort.p75_days;

  const nEligible = cohort.n_eligible ?? cohort.n_verified;
  const limitedData = nEligible < 30;

  if (!aor || !med || med <= 0) {
    const today = new Date();
    return {
      windowLabel: "Insufficient cohort data",
      p50Approx: " ",
      windowStart: today,
      windowEnd: today,
      limitedData: true,
    };
  }

  const windowStart = addDays(aor, p25 > 0 ? p25 : med);
  const windowEnd = addDays(aor, p75 > 0 ? p75 : med);
  const p50Date = addDays(aor, med);

  return {
    windowLabel: rangeLabel(windowStart, windowEnd),
    p50Approx: monthYear(p50Date),
    windowStart,
    windowEnd,
    limitedData,
  };
}

export function daysSinceAor(aorDateIso: string): number {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const aor = new Date(`${aorDateIso}T12:00:00`);
  return Math.max(0, Math.round((today.getTime() - aor.getTime()) / 86_400_000));
}

/** Journey % per v2.0 §6.4: days elapsed / cohort median. */
export function pctThroughMedian(daysElapsed: number, median: number): number {
  if (!median) return 0;
  return Math.min(99, Math.round((daysElapsed / median) * 100));
}

/**
 * Days used for journey %, progress bar, and "typical wait" hero when seeded pace exists.
 * Aligns overview cards with milestone timeline (sum of segment gap averages).
 */
export function journeyTargetDays(
  pace: GlobalMilestonePace | null,
  cohortMedian: number,
): number {
  const paceTotal = pace?.total_avg_days_to_ecopr ?? 0;
  if (paceTotal > 0) return paceTotal;
  return cohortMedian;
}

export function journeyUsesSeededPace(pace: GlobalMilestonePace | null): boolean {
  return (pace?.total_avg_days_to_ecopr ?? 0) > 0;
}

/** Hero / share: seeded eCOPR month when pace exists, else cohort v2.0 window. */
export function resolveApprovalEstimate(
  aorDateIso: string,
  cohort: CohortStats,
  pace: GlobalMilestonePace | null,
  profile?: Pick<UserProfile, "milestones" | "aorDate">,
): PprEstimate {
  if (journeyUsesSeededPace(pace)) {
    const row = estimatedIsoForMilestone("ecopr", aorDateIso, pace!, profile);
    if (row) {
      const ecoprDate = new Date(`${row.iso}T12:00:00`);
      const label = monthYear(ecoprDate);
      const limitedData = (pace!.seeded_profiles ?? 0) < 30;
      return {
        windowLabel: label,
        p50Approx: label,
        windowStart: ecoprDate,
        windowEnd: ecoprDate,
        limitedData,
      };
    }
    return estimateEcoprFromSeededPace(aorDateIso, pace!);
  }
  return estimatePprWindow(aorDateIso, cohort);
}
