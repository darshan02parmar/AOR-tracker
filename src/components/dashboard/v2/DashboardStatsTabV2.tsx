"use client";

import { useMemo } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { DashboardCohortBars } from "./DashboardCohortBars";
import { DashboardConsultingCTA } from "./DashboardConsultingCTA";
import { DashboardDotMap } from "./DashboardDotMap";
import { DashboardHistogram } from "./DashboardHistogram";
import { DashboardStreamCompare } from "./DashboardStreamCompare";
import {
  cohortBarsVM,
  dotMapVM,
  histVM,
  histSubtitleVM,
  streamCompareVM,
} from "./live-vm";
import { humanizeCohortKey } from "@/lib/cohort";

/**
 * `/dashboard/stats`   cohort visualizations in the v2 design.
 *
 * Shares the same four sub-cards as the on-page `#cohort-sec` block on
 * `/dashboard` (cohort milestone bars, days-to-PPR histogram, applicant
 * dot-map, stream-comparison bars), but rendered standalone for users who
 * link directly to the Processing Stats route.
 */
export function DashboardStatsTabV2() {
  const ctx = useDashboard();

  const cohortBars = useMemo(
    () => cohortBarsVM(ctx, ctx.milestoneDefsForCohort),
    [ctx, ctx.milestoneDefsForCohort],
  );
  const hist = useMemo(() => histVM(ctx), [ctx]);
  const histSubtitle = useMemo(() => histSubtitleVM(ctx), [ctx]);
  const dotMap = useMemo(() => dotMapVM(ctx), [ctx]);
  const streamCompare = useMemo(() => streamCompareVM(ctx), [ctx]);

  return (
    <>
      <section style={{ marginBottom: 18 }}>
        <div className="sec-head">
          <div>
            <div className="sec-title">
              Processing Stats   {humanizeCohortKey(ctx.activeCohortKey)}
            </div>
            <div className="sec-sub">
              {ctx.cohortTotal} verified applicants
              {ctx.cohortDataSparse ? " · Data refreshed daily" : ""}
            </div>
          </div>
        </div>
      </section>

      <DashboardCohortBars bars={cohortBars} />
      <DashboardHistogram bars={hist} subtitle={histSubtitle} />
      <DashboardDotMap map={dotMap} applicantId={`#${ctx.email.length}`} />
      <DashboardStreamCompare rows={streamCompare} />

      <DashboardConsultingCTA />
      <div style={{ height: 36 }} />
    </>
  );
}
