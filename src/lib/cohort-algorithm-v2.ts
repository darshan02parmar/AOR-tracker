/**
 * v2.0 cohort algorithm   recency-weighted distribution with survival bias correction.
 * Spec: analyze.md (§2, §6, §8b).
 */

import type { MilestoneKey } from "@/lib/types";

export const ALGORITHM_VERSION = "v2.0";
export const BOOTSTRAP_STORED_MEDIAN = 180;
export const LOOKBACK_MIN = 270;
export const LOOKBACK_MAX = 547;
export const LOOKBACK_MULTIPLIER = 1.5;
export const IMPUTATION_BUFFER_DAYS = 30;
export const LATE_BIOMETRICS_DAYS = 60;

export type ProfileForStats = {
  aorDate: string;
  milestones: Record<string, { date?: string | null }>;
};

export type WeightedDayPoint = {
  days: number;
  weight: number;
  imputed: boolean;
  ecoprDate?: string;
};

export type CohortDistributionResult = {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  nEligible: number;
  nCompleted: number;
  nWaiting: number;
  nImputed: number;
  /** Stats-eligible completions (AOR + biometrics + eCOPR) for weighted percentiles. */
  completedDays: number[];
  /** All logged eCOPR days (AOR + eCOPR) for the dashboard histogram. */
  histogramDays: number[];
};

export type P1Percentiles = {
  p25: number;
  p50: number;
  p75: number;
  n: number;
};

function noon(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00`);
}

export function daysBetween(aorIso: string, endIso: string): number {
  const a = noon(aorIso).getTime();
  const b = noon(endIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function daysSinceAor(aorIso: string, today = new Date()): number {
  const t = new Date(today);
  t.setHours(12, 0, 0, 0);
  const a = noon(aorIso);
  return Math.max(0, Math.round((t.getTime() - a.getTime()) / 86_400_000));
}

export function milestoneDate(
  milestones: Record<string, { date?: string | null }> | undefined,
  key: string,
): string {
  const d = milestones?.[key]?.date;
  return typeof d === "string" ? d.trim() : "";
}

export function computeCutoffDate(
  storedMedianDays: number,
  today = new Date(),
): { cutoffDate: Date; lookbackDays: number } {
  const raw = Math.round(storedMedianDays * LOOKBACK_MULTIPLIER);
  const lookbackDays = Math.min(
    LOOKBACK_MAX,
    Math.max(LOOKBACK_MIN, raw),
  );
  const cutoffDate = new Date(today);
  cutoffDate.setHours(12, 0, 0, 0);
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
  return { cutoffDate, lookbackDays };
}

export function cutoffDateIso(cutoff: Date): string {
  return cutoff.toISOString().slice(0, 10);
}

/** eCOPR counts toward stats only when biometrics completion is logged. */
export function isStatsEligibleCompleted(p: ProfileForStats): boolean {
  const aor = p.aorDate?.trim() || milestoneDate(p.milestones, "aor");
  const ecopr = milestoneDate(p.milestones, "ecopr");
  const bio = milestoneDate(p.milestones, "biometrics");
  return !!(aor && ecopr && bio);
}

export function recencyWeight(ecoprIso: string, today = new Date()): number {
  const t = new Date(today);
  t.setHours(12, 0, 0, 0);
  const e = noon(ecoprIso);
  const daysAgo = Math.round((t.getTime() - e.getTime()) / 86_400_000);
  if (daysAgo <= 90) return 2;
  if (daysAgo <= 180) return 1;
  return 0.5;
}

export function buildDistributionPoints(
  profiles: ProfileForStats[],
  cutoffIso: string,
  today = new Date(),
): WeightedDayPoint[] {
  const cutoff = noon(cutoffIso);
  const points: WeightedDayPoint[] = [];

  for (const p of profiles) {
    const aor = p.aorDate?.trim() || milestoneDate(p.milestones, "aor");
    if (!aor || noon(aor) < cutoff) continue;

    const ecopr = milestoneDate(p.milestones, "ecopr");
    if (ecopr && isStatsEligibleCompleted(p)) {
      const days = daysBetween(aor, ecopr);
      if (!Number.isNaN(days)) {
        points.push({
          days,
          weight: recencyWeight(ecopr, today),
          imputed: false,
          ecoprDate: ecopr,
        });
      }
      continue;
    }

    if (!ecopr) {
      const elapsed = daysSinceAor(aor, today);
      points.push({
        days: elapsed + IMPUTATION_BUFFER_DAYS,
        weight: 1,
        imputed: true,
      });
    }
  }

  return points;
}

/** Weighted percentile via cumulative weight (§2.4). */
export function weightedPercentile(
  points: WeightedDayPoint[],
  p: number,
): number {
  if (points.length === 0) return 0;
  const sorted = [...points].sort((a, b) => a.days - b.days);
  const totalW = sorted.reduce((s, x) => s + x.weight, 0);
  if (totalW <= 0) return sorted[0]!.days;
  const target = totalW * p;
  let cum = 0;
  for (const pt of sorted) {
    cum += pt.weight;
    if (cum >= target) return Math.round(pt.days);
  }
  return Math.round(sorted[sorted.length - 1]!.days);
}

export function computeCohortDistribution(
  profiles: ProfileForStats[],
  cutoffIso: string,
  today = new Date(),
): CohortDistributionResult {
  const cutoff = noon(cutoffIso);
  let nEligible = 0;
  let nCompleted = 0;
  let nWaiting = 0;

  for (const p of profiles) {
    const aor = p.aorDate?.trim() || milestoneDate(p.milestones, "aor");
    if (!aor || noon(aor) < cutoff) continue;
    nEligible++;
    const ecopr = milestoneDate(p.milestones, "ecopr");
    if (ecopr && isStatsEligibleCompleted(p)) nCompleted++;
    else if (!ecopr) nWaiting++;
  }

  const points = buildDistributionPoints(profiles, cutoffIso, today);
  const nImputed = points.filter((x) => x.imputed).length;
  const completedDays = points
    .filter((x) => !x.imputed)
    .map((x) => x.days);

  const histogramDays: number[] = [];
  for (const p of profiles) {
    const aor = p.aorDate?.trim() || milestoneDate(p.milestones, "aor");
    if (!aor || noon(aor) < cutoff) continue;
    const ecopr = milestoneDate(p.milestones, "ecopr");
    if (!ecopr) continue;
    const d = daysBetween(aor, ecopr);
    if (!Number.isNaN(d)) histogramDays.push(d);
  }

  return {
    p10: weightedPercentile(points, 0.1),
    p25: weightedPercentile(points, 0.25),
    p50: weightedPercentile(points, 0.5),
    p75: weightedPercentile(points, 0.75),
    p90: weightedPercentile(points, 0.9),
    nEligible,
    nCompleted,
    nWaiting,
    nImputed,
    completedDays,
    histogramDays,
  };
}

/** Global distribution across all eligible profiles (for calibration median). */
export function computeGlobalDistribution(
  allProfiles: ProfileForStats[],
  cutoffIso: string,
  today = new Date(),
): CohortDistributionResult {
  return computeCohortDistribution(allProfiles, cutoffIso, today);
}

/** Unweighted P1 percentiles for current calendar year (§6.3). */
export function computeP1Percentiles(
  profiles: ProfileForStats[],
  year = new Date().getFullYear(),
): P1Percentiles {
  const days: number[] = [];
  for (const p of profiles) {
    const aor = p.aorDate?.trim() || milestoneDate(p.milestones, "aor");
    const p1 = milestoneDate(p.milestones, "p1");
    if (!aor || !p1) continue;
    if (noon(p1).getFullYear() !== year) continue;
    const d = daysBetween(aor, p1);
    if (!Number.isNaN(d)) days.push(d);
  }
  days.sort((a, b) => a - b);
  const pct = (p: number) => {
    if (days.length === 0) return 0;
    const idx = (days.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return days[lo]!;
    return Math.round(days[lo]! + (days[hi]! - days[lo]!) * (idx - lo));
  };
  return { p25: pct(0.25), p50: pct(0.5), p75: pct(0.75), n: days.length };
}

export function isLateBiometrics(
  aorIso: string,
  biometricsIso: string,
): boolean {
  const d = daysBetween(aorIso, biometricsIso);
  return !Number.isNaN(d) && d >= LATE_BIOMETRICS_DAYS;
}

export const STATS_MILESTONE_KEYS: MilestoneKey[] = [
  "aor",
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
];
