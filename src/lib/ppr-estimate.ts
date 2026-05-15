import type { CohortStats } from "./types";

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

export function estimatePprWindow(
  aorDateIso: string,
  cohort: CohortStats,
): PprEstimate {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const aor = new Date(`${aorDateIso}T12:00:00`);
  const daysElapsed = Math.max(
    0,
    Math.round((today.getTime() - aor.getTime()) / 86_400_000),
  );

  const med = cohort.median_days_to_ppr;
  const p25 = cohort.p25_days;
  const p75 = cohort.p75_days;

  if (!med || med <= 0) {
    return {
      windowLabel: "Insufficient cohort data",
      p50Approx: "—",
      windowStart: new Date(today),
      windowEnd: new Date(today),
      limitedData: true,
    };
  }

  const daysRemainingP50 = med - daysElapsed;
  const daysRemainingP25 = p25 - daysElapsed;
  const daysRemainingP75 = p75 - daysElapsed;

  const windowStart = new Date(today);
  windowStart.setDate(
    windowStart.getDate() + Math.max(daysRemainingP25, 14),
  );

  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + Math.max(daysRemainingP75, 14));

  const p50Date = new Date(today);
  p50Date.setDate(p50Date.getDate() + Math.max(daysRemainingP50, 0));

  const limitedData = cohort.n_verified < 30;

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

export function pctThroughMedian(daysElapsed: number, median: number): number {
  if (!median) return 0;
  return Math.min(99, Math.round((daysElapsed / median) * 100));
}
