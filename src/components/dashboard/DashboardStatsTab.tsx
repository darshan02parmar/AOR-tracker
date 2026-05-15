"use client";

import { buildWesRowsForCohort } from "@/lib/cohort-dynamic";
import { humanizeCohortKey, pulseTitleFromAor } from "@/lib/cohort";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { fmtDate } from "@/lib/format";
import { useMemo } from "react";

export function DashboardStatsTab() {
  const { profile, cohort } = useDashboard();
  const wesRows = useMemo(() => buildWesRowsForCohort(cohort), [cohort]);

  return (
    <>
      <div className="mb-1 text-lg font-bold text-(--w)">
        Processing statistics
      </div>
      <div className="s2col">
        <div className="card">
          <div className="chd">
            <span className="ctit">Median days by stream</span>
            <span className="ctag">last 90 days</span>
          </div>
          {(() => {
            if (!cohort.stream_medians.length) {
              return (
                <div className="px-3 py-4 text-sm text-(--t2)">
                  No cross-stream median snapshot for this cohort yet.
                </div>
              );
            }
            const maxD = Math.max(
              ...cohort.stream_medians.map((s) => s.median),
              1,
            );
            return cohort.stream_medians.map((s, i) => {
              const nameL = s.name.toLowerCase().replace(/—/g, " ");
              const isY = profile.stream
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean)
                .every((tok) => nameL.includes(tok));
              return (
                <div
                  key={s.name}
                  className="lrow"
                  style={
                    isY
                      ? {
                          borderColor: "rgba(192,57,43,0.3)",
                          background: "rgba(192,57,43,0.06)",
                        }
                      : undefined
                  }
                >
                  <span className="lrank">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-xs text-(--t1)">
                      {s.name}
                      {isY ? (
                        <span className="ml-1 text-[9px] font-semibold text-(--red)">
                          YOU
                        </span>
                      ) : null}
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-(--navy4)">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((s.median / maxD) * 100)}%`,
                          background: isY
                            ? "var(--red)"
                            : "rgba(143,163,184,.35)",
                        }}
                      />
                    </div>
                  </div>
                  <span className="lval">{s.median}d</span>
                </div>
              );
            });
          })()}
        </div>
        <div className="card">
          <div className="chd">
            <span className="ctit">WES verification</span>
            <span className="ctag">community reported</span>
          </div>
          <table className="wt">
            <thead>
              <tr>
                <th>Method</th>
                <th>Avg days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
                    {wesRows.flatMap((r) => [
                <tr key={`${r.t}-row`}>
                  <td className="font-medium text-(--t1)">{r.t}</td>
                  <td className="font-[(--m)]">{r.d}</td>
                  <td>
                    <span
                      className={`wsb ${r.s === "ok" ? "ok" : r.s === "dl" ? "dl" : "pe"}`}
                    >
                      {r.s === "ok"
                        ? "Verified"
                        : r.s === "dl"
                          ? "Issue"
                          : "Pending"}
                    </span>
                  </td>
                </tr>,
                <tr key={`${r.t}-note`}>
                  <td
                    colSpan={3}
                    className="pb-1 pt-0 text-[10px] text-(--t3)"
                  >
                    {r.n}
                  </td>
                </tr>,
              ])}
            </tbody>
          </table>
        </div>
        <div className="card col-span-full">
          <div className="chd">
            <span className="ctit">
              {profile.aorDate
                ? pulseTitleFromAor(profile.aorDate)
                : `Weekly PPR pulse · ${humanizeCohortKey(cohort.cohortKey)}`}
            </span>
            <span className="ctag">trend</span>
          </div>
          <div className="flex h-[78px] items-end gap-1.75 pt-1.75">
            {(() => {
              const vals = cohort.pulseWeekly;
              const max = Math.max(...vals, 1);
              return vals.map((v, i) => (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`Week ${i + 1}: ${v} PPRs`}
                >
                  <div className="text-[9px] text-(--t3)">{v}</div>
                  <div
                    className="w-full cursor-pointer rounded-t transition-colors"
                    style={{
                      height: `${Math.round((v / max) * 100)}%`,
                      minHeight: 4,
                      background:
                        i === vals.length - 1
                          ? "var(--red)"
                          : "rgba(192,57,43,.3)",
                    }}
                  />
                </div>
              ));
            })()}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-(--t3)">
            <span>Week 1 · {fmtDate(cohort.last_updated.slice(0, 10))}</span>
            <span>Latest week</span>
          </div>
        </div>
      </div>
    </>
  );
}
