"use client";

import { fmtCompactK } from "./constants";

type LandingStatsBarProps = {
  profileCount: number | null;
  medianSample: number | null;
};

export function LandingStatsBar({ profileCount, medianSample }: LandingStatsBarProps) {
  const cecMed = medianSample != null ? String(Math.round(medianSample)) : "241";

  return (
    <div className="stats-bar stats-bar--five">
      <div className="stats-inner">
        <div className="">
          <div className="stat-num">{profileCount != null ? fmtCompactK(profileCount) : " "}</div>
          <div className="stat-desc">Active timelines tracked</div>
        </div>
        <div className="">
          <div className="stat-num">
            184
            <span>d</span>
          </div>
          <div className="stat-desc">Avg. CEC processing time</div>
        </div>
        <div className="">
          <div className="stat-num">
            96<span>%</span>
          </div>
          <div className="stat-desc">Within predicted PPR window</div>
        </div>
        <div className="">
          <div className="stat-num">7</div>
          <div className="stat-desc">Feature-rich tools, all free</div>
        </div>
        <div className="">
          <div className="stat-num">
            100<span>%</span>
          </div>
          <div className="stat-desc">Open source · MIT licensed</div>
        </div>
      </div>
    </div>
  );
}
