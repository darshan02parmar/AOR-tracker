import type { PublicSharePayload } from "@/app/actions/share";
import type { DnTimelineBadge, DnTimelineRow } from "@/components/dashboard/v2/data";
import {
  IconCheck,
  IconCheckCircle,
  IconHome,
  IconInfo,
  IconPlus,
  IconSync,
} from "@/components/dashboard/v2/dashboard-icons";

const DOT_GLYPHS = {
  done: <IconCheck aria-hidden />,
  now: <IconSync aria-hidden />,
  wait: <IconPlus aria-hidden />,
  final: <IconCheckCircle aria-hidden />,
} as const;

function Badge({ badge }: { badge: DnTimelineBadge }) {
  if (badge.kind === "verified") {
    return (
      <div className="badge-v">
        <IconCheck aria-hidden />
        {badge.label}
      </div>
    );
  }
  if (badge.kind === "pending") {
    return (
      <div className="badge-p">
        <IconSync aria-hidden />
        {badge.label}
      </div>
    );
  }
  return <div className="tl-est">{badge.label}</div>;
}

function ReadOnlyTimelineRow({ row }: { row: DnTimelineRow }) {
  return (
    <div className="tl-row">
      <div className="tl-spine" aria-hidden />
      <div className={`tl-dot ${row.state}`}>{DOT_GLYPHS[row.state]}</div>
      <div className="tl-body">
        <div className="tl-top">
          <div>
            <div className="tl-name">{row.name}</div>
            <div className="tl-desc">{row.desc}</div>
            {row.badge ? <Badge badge={row.badge} /> : null}
          </div>
          <div className="tl-r">
            {row.date ? (
              <>
                <div className="tl-date">{row.date.date}</div>
                <div className="tl-day">{row.date.day}</div>
              </>
            ) : row.pending ? (
              <div className="tl-pend">Not yet</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard-style applicant card + milestone timeline for `/s/[token]`.
 * Server-rendered, no edit affordances, no dashboard context.
 */
export function PublicShareDashboardPeek({ data }: { data: PublicSharePayload }) {
  return (
    <div className="share-dash-v2-host dashboard-v2-page w-full max-w-[960px] rounded-[20px] border border-(--border) p-5 md:p-8">
      <div className="share-dash-peek flex w-full flex-col gap-8 lg:flex-row lg:items-start">
      <aside
        className="shrink-0 lg:w-[min(100%,260px)]"
        aria-label="Shared applicant snapshot"
      >
        <div className="dsb-card">
          <div className="dsb-id">Applicant {data.applicantId}</div>
          <div className="dsb-stream">{data.stream}</div>
          <div className="dsb-type">
            <IconHome aria-hidden />
            {data.typeLabel} · {data.province}
          </div>
          <div className="dsb-aor">
            <span>AOR Date</span>
            <span>{data.aorDateLabel}</span>
          </div>
        </div>
      </aside>

      <section id="tl-sec" className="min-w-0 flex-1">
        <div className="sec-head">
          <div>
            <div className="sec-title">Milestone timeline</div>
            <div className="sec-sub">
              Read-only view   dates reflect what this applicant saved on AORTrack.
              This link does not allow edits.
            </div>
          </div>
        </div>

        <div className="timeline" id="share-timeline">
          {data.timelineRows.map((row) => (
            <ReadOnlyTimelineRow key={row.key} row={row} />
          ))}
        </div>

        <div className="data-note">
          <IconInfo aria-hidden />
          {data.timelineNote}
        </div>
      </section>
      </div>
    </div>
  );
}
