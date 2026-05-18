"use server";

import { getDb } from "@/lib/db";
import { humanizeCohortKey, peerCohortKeyPattern } from "@/lib/cohort";
import {
  buildHistogramFromDays,
  collectEcoprDays,
} from "@/lib/cohort-histogram";
import type { CohortStats, MilestoneKey } from "@/lib/types";

export type LiveCohortAggregate = {
  cohortKey: string;
  profileCount: number;
  /** Count of profiles with a non-empty date for each milestone */
  perMilestoneFilled: Record<MilestoneKey, number>;
  /** Live days-to-eCOPR buckets (same shape as `cohort_stats.dist`) */
  histogramDist: CohortStats["dist"];
};

const MILESTONE_KEYS: MilestoneKey[] = [
  "aor",
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
];

/** §6.1 — applicants in cohort with earlier AOR still waiting on eCOPR. */
export async function getQueuePositionAction(
  cohortKey: string,
  aorDateIso: string,
): Promise<{ ahead: number }> {
  if (!cohortKey?.trim() || !aorDateIso?.trim()) {
    return { ahead: 0 };
  }
  const db = await getDb();
  const ahead = await db.collection("profiles").countDocuments({
    cohortKey,
    aorDate: { $lt: aorDateIso.slice(0, 10) },
    $expr: {
      $lte: [
        { $strLenCP: { $ifNull: ["$milestones.ecopr.date", ""] } },
        0,
      ],
    },
  });
  return { ahead };
}

function filledCond(path: string): Record<string, unknown> {
  return {
    $cond: [
      {
        $gt: [
          {
            $strLenCP: {
              $ifNull: [`$milestones.${path}.date`, ""],
            },
          },
          0,
        ],
      },
      1,
      0,
    ],
  };
}

export async function getLiveCohortAggregateAction(
  cohortKey: string,
): Promise<LiveCohortAggregate> {
  const db = await getDb();

  const groupStage: Record<string, unknown> = {
    _id: null,
    profileCount: { $sum: 1 },
  };
  for (const k of MILESTONE_KEYS) {
    groupStage[k] = { $sum: filledCond(k) };
  }

  const [row] = await db
    .collection("profiles")
    .aggregate<Record<string, unknown>>([
      { $match: { cohortKey } },
      { $group: groupStage },
    ])
    .toArray();

  const profileCount =
    typeof row?.profileCount === "number" ? row.profileCount : 0;
  const perMilestoneFilled = {} as Record<MilestoneKey, number>;
  for (const k of MILESTONE_KEYS) {
    const n = row?.[k];
    perMilestoneFilled[k] = typeof n === "number" ? n : 0;
  }

  const profileDocs = await db
    .collection("profiles")
    .find(
      { cohortKey },
      { projection: { aorDate: 1, milestones: 1 } },
    )
    .toArray();

  const histogramDist = buildHistogramFromDays(
    collectEcoprDays(
      profileDocs.map((doc) => ({
        aorDate: doc.aorDate as string | undefined,
        milestones: doc.milestones as
          | Record<string, { date?: string | null }>
          | undefined,
      })),
    ),
  );

  return { cohortKey, profileCount, perMilestoneFilled, histogramDist };
}

export type CohortSummaryRow = {
  cohortKey: string;
  label: string;
  nVerified: number;
  medianDays: number;
  isCurrent: boolean;
};

/**
 * Peer cohorts from `cohort_stats`: same stream, inland/outland, province — any AOR month/year.
 * Includes keys that match `profileCohortKey`'s peer pattern (caller may dedupe with the active view).
 */
export async function listRelatedCohortSummariesAction(
  profileCohortKey: string,
  limit = 8,
): Promise<Omit<CohortSummaryRow, "isCurrent">[]> {
  const db = await getDb();
  const col = db.collection("cohort_stats");
  const pattern = peerCohortKeyPattern(profileCohortKey);
  const peerRegex = new RegExp(pattern);

  const prefer = await col
    .find({ cohortKey: peerRegex })
    .sort({ median_days_to_ppr: 1 })
    .limit(limit)
    .toArray();

  const rows: Omit<CohortSummaryRow, "isCurrent">[] = prefer.map((doc) => {
    const key = doc.cohortKey as string;
    return {
      cohortKey: key,
      label: humanizeCohortKey(key),
      nVerified: (doc.n_verified as number) ?? 0,
      medianDays: (doc.median_days_to_ppr as number) ?? 0,
    };
  });

  const seen = new Set(rows.map((r) => r.cohortKey));
  if (rows.length < limit) {
    const filler = await col
      .find({ cohortKey: { $nin: [...seen] } })
      .limit(limit * 3)
      .toArray();
    for (const doc of filler) {
      if (rows.length >= limit) break;
      const key = doc.cohortKey as string;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        cohortKey: key,
        label: humanizeCohortKey(key),
        nVerified: (doc.n_verified as number) ?? 0,
        medianDays: (doc.median_days_to_ppr as number) ?? 0,
      });
    }
  }

  return rows;
}
