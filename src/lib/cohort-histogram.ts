/**
 * Days-to-eCOPR histogram buckets   shared by cohort sync and live dashboard reads.
 */

import { daysBetween, milestoneDate } from "@/lib/cohort-algorithm-v2";
import { emptyCohortStats } from "@/lib/seed";
import type { CohortStats } from "@/lib/types";

export const DIST_BUCKETS: { range: string; lo: number; hi: number }[] = [
  { range: "< 120d", lo: 0, hi: 120 },
  { range: "120–150d", lo: 120, hi: 150 },
  { range: "150–180d", lo: 150, hi: 180 },
  { range: "180–210d", lo: 180, hi: 210 },
  { range: "210–240d", lo: 210, hi: 240 },
  { range: "> 240d", lo: 240, hi: 1_000_000 },
];

export function buildHistogramFromDays(
  ecoprDays: number[],
): CohortStats["dist"] {
  const empty = emptyCohortStats("_").dist;
  if (ecoprDays.length === 0) return empty.map((r) => ({ ...r }));
  const n = ecoprDays.length;
  return DIST_BUCKETS.map((b) => {
    const count = ecoprDays.filter((d) => d >= b.lo && d < b.hi).length;
    const pct = n > 0 ? Math.round((count / n) * 100) : 0;
    return { range: b.range, count, pct, you: false };
  });
}

export function dayInHistBucket(range: string, days: number): boolean {
  if (range.startsWith("<")) {
    const hi = parseInt(range.replace(/\D/g, ""), 10);
    return !Number.isNaN(hi) && days < hi;
  }
  if (range.startsWith(">")) {
    const lo = parseInt(range.replace(/\D/g, ""), 10);
    return !Number.isNaN(lo) && days >= lo;
  }
  const m = range.match(/(\d+)\D+(\d+)/);
  if (!m) return false;
  const lo = parseInt(m[1]!, 10);
  const hi = parseInt(m[2]!, 10);
  return days >= lo && days < hi;
}

export function bucketOverlapsPprWindow(
  range: string,
  p25: number,
  p75: number,
): boolean {
  if (p25 <= 0 || p75 <= 0) return false;
  if (range.startsWith("<")) {
    const hi = parseInt(range.replace(/\D/g, ""), 10);
    return !Number.isNaN(hi) && p25 < hi;
  }
  if (range.startsWith(">")) {
    const lo = parseInt(range.replace(/\D/g, ""), 10);
    return !Number.isNaN(lo) && p75 >= lo;
  }
  const m = range.match(/(\d+)\D+(\d+)/);
  if (!m) return false;
  const lo = parseInt(m[1]!, 10);
  const hi = parseInt(m[2]!, 10);
  return p75 > lo && p25 < hi;
}

export type HistBarTone = "n" | "h" | "y";

export function classifyHistBarTone(
  range: string,
  userEcoprDays: number | null,
  p25: number,
  p75: number,
): HistBarTone {
  if (userEcoprDays !== null && dayInHistBucket(range, userEcoprDays)) {
    return "y";
  }
  if (bucketOverlapsPprWindow(range, p25, p75)) return "h";
  return "n";
}

type ProfileLike = {
  aorDate?: string | null;
  milestones?: Record<string, { date?: string | null }>;
};

/** Days from AOR to eCOPR for every profile in the cohort that has both dates. */
export function collectEcoprDays(profiles: ProfileLike[]): number[] {
  const out: number[] = [];
  for (const p of profiles) {
    const aor = p.aorDate?.trim() || milestoneDate(p.milestones, "aor");
    const ecopr = milestoneDate(p.milestones, "ecopr");
    if (!aor || !ecopr) continue;
    const d = daysBetween(aor, ecopr);
    if (!Number.isNaN(d)) out.push(d);
  }
  return out;
}
