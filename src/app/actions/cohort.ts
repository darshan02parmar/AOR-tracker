"use server";

import { getDb } from "@/lib/db";
import { cohortKeyFromProfile, streamFallbackKey } from "@/lib/cohort";
import {
  milestonePaceFilter,
  parseMilestonePaceDoc,
} from "@/lib/milestone-gap-estimates";
import { serializeCohort } from "@/lib/seed";
import type { CohortStats, GlobalMilestonePace } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

export async function getCohortStatsByKeyAction(
  cohortKey: string,
): Promise<CohortStats> {
  const db = await getDb();
  const doc = await db.collection("cohort_stats").findOne({ cohortKey });
  return serializeCohort(
    doc as Record<string, unknown> | null | undefined,
    cohortKey,
  );
}

export async function getCohortStatsForProfileAction(
  profile: Pick<UserProfile, "aorDate" | "stream" | "type" | "province">,
): Promise<CohortStats> {
  const db = await getDb();
  const col = db.collection("cohort_stats");
  const primaryKey = cohortKeyFromProfile(profile);
  let doc = await col.findOne({ cohortKey: primaryKey });
  if (!doc) {
    const fb = streamFallbackKey(profile.stream, profile.type);
    doc = await col.findOne({ cohortKey: fb });
  }
  if (!doc) {
    return serializeCohort(null, primaryKey);
  }
  const base = serializeCohort(
    doc as Record<string, unknown> | null | undefined,
    primaryKey,
  );
  return { ...base, cohortKey: primaryKey };
}

export async function getGlobalMilestonePaceAction(): Promise<GlobalMilestonePace | null> {
  const db = await getDb();
  const doc = await db.collection("milestone_pace").findOne(milestonePaceFilter());
  return parseMilestonePaceDoc(doc as Record<string, unknown> | null);
}
