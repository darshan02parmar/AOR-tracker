import type { Db } from "mongodb";
import type { CohortCalibration } from "@/lib/types";
import {
  BOOTSTRAP_STORED_MEDIAN,
  computeCutoffDate,
  cutoffDateIso,
  type CohortDistributionResult,
} from "@/lib/cohort-algorithm-v2";

const COL = "cohort_calibration";

export async function getLatestStoredMedian(db: Db): Promise<number> {
  const doc = await db
    .collection(COL)
    .find({})
    .sort({ computed_at: -1 })
    .limit(1)
    .toArray();
  const row = doc[0] as { new_median_days?: number } | undefined;
  if (typeof row?.new_median_days === "number" && row.new_median_days > 0) {
    return row.new_median_days;
  }
  return BOOTSTRAP_STORED_MEDIAN;
}

export async function insertCalibration(
  db: Db,
  storedMedianDays: number,
  lookbackDays: number,
  cutoffDate: string,
  global: CohortDistributionResult,
): Promise<void> {
  const row: CohortCalibration = {
    computed_at: new Date().toISOString(),
    cutoff_date: cutoffDate,
    lookback_days: lookbackDays,
    stored_median_days: storedMedianDays,
    new_median_days: global.p50,
    new_p10_days: global.p10,
    new_p25_days: global.p25,
    new_p75_days: global.p75,
    new_p90_days: global.p90,
    n_eligible: global.nEligible,
    n_completed: global.nCompleted,
    n_waiting: global.nWaiting,
    n_imputed: global.nImputed,
  };
  await db.collection(COL).insertOne(row);
}

export function resolveCutoffForSync(storedMedianDays: number): {
  cutoffIso: string;
  lookbackDays: number;
} {
  const { cutoffDate, lookbackDays } = computeCutoffDate(storedMedianDays);
  return { cutoffIso: cutoffDateIso(cutoffDate), lookbackDays };
}
