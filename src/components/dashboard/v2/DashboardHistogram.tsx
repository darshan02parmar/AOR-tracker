"use client";

import { useEffect, useMemo, useState } from "react";
import { DN_HIST, type DnHistBar } from "./data";
import { IconInfo } from "./dashboard-icons";

/**
 * Vertical mini-histogram: days from AOR to eCOPR per cohort bucket.
 *
 * **Data contract**
 * - `bars[].value` — applicant count in that day range (from `cohort.dist`, live
 *   aggregate when >=2 profiles in cohort).
 * - `bars[].type` — `n` cohort (navy), `h` your P25-P75 window (red),
 *   `y` your bucket when you have an eCOPR date (green).
 * - Default `DN_HIST` is for the static `dashboard-new` preview only.
 *
 * **Rendering**
 * Bar height is set in pixels (not %) so columns stay visible inside the
 * flex layout — percentage heights collapse when the parent has no explicit height.
 */
const PLOT_HEIGHT_PX = 76;

function HistBar({
  bar,
  delaySec,
  animateOn,
  max,
}: {
  bar: DnHistBar;
  delaySec: number;
  animateOn: boolean;
  max: number;
}) {
  const heightPx =
    animateOn && max > 0 && bar.value > 0
      ? Math.max(2, Math.round((bar.value / max) * PLOT_HEIGHT_PX))
      : 0;

  return (
    <div className="hb-wrap">
      <div
        className={`hb ${bar.type}`}
        title={`${bar.label}: ${bar.value} applicant${bar.value === 1 ? "" : "s"}`}
        style={{
          height: `${heightPx}px`,
          transition: `height .7s ease ${delaySec}s`,
        }}
      />
      <div className={`hb-lbl${bar.type === "y" ? " y" : ""}`}>{bar.label}</div>
    </div>
  );
}

export function DashboardHistogram({
  bars = DN_HIST,
  subtitle,
}: {
  bars?: DnHistBar[];
  subtitle?: string;
} = {}) {
  const [animateOn, setAnimateOn] = useState(false);

  const max = useMemo(
    () => Math.max(...bars.map((b) => b.value), 1),
    [bars],
  );

  const isEmpty =
    bars.length === 0 || bars.every((b) => (b.value ?? 0) === 0);

  useEffect(() => {
    setAnimateOn(false);
    const id = window.setTimeout(() => setAnimateOn(true), 80);
    return () => window.clearTimeout(id);
  }, [bars]);

  return (
    <div className="hist-card">
      <div className="sec-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="sec-title" style={{ fontSize: ".92rem" }}>
            Days-to-eCOPR Distribution
          </div>
          <div className="sec-sub">
            {subtitle ??
              "482 verified PPR completions · your estimated window in red"}
          </div>
        </div>
      </div>
      <div className="hist-area">
        {isEmpty ? (
          <div className="hist-empty" role="status">
            No eCOPR completion days in this cohort yet — bars appear once
            applicants with eCOPR dates are logged in your bucket.
          </div>
        ) : (
          bars.map((b, i) => (
            <HistBar
              key={b.label}
              bar={b}
              delaySec={i * 0.05}
              animateOn={animateOn}
              max={max}
            />
          ))
        )}
      </div>
      <div className="hist-legend">
        <div className="hl-item">
          <div className="hl-dot" style={{ background: "var(--navy)" }} />
          Cohort
        </div>
        <div className="hl-item">
          <div className="hl-dot" style={{ background: "var(--red)" }} />
          Your window
        </div>
        <div className="hl-item">
          <div className="hl-dot" style={{ background: "var(--green)" }} />
          Your position
        </div>
      </div>
      <div className="data-note">
        <IconInfo aria-hidden />
        Community profiles · v2.0 recency-weighted estimate
      </div>
    </div>
  );
}
