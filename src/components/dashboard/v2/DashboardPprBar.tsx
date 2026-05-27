"use client";

import { useEffect, useState } from "react";
import { DN_JOURNEY_PROGRESS, type DnJourneyProgress } from "./data";

/**
 * Journey progress card   start/median axis, bar, status line, four metric tiles.
 *
 * Sample reference: `.progress-card` in `samples/aortrack_timeline.html`.
 */
export function DashboardPprBar({
  journey = DN_JOURNEY_PROGRESS,
}: {
  journey?: DnJourneyProgress;
} = {}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = globalThis.setTimeout(() => setProgress(journey.progressPct), 400);
    return () => globalThis.clearTimeout(id);
  }, [journey.progressPct]);

  return (
    <section className="progress-section" aria-labelledby="journey-progress-title">
      <h2 id="journey-progress-title" className="progress-section-title">
        {journey.title}
      </h2>

      <div className="prog-labels">
        <span>{journey.startLabel}</span>
        <span>{journey.endLabel}</span>
      </div>

      <div className="prog-track">
        <div
          className="prog-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={journey.centerLabel}
        />
      </div>

      <p className="prog-now-label">{journey.centerLabel}</p>

      <div className="prog-stats">
        {journey.stats.map((stat) => (
          <div key={stat.label} className="prog-stat">
            <div className="prog-stat-label">{stat.label}</div>
            <div
              className={`prog-stat-value${stat.tone === "green" ? " stat-green" : stat.tone === "amber" ? " stat-amber" : ""}`}
            >
              {stat.value}
            </div>
            <div className="prog-stat-sub">{stat.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
