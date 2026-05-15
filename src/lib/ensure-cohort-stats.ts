import type { Db } from "mongodb";
import { emptyCohortStats } from "@/lib/seed";

/** Mongo payload matching `aggregateOneCohort` / `serializeCohort` shape (zeros until sync job runs). */
export function cohortStatsPlaceholderDoc(cohortKey: string): Record<string, unknown> {
  const e = emptyCohortStats(cohortKey);
  return {
    cohortKey: e.cohortKey,
    median_days_to_ppr: e.median_days_to_ppr,
    p25_days: e.p25_days,
    p75_days: e.p75_days,
    n_verified: e.n_verified,
    completion_rate: e.completion_rate,
    weekly_delta: e.weekly_delta ?? 0,
    per_milestone_n: e.per_milestone_n,
    dist: e.dist,
    pulseWeekly: e.pulseWeekly,
    stream_medians: e.stream_medians,
    last_updated: new Date(),
  };
}

/**
 * Ensures `cohort_stats` has a row for `cohortKey`. If none exists, inserts a placeholder
 * (zeros / empty charts) so reads succeed until the cohort sync job recomputes aggregates.
 */
export async function ensureCohortStatsPlaceholder(
  db: Db,
  cohortKey: string,
): Promise<{ created: boolean }> {
  const col = db.collection("cohort_stats");
  const placeholder = cohortStatsPlaceholderDoc(cohortKey);
  const result = await col.updateOne(
    { cohortKey },
    { $setOnInsert: placeholder },
    { upsert: true },
  );
  return { created: result.upsertedCount === 1 };
}
