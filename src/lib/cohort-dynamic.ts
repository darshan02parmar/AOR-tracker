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

/** Typical share of median days-to-eCOPR for each milestone (rough inland model). */
const MEDIAN_DAY_FRAC: Record<MilestoneKey, number> = {
  aor: 0,
  bil: 0.09,
  biometrics: 0.17,
  background: 0.36,
  medical: 0.63,
  p1: 0.78,
  p2: 0.9,
  ecopr: 1,
};

export type MilestoneDefRow = (typeof MILESTONE_DEFS)[number];

/**
 * Merge static milestone labels with dates estimated from AOR + cohort median (to eCOPR).
 */
export function mergeMilestoneDefsForCohort(
  aorDate: string,
  medianPpr: number,
): MilestoneDefRow[] {
  const aor = new Date(`${aorDate}T12:00:00`);
  if (Number.isNaN(aor.getTime())) {
    return [...MILESTONE_DEFS];
  }

  if (!medianPpr || medianPpr <= 0 || !Number.isFinite(medianPpr)) {
    return MILESTONE_DEFS.map((def) => ({
      ...def,
      est: def.key === "aor" ? fmtDate(aorDate) || "—" : "—",
      desc:
        def.key === "aor"
          ? def.desc
          : "No cohort median yet — add eCOPR timelines in this group to unlock estimates.",
    }));
  }

  const med = Math.max(30, Math.round(medianPpr));

  return MILESTONE_DEFS.map((def) => {
    if (def.key === "aor") {
      return {
        ...def,
        est: fmtDate(aorDate),
        desc: def.desc,
      };
    }
    const daysAfter = Math.max(1, Math.round(MEDIAN_DAY_FRAC[def.key] * med));
    const target = new Date(aor);
    target.setDate(target.getDate() + daysAfter);
    const est = `~${target.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
    return {
      ...def,
      est,
      desc: `Typical ~${daysAfter}d after AOR (cohort median to eCOPR ${med}d).`,
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

  const pw = cohort.pulseWeekly ?? [];
  if (pw.length >= 2) {
    const last = pw[pw.length - 1] ?? 0;
    const prev = pw[pw.length - 2] ?? 0;
    if (last !== prev) {
      out.push({
        t: last > prev ? "g" : "a",
        txt:
          last > prev
            ? `<strong>Approval pulse up</strong> — model shows <strong>${last}</strong> in the latest week vs <strong>${prev}</strong> the week before.`
            : `<strong>Approval pulse eased</strong> — <strong>${last}</strong> vs <strong>${prev}</strong> prior week (cohort trend).`,
      });
    }
  }

  const n = cohort.n_verified;
  if (n < 30) {
    out.push({
      t: "a",
      txt: `<strong>Sample size</strong> — cohort curve uses <strong>${n}</strong> verified timelines; confidence grows as more data is added.`,
    });
  }

  const cr = Math.round((cohort.completion_rate ?? 0) * 100);
  out.push({
    t: "b",
    txt: `<strong>Modeled completion rate</strong> — about <strong>${cr}%</strong> with eCOPR logged on this cohort's historical curve.`,
  });

  const wd = Math.round((cohort.weekly_delta ?? 0) * 100);
  if (wd !== 0) {
    out.push({
      t: wd > 0 ? "g" : "r",
      txt: `<strong>Week-over-week</strong> — dashboard shows <strong>${wd > 0 ? "+" : ""}${wd}%</strong> change vs prior week (model).`,
    });
  }

  const per = cohort.per_milestone_n;
  const bil = per.bil ?? 0;
  const bg = per.background ?? 0;
  if (n > 0 && (bil > 0 || bg > 0)) {
    out.push({
      t: "b",
      txt: `<strong>Milestone spread</strong> — in this cohort model, <strong>${bil}</strong> past BIL · <strong>${bg}</strong> past background check (of <strong>${n}</strong>).`,
    });
  }

  return out.slice(0, 6);
}

type WesTemplateRow = (typeof WES_ROW_TEMPLATE)[number];
export type WesRow = Omit<WesTemplateRow, "d" | "n"> & { d: number; n: string };

/** Scale illustrative WES delays by how fast/slow this cohort’s median PPR is vs baseline (184d). */
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
