"use client";

import type { ReactNode } from "react";
import { DashboardCohortBars } from "./DashboardCohortBars";
import { DashboardDotMap } from "./DashboardDotMap";
import { DashboardHistogram } from "./DashboardHistogram";
import { DashboardStreamCompare } from "./DashboardStreamCompare";

/**
 * "Your Cohort" section (`cohort-sec`)   wraps the four sub-cards:
 *   1. Cohort milestone bars
 *   2. Histogram of days-to-PPR
 *   3. Dot-map of 500 sampled applicants
 *   4. Stream comparison
 *
 * Sample reference: <div id="cohort-sec"> in `aortrack-dashboard.html`.
 *
 * Pass `title` / `subtitle` to override the section header (the live
 * dashboard derives them from the active cohort key), and `children` to
 * substitute custom sub-cards (used by `/dashboard/stats` which renders the
 * same visual but is wired to real cohort data).
 */
export function DashboardCohortSection({
  title = "Your Cohort   Feb 2026 · CEC",
  subtitle = "1,240 verified applicants · All provinces",
  children,
}: {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
} = {}) {
  return (
    <section id="cohort-sec" style={{ marginTop: 26 }}>
      <div className="sec-head">
        <div>
          <div className="sec-title">{title}</div>
          <div className="sec-sub">{subtitle}</div>
        </div>
      </div>
      {children ?? (
        <>
          <DashboardCohortBars />
          <DashboardHistogram />
          <DashboardDotMap />
          <DashboardStreamCompare />
        </>
      )}
    </section>
  );
}
