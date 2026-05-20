"use client";

import { useEffect, useState } from "react";
import { DN_STREAM_COMPARE, type DnStreamRow } from "./data";
import { IconArrowRight, IconInfo } from "./dashboard-icons";

function CompareRow({ row, index }: { row: DnStreamRow; index: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setWidth(row.fillPct), 500 + index * 60);
    return () => window.clearTimeout(id);
  }, [row.fillPct, index]);

  return (
    <div className={`cmp-row ${row.variant === "neutral" ? "" : row.variant}`}>
      <div className="cmp-name">
        {row.name}
        {row.variant === "you" ? <IconArrowRight aria-hidden /> : null}
      </div>
      <div className="cmp-track">
        <div
          className={`cmp-fill ${row.variant === "you" ? "cmp-r" : "cmp-n"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="cmp-val">{row.days}</div>
    </div>
  );
}

/**
 * Stream-by-stream median days-to-PPR comparison. The user's stream is
 * highlighted in red; the fastest is highlighted in green.
 *
 * Sample reference: `.comp-card` block in `aortrack-dashboard.html`.
 */
export function DashboardStreamCompare({
  rows = DN_STREAM_COMPARE,
}: {
  rows?: DnStreamRow[];
} = {}) {
  return (
    <div className="comp-card">
      <div className="sec-head" style={{ marginBottom: 10 }}>
        <div>
          <div className="sec-title" style={{ fontSize: ".92rem" }}>
            Stream Comparison — Median Days to PPR
          </div>
          <div className="sec-sub">
            Your stream highlighted · Updated weekly
          </div>
        </div>
      </div>
      {rows.map((r, i) => (
        <CompareRow key={r.name} row={r} index={i} />
      ))}
      <div className="data-note" style={{ marginTop: 8 }}>
        <IconInfo aria-hidden />
        Community-verified data only · All = median days to PPR
      </div>
    </div>
  );
}
