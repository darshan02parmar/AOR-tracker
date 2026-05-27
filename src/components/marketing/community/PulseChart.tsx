import { FaArrowUp, FaStar } from "react-icons/fa";
import type { Pulse } from "./data";

type Props = {
  pulse: Pulse;
};

/**
 * Tiny weekly PPR bar chart shown in the right panel.
 *
 * Bar heights are computed at render-time from the max weekly value   no
 * animation, no JS. The "this week" bar is tinted red, the prior peak green.
 *
 * TODO(real-data): replace `data.pulse` with a server-side aggregation of
 *   approved PPR posts grouped by ISO week, scoped to the viewer's cohort.
 *   The shape is intentionally aligned to that future query.
 */
export function PulseChart({ pulse }: Props) {
  const max = Math.max(1, ...pulse.weeks.map((w) => w.value));

  return (
    <div className="rp-section pulse-section">
      <div className="rp-label">{pulse.label}</div>

      <div
        className="pulse-chart"
        role="img"
        aria-label={`Weekly PPR counts: ${pulse.weeks
          .map((w) => `${w.label} ${w.value}`)
          .join(", ")}`}
      >
        {pulse.weeks.map((week) => {
          const heightPct = Math.round((week.value / max) * 100);
          const mod = week.isThisWeek
            ? " this-week"
            : week.isPeak
              ? " peak"
              : "";
          return (
            <div
              key={week.label}
              className={`pc-bar${mod}`}
              style={{ height: `${heightPct}%` }}
              title={`${week.label}: ${week.value} PPRs`}
            />
          );
        })}
      </div>

      <div className="pulse-labels" aria-hidden>
        {pulse.weeks.map((week) => (
          <div
            key={week.label}
            className={`pl-lbl${week.isThisWeek ? " this-week" : ""}`}
          >
            <span>{week.label.replace(/^[A-Za-z]+ /, "")}</span>
            {week.isPeak ? (
              <FaStar className="pl-peak-icon" aria-hidden />
            ) : null}
          </div>
        ))}
      </div>

      <div className="pulse-note">
        This week: <strong>{pulse.thisWeekValue} PPRs</strong>  {" "}
        <FaArrowUp className="pulse-delta-icon" aria-hidden /> {pulse.deltaPct}%
        vs last week ({pulse.lastWeekValue})
      </div>
    </div>
  );
}
