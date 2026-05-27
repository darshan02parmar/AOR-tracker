"use client";

import { useMemo } from "react";
import {
  APP_TYPES,
  PROVINCE_OPTIONS,
  STREAM_CARDS,
  type AppType,
  type StreamId,
} from "./data";
import {
  IconArrowRight,
  IconInland,
  IconOutland,
  StreamIcon,
} from "./track-icons";

type Errors = Partial<Record<"aor" | "stream" | "type" | "province", boolean>>;

type Props = {
  aorDate: string;
  onAorDate: (v: string) => void;

  stream: StreamId | null;
  onStream: (id: StreamId) => void;

  appType: AppType | null;
  onAppType: (t: AppType) => void;

  province: string;
  onProvince: (v: string) => void;

  errors: Errors;
  onContinue: () => void;
};

/**
 * Step 1   Application details.
 * Fields: AOR date · stream cards · app-type toggle · (province if PNP).
 *
 * Validation is owned by the orchestrator (`onContinue` is only called when
 * the parent decides to advance); we just render the field-level error
 * states it passes back through `errors`.
 */
export function TrackStep1Application({
  aorDate,
  onAorDate,
  stream,
  onStream,
  appType,
  onAppType,
  province,
  onProvince,
  errors,
  onContinue,
}: Props) {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div className="tk-panel active" role="tabpanel" aria-labelledby="tk-step-1">
      <div className="tk-step-head">
        <div className="tk-step-num">Step 1 of 3</div>
        <div className="tk-step-title">Your application details</div>
        <div className="tk-step-desc">
          This sets up your cohort   the group of applicants we compare you to.
          Takes 60 seconds.
        </div>
      </div>

      {/* AOR DATE */}
      <div className="tk-field">
        <label className="tk-field-label" htmlFor="tk-aor-date">
          AOR Date <span className="tk-req">Required</span>
        </label>
        <input
          id="tk-aor-date"
          type="date"
          max={today}
          value={aorDate}
          onChange={(e) => onAorDate(e.target.value)}
          className={errors.aor ? "tk-error" : undefined}
        />
        <div className="tk-field-note">
          Your Acknowledgement of Receipt date from the IRCC portal.
        </div>
        <div className={`tk-field-error${errors.aor ? " show" : ""}`}>
          Please enter a valid AOR date that is not in the future.
        </div>
      </div>

      {/* STREAM */}
      <div className="tk-field">
        <div className="tk-field-label">
          Immigration Stream <span className="tk-req">Required</span>
        </div>
        <div
          className="tk-stream-grid"
          role="radiogroup"
          aria-label="Immigration stream"
        >
          {STREAM_CARDS.map((s) => {
            const selected = stream === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`tk-stream-opt${selected ? " selected" : ""}`}
                onClick={() => onStream(s.id)}
              >
                <span className="tk-so-icon">
                  <StreamIcon icon={s.icon} />
                </span>
                <div className="tk-so-name">{s.name}</div>
                <div className="tk-so-sub">{s.sub}</div>
                <div className="tk-so-meta">{s.meta}</div>
              </button>
            );
          })}
        </div>
        <div className={`tk-field-error${errors.stream ? " show" : ""}`}>
          Please select your immigration stream.
        </div>
      </div>

      {/* APPLICATION TYPE */}
      <div className="tk-field">
        <div className="tk-field-label">
          Application Type <span className="tk-req">Required</span>
        </div>
        <div
          className="tk-type-grid"
          role="radiogroup"
          aria-label="Application type"
        >
          {APP_TYPES.map((t) => {
            const selected = appType === t.id;
            const Icon = t.id === "Inland" ? IconInland : IconOutland;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`tk-type-opt${selected ? " selected" : ""}`}
                onClick={() => onAppType(t.id)}
              >
                <span className="tk-to-icon">
                  <Icon aria-hidden />
                </span>
                <div className="tk-to-name">{t.name}</div>
                <div className="tk-to-desc">{t.desc}</div>
              </button>
            );
          })}
        </div>
        <div className={`tk-field-error${errors.type ? " show" : ""}`}>
          Please select your application type.
        </div>
      </div>

      {/* PROVINCE   PNP only */}
      <div className={`tk-field tk-province-field${stream === "PNP" ? " show" : ""}`}>
        <label className="tk-field-label" htmlFor="tk-province">
          Province / Territory{" "}
          <span className="tk-req">Required for PNP</span>
        </label>
        <select
          id="tk-province"
          value={province}
          onChange={(e) => onProvince(e.target.value)}
          className={errors.province ? "tk-error" : undefined}
        >
          <option value="">Select province…</option>
          {PROVINCE_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <div className={`tk-field-error${errors.province ? " show" : ""}`}>
          Please select your province of nomination.
        </div>
      </div>

      <button type="button" className="tk-btn" onClick={onContinue}>
        Continue   Add Milestones
        <IconArrowRight aria-hidden />
      </button>
    </div>
  );
}
