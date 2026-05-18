"use client";

import { useEffect, useMemo, useState } from "react";
import { DN_HIST, type DnHistBar } from "./data";
import { IconInfo } from "./dashboard-icons";

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
  const target = Math.round((bar.value / max) * 85);
  return (
    <div className="hb-wrap">
      <div
        className={`hb ${bar.type}`}
        title={`${bar.label}: ${bar.value} applicants`}
        style={{
          height: animateOn ? `${target}%` : "0%",
          transition: `height .7s ease ${delaySec}s`,
        }}
      />
      <div className={`hb-lbl${bar.type === "y" ? " y" : ""}`}>
        {bar.label}
      </div>
    </div>
  );
}

/**
 * Days-to-PPR distribution mini-histogram.
 *
 * Sample reference: `.hist-card` block in `aortrack-dashboard.html`.
 */
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
  const allBucketsEmpty =
    bars.length > 0 && bars.every((b) => (b.value ?? 0) === 0);

  useEffect(() => {
    const id = window.setTimeout(() => setAnimateOn(true), 700);
    return () => window.clearTimeout(id);
  }, []);

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
        {allBucketsEmpty ? (
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
