import type { LiveCohortAggregate } from "@/app/actions/aggregate";
import { MILESTONE_DEFS, WES_ROW_TEMPLATE } from "@/lib/constants";
import { fmtDate } from "@/lib/format";
import { humanizeCohortKey } from "@/lib/cohort";
import {
  formatEstDateFromAor,
  milestoneEstimatesFromPace,
  milestoneIsLogged,
  MIN_SEGMENT_N,
} from "@/lib/milestone-gap-estimates";
import type { CohortStats, GlobalMilestonePace, UserProfile } from "@/lib/types";

export type CohortInsightDot = "g" | "a" | "r" | "b";

export type CohortInsight = {
  t: CohortInsightDot;
  /** Safe HTML: only interpolated numeric/system strings, no user input. */
  txt: string;
};

export type MilestoneDefRow = (typeof MILESTONE_DEFS)[number];

const PACE_UNAVAILABLE_DESC = `Milestone estimates need seeded cohort data (run cohort sync after CEC import; each step needs ≥${MIN_SEGMENT_N} paired dates).`;

/**
 * Merge static milestone labels with est. dates from global seeded gap averages.
 * When `profile` is passed, pending steps project forward from the last logged milestone
 * (same idea as aortrack-backend dashboard timeline).
 */
export function mergeMilestoneDefsForCohort(
  aorDate: string,
  pace: GlobalMilestonePace | null,
  profile?: Pick<UserProfile, "milestones" | "aorDate">,
): MilestoneDefRow[] {
  const aor = new Date(`${aorDate}T12:00:00`);
  if (Number.isNaN(aor.getTime())) {
    return [...MILESTONE_DEFS];
  }

  const estimates = milestoneEstimatesFromPace(aorDate, pace, profile);
  const paceReady =
    pace != null &&
    pace.total_avg_days_to_ecopr > 0 &&
    Object.keys(pace.cumulative_avg_days).length === 6;

  if (!paceReady) {
    return MILESTONE_DEFS.map((def) => ({
      ...def,
      est: def.key === "aor" ? fmtDate(aorDate) || "—" : "—",
      desc: def.key === "aor" ? def.desc : PACE_UNAVAILABLE_DESC,
    }));
  }

  return MILESTONE_DEFS.map((def) => {
    if (def.key === "aor") {
      return {
        ...def,
        est: fmtDate(aorDate),
        desc: def.desc,
      };
    }

    if (profile && milestoneIsLogged(profile, def.key)) {
      const logged = profile.milestones[def.key]?.date?.trim() || "";
      return {
        ...def,
        est: fmtDate(logged) || "—",
        desc: def.desc,
      };
    }

    const row = estimates[def.key];
    if (row?.available) {
      return {
        ...def,
        est: row.estLabel,
        desc: row.desc,
      };
    }

    const cum = pace!.cumulative_avg_days[def.key];
    if (cum != null && cum > 0) {
      return {
        ...def,
        est: `~${formatEstDateFromAor(aorDate, cum)}`,
        desc: `Typical ~${cum}d after AOR (avg gaps from ${pace!.seeded_profiles ?? 0} seeded profiles).`,
      };
    }

    return {
      ...def,
      est: "—",
      desc: row?.desc ?? PACE_UNAVAILABLE_DESC,
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
