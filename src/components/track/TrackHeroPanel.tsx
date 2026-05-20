import { FaArrowUp } from "react-icons/fa";
import {
  cohortPreviewForEstimate,
  LEFT_PANEL_STATS,
  TRUST_ITEMS,
  type StreamId,
} from "./data";
import { IconArrowLeft, TrustIcon } from "./track-icons";

type Props = {
  /** Live counter label rendered in the eyebrow chip (e.g. "14,827 timelines live"). */
  liveCount: string;
  /** Selected stream — used for histogram title when known. */
  stream?: StreamId | null;
  /** Typical AOR → eCOPR days (seeded pace or cohort median) for the red marker. */
  estimatedDays?: number | null;
};

/**
 * Left dark column on `/track` — purely presentational marketing reassurance:
 * eyebrow with the live counter, headline, preview stats, cohort mini-chart,
 * and the trust list.
 *
 * No interactive state of its own, so this is a regular server-renderable
 * component — `liveCount` is passed in as a prop and updated by the
 * parent client orchestrator.
 */
export function TrackHeroPanel({
  liveCount,
  stream,
  estimatedDays = null,
}: Props) {
  const cohortBars = cohortPreviewForEstimate(estimatedDays ?? null);
  const chartTitle = stream
    ? `${stream} — Days to eCOPR distribution`
    : "CEC — Days to eCOPR distribution";

  return (
    <div className="tk-left">
      <div className="tk-left-content">
        <div className="tk-eyebrow">
          <span className="tk-dot" aria-hidden="true" />
          <span>{liveCount}</span>
        </div>

        <h1>
          Track your <em>exact position</em> in the queue.
        </h1>
        <p className="tk-left-sub">
          Real data from applicants like you. Gemini-verified submissions only.
          No guesswork — your cohort, your stream, your actual estimate.
        </p>

        <div className="tk-ps-grid">
          {LEFT_PANEL_STATS.map((s) => (
            <div className="tk-ps-card" key={s.label}>
              <div className="tk-ps-val">
                {s.value}
                {s.unit ? <span>{s.unit}</span> : null}
              </div>
              <div className="tk-ps-label">{s.label}</div>
              {s.delta ? (
                <div className="tk-ps-sub">
                  <FaArrowUp aria-hidden />
                  {s.delta}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="tk-cp">
          <div className="tk-cp-label">{chartTitle}</div>
          <div className="tk-cp-bars">
            {cohortBars.map((b, i) => (
              <div
                key={`${b.label}-${i}`}
                className={`tk-cp-bar${b.state ? ` ${b.state}` : ""}`}
                style={{ height: `${b.height}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="tk-cp-labels">
            {cohortBars.map((b, i) => (
              <div
                key={`l-${b.label}-${i}`}
                className={`tk-cp-lbl${b.state ? ` ${b.state}` : ""}`}
              >
                {b.label}
                {b.state === "you" ? <IconArrowLeft aria-hidden /> : null}
              </div>
            ))}
          </div>
          <div className="tk-cp-legend">
            <div className="tk-cp-leg">
              <span
                className="tk-cp-leg-dot"
                style={{ background: "var(--green)" }}
                aria-hidden="true"
              />
              Most common range
            </div>
            <div className="tk-cp-leg">
              <span
                className="tk-cp-leg-dot"
                style={{ background: "#f87171" }}
                aria-hidden="true"
              />
              Your estimated window
            </div>
          </div>
        </div>

        <ul className="tk-trust">
          {TRUST_ITEMS.map((t, i) => (
            <li className="tk-trust-item" key={i}>
              <span className="tk-trust-ic">
                <TrustIcon iconKey={t.iconKey} />
              </span>
              <span>
                {t.text}{" "}
                {t.link ? (
                  <a href={t.link.href} target="_blank" rel="noopener noreferrer">
                    {t.link.label}
                  </a>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
