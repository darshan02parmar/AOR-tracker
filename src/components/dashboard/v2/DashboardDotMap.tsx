"use client";

import { useMemo } from "react";
import { DN_DOT_MAP, DN_PROFILE, type DnDotMap } from "./data";

/**
 * Up-to-500-applicant dot grid. Each dot represents one applicant in the
 * cohort sample, colored by their current stage. The "you" dot is
 * highlighted.
 *
 * Sample reference: `.dotmap-card` block in `aortrack-dashboard.html`.
 *
 * The live `/dashboard` derives its `map` and `applicantId` from cohort
 * totals + the user's days-elapsed offset (see `DashboardTimelineTabV2`);
 * the seed preview uses `DN_DOT_MAP` and `DN_PROFILE.applicantId`.
 */
export function DashboardDotMap({
  map = DN_DOT_MAP,
  applicantId = DN_PROFILE.applicantId,
  legendCounts,
}: {
  map?: DnDotMap;
  applicantId?: string;
  legendCounts?: { ecopr: number; mid: number; early: number };
} = {}) {
  const dots = useMemo(() => {
    const { total, pprUpTo, midUpTo, youIndex } = map;
    return Array.from({ length: total }, (_, i) => {
      if (i === youIndex) {
        return { cls: "dm you", title: `You   Applicant ${applicantId}` };
      }
      if (i < pprUpTo) return { cls: "dm ecopr", title: "eCOPR received" };
      if (i < midUpTo) return { cls: "dm mid", title: "BGC / Medical" };
      return { cls: "dm early", title: "AOR – Biometrics" };
    });
  }, [map, applicantId]);

  const counts =
    legendCounts ?? {
      ecopr: map.pprUpTo,
      mid: map.midUpTo - map.pprUpTo,
      early: map.total - map.midUpTo,
    };

  return (
    <div className="dotmap-card">
      <div className="sec-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="sec-title" style={{ fontSize: ".92rem" }}>
            Cohort Dot Map   500 sampled
          </div>
          <div className="sec-sub">
            <span style={{ color: "var(--red)", fontWeight: 700 }}>
              Red dot = You
            </span>{" "}
            · Each dot = one applicant
          </div>
        </div>
      </div>
      <div className="dm-grid">
        {dots.map((d, i) => (
          <div key={i} className={d.cls} title={d.title} />
        ))}
      </div>
      <div className="dm-legend">
        <div className="dl">
          <div className="dl-d" style={{ background: "var(--green)" }} />
          eCOPR received ({counts.ecopr})
        </div>
        <div className="dl">
          <div
            className="dl-d"
            style={{ background: "var(--blue)", opacity: 0.8 }}
          />
          BGC / Medical ({counts.mid})
        </div>
        <div className="dl">
          <div
            className="dl-d"
            style={{ background: "var(--navy2)", opacity: 0.5 }}
          />
          AOR – Biometrics ({counts.early})
        </div>
        <div className="dl">
          <div className="dl-d you" />
          You
        </div>
      </div>
    </div>
  );
}
