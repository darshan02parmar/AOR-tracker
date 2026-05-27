"use client";

import type { MilestoneKey } from "@/lib/types";
import { TRACK_MILESTONES } from "./data";
import {
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconWarn,
} from "./track-icons";

type PostAorKey = Exclude<MilestoneKey, "aor">;

type Props = {
  /** Which milestones are checked (post-AOR only). */
  checked: Record<PostAorKey, boolean>;
  /** Stored ISO dates for the checked milestones. */
  dates: Record<PostAorKey, string>;
  onToggle: (key: PostAorKey) => void;
  onDate: (key: PostAorKey, value: string) => void;

  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

const DATE_FMT = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatStored(date: string): string {
  if (!date) return "";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return DATE_FMT.format(d);
}

/**
 * Step 2   post-AOR milestones (BIL, biometrics, BGC, medical, PPR).
 *
 * Each row is a checkbox header that toggles a collapsible date input
 * below. When `ecopr` is checked but `biometrics` is not, a warning callout
 * is rendered (excluded from community stats without biometrics).
 */
export function TrackStep2Milestones({
  checked,
  dates,
  onToggle,
  onDate,
  onBack,
  onContinue,
  onSkip,
}: Props) {
  const showEcoprWarn = checked.ecopr && !checked.biometrics;

  return (
    <div className="tk-panel active" role="tabpanel" aria-labelledby="tk-step-2">
      <div className="tk-step-head">
        <div className="tk-step-num">Step 2 of 3</div>
        <div className="tk-step-title">Completed milestones</div>
        <div className="tk-step-desc">
          Check any milestones you&apos;ve already received and enter the date.
          All optional   skip any you haven&apos;t reached yet.
        </div>
      </div>

      <div className="tk-field">
        <div className="tk-ms-list">
          {TRACK_MILESTONES.map((m) => {
            const isChecked = checked[m.key];
            const displayDate = formatStored(dates[m.key]);
            return (
              <div
                key={m.key}
                className={`tk-ms-item${isChecked ? " checked" : ""}`}
              >
                <button
                  type="button"
                  className="tk-ms-head"
                  aria-pressed={isChecked}
                  onClick={() => onToggle(m.key)}
                >
                  <span className="tk-ms-checkbox" aria-hidden="true">
                    {isChecked ? <IconCheck /> : null}
                  </span>
                  <span className="tk-ms-label">{m.label}</span>
                  <span className="tk-ms-date">
                    {isChecked && displayDate ? displayDate : m.emptyState}
                  </span>
                </button>
                <div className="tk-ms-datefield">
                  <input
                    type="date"
                    value={dates[m.key]}
                    onChange={(e) => onDate(m.key, e.target.value)}
                    aria-label={`${m.label} date`}
                  />
                  {m.key === "ecopr" && showEcoprWarn ? (
                    <div className="tk-field-note warn" role="alert">
                      <IconWarn aria-hidden />
                      <span>
                        eCOPR submissions without a biometrics date are excluded
                        from community statistics. Please add your biometrics
                        date above.
                      </span>
                    </div>
                  ) : null}
                  <div className="tk-field-note">{m.note}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tk-row">
        <button
          type="button"
          className="tk-btn-secondary"
          onClick={onBack}
        >
          <IconChevronLeft aria-hidden />
          Back
        </button>
        <button type="button" className="tk-btn" onClick={onContinue}>
          Review &amp; Submit
          <IconArrowRight aria-hidden />
        </button>
      </div>
      <button
        type="button"
        className="tk-btn-secondary"
        onClick={onSkip}
        style={{ color: "var(--muted2)" }}
      >
        Skip   I haven&apos;t reached any milestones yet
      </button>
    </div>
  );
}
