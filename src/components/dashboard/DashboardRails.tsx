import type { CohortStats } from "@/lib/types";
import type { CohortSummaryRow } from "@/app/actions/aggregate";
import type { PprEstimate } from "@/lib/ppr-estimate";
import type { CohortInsight } from "@/lib/cohort-dynamic";
import { fmtDate } from "@/lib/format";

export function DashboardRails({
  days,
  pct,
  median,
  ppr,
  cohort,
  similarCohorts,
  cohortInsights,
  onSelectCohort,
}: {
  days: number;
  pct: number;
  ringOffset: number;
  median: number;
  ppr: PprEstimate | null;
  cohort: CohortStats;
  similarCohorts: CohortSummaryRow[];
  cohortInsights: CohortInsight[];
  onSelectCohort: (cohortKey: string) => void;
}) {
  return (
    <>
      <div className="rc">
        <div className="rct">Progress</div>
        <div
          className="rrw"
          style={{
            background: `conic-gradient(#c0392b ${Math.min(Math.max(pct, 0), 100) * 3.6}deg, rgba(255,255,255,.06) 0deg)`,
          }}
        >
          <div className="rrtxt">
            <div className="rrdays">{days}</div>
            <div className="rrlbl">days</div>
          </div>
        </div>
        <div className="rrfoot">
          <div className="rrpct">{pct}% through</div>
          <div className="rrsub">
            {median > 0 ? `Based on ${median}d median` : "Cohort median not available"}
          </div>
        </div>
        <div className="ebox">
          <div className="elbl">Estimated PPR window</div>
          <div className="eval">{ppr?.windowLabel ?? "—"}</div>
          <div className="esub">
            Based on {cohort.n_verified} similar profiles · Updated{" "}
            {fmtDate(cohort.last_updated.slice(0, 10))}
          </div>
        </div>
      </div>
      <div className="rc">
        <div className="rct">Community insights</div>
        {cohortInsights.map((i, idx) => (
          <div key={`${i.t}-${idx}`} className="iitem">
            <div className={`idot ${i.t}`} />
            <div
              className="itxt"
              dangerouslySetInnerHTML={{ __html: i.txt }}
            />
          </div>
        ))}
      </div>
      <div className="rc">
        <div className="rct">Similar cohorts</div>
        {similarCohorts.map((s) => (
          <button
            key={s.cohortKey}
            type="button"
            className={`sitem ${s.isCurrent ? "on" : ""}`}
            onClick={() => onSelectCohort(s.cohortKey)}
          >
            <div className="min-w-0 text-left">
              <div className="siname">{s.label}</div>
              <div className="simeta">
                {s.nVerified} applicants · median{" "}
                {s.medianDays > 0 ? `~${s.medianDays}d` : "—"}
              </div>
            </div>
            <span className="sidays shrink-0">
              {s.medianDays > 0 ? `~${s.medianDays}d` : "—"}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
