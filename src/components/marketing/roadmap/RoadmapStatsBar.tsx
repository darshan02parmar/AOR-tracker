import type { RoadmapStatCell } from "./data";

const TONE_CLASS: Record<NonNullable<RoadmapStatCell["tone"]>, string> = {
  default: "",
  red: "r",
  blue: "b",
  green: "g",
};

type Props = {
  stats: RoadmapStatCell[];
};

/**
 * Cream stats grid that sits directly under the dark hero   4 columns on
 * desktop, 2x2 on mobile (see media query in roadmap.css).
 */
export function RoadmapStatsBar({ stats }: Props) {
  return (
    <div className="rm-stats">
      <div className="rm-stats-inner">
        {stats.map((s) => {
          const toneClass = s.tone ? TONE_CLASS[s.tone] : "";
          return (
            <div className="rm-sb-cell" key={s.label}>
              <div className={`rm-sb-n ${toneClass}`.trim()}>{s.value}</div>
              <div className="rm-sb-l">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
