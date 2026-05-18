"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  createCommunityPostAction,
  getCommunitySubmitMilestoneTimelineOptionsAction,
  type CommunityMs,
  type CommunitySubmitMilestoneOption,
} from "@/app/actions/community";
import { fmtDate } from "@/lib/format";
import type { MilestoneKey, UserProfile } from "@/lib/types";
import { IconArrowRight } from "../landing-icons";
import { IconClose } from "./community-icons";

type Props = {
  open: boolean;
  /** Viewer email; only opened when non-null (else SignInPromptModal opens). */
  email: string | null;
  /** Live profile from dashboard — used to prefill dates and gate submit. */
  profile: UserProfile | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onValidationFail: (msg: string) => void;
};

/**
 * Dashboard `MilestoneKey` → community post tag. Options list itself comes from
 * `getCommunitySubmitMilestoneTimelineOptionsAction` (same `mergeMilestoneDefsForCohort`
 * pipeline as the dashboard timeline).
 */
const KEY_TO_COMMUNITY_MS: Partial<Record<MilestoneKey, CommunityMs>> = {
  biometrics: "bil",
  background: "bg",
  medical: "med",
  p1: "p1",
  p2: "p2",
  ecopr: "ecopr",
};

const DASHBOARD_TIMELINE_HREF = "/dashboard#tl-sec";

export function SubmitMilestoneModal({
  open,
  email,
  profile,
  onClose,
  onSuccess,
  onValidationFail,
}: Props) {
  const [milestoneKey, setMilestoneKey] = useState<MilestoneKey | "">("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timelineOptions, setTimelineOptions] = useState<
    CommunitySubmitMilestoneOption[]
  >([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const labelId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const selectedDef = useMemo(
    () => timelineOptions.find((d) => d.key === milestoneKey),
    [timelineOptions, milestoneKey],
  );

  const dashboardDateIso =
    milestoneKey && profile?.milestones[milestoneKey]?.date
      ? profile.milestones[milestoneKey].date
      : "";

  const hasDashboardDate = Boolean(dashboardDateIso);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!open || !email) return;
    let cancelled = false;
    const tid = window.setTimeout(() => {
      if (cancelled) return;
      setTimelineLoading(true);
      setTimelineError(null);
      void getCommunitySubmitMilestoneTimelineOptionsAction(email).then((r) => {
        if (cancelled) return;
        setTimelineLoading(false);
        if (r.ok) {
          setTimelineOptions(r.options);
          setMilestoneKey((prev) =>
            prev && r.options.some((o) => o.key === prev) ? prev : "",
          );
        } else {
          setTimelineOptions([]);
          setTimelineError(r.error);
          setMilestoneKey("");
        }
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(tid);
    };
  }, [open, email]);

  useEffect(() => {
    if (open) return;
    if (submitting) return;
    const id = window.setTimeout(() => {
      setMilestoneKey("");
      setNote("");
      setTimelineOptions([]);
      setTimelineError(null);
      setTimelineLoading(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, submitting]);

  function onOverlayMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !submitting) onClose();
  }

  async function handleSubmit() {
    if (!milestoneKey) {
      onValidationFail("Please select a milestone type");
      return;
    }
    if (!hasDashboardDate) {
      onValidationFail(
        "Add this milestone date on your dashboard before posting.",
      );
      return;
    }
    if (!email) {
      onValidationFail("You need to sign in to post.");
      return;
    }
    const ms = KEY_TO_COMMUNITY_MS[milestoneKey];
    if (!ms) {
      onValidationFail("This milestone cannot be posted to the community feed.");
      return;
    }

    const dateLabel = fmtDate(dashboardDateIso);
    const body =
      note.trim() ||
      `${selectedDef?.label ?? milestoneKey} on ${dateLabel}.`;

    setSubmitting(true);
    try {
      const res = await createCommunityPostAction(email, { body, ms });
      if (!res.ok) {
        onValidationFail(res.error);
        return;
      }
      onSuccess(
        "Submitted! Appears in your feed once the new-post bar refreshes",
      );
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const profileLoading = Boolean(open && email && profile === null);
  const blockingLoad = profileLoading || timelineLoading;
  const canSubmit =
    Boolean(email) &&
    Boolean(milestoneKey) &&
    hasDashboardDate &&
    !submitting &&
    !timelineError &&
    timelineOptions.length > 0;

  return (
    <div
      className={`modal-overlay${open ? " open" : ""}`}
      role="presentation"
      onMouseDown={onOverlayMouseDown}
      aria-hidden={!open}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        ref={dialogRef}
      >
        <div className="modal-header">
          <div className="modal-title" id={labelId}>
            Submit a Milestone
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
            disabled={submitting}
          >
            <IconClose aria-hidden />
          </button>
        </div>

        <div className="modal-body">
          {profileLoading ? (
            <p className="m-profile-loading">Loading your dashboard milestones…</p>
          ) : null}
          {timelineLoading ? (
            <p className="m-profile-loading">Loading dashboard timeline options…</p>
          ) : null}
          {timelineError ? (
            <p className="m-timeline-error" role="alert">
              {timelineError}
            </p>
          ) : null}

          {!timelineError ? (
            <div className="m-nonshare-callout" role="note">
              <span className="m-nonshare-badge">Not shareable here</span>
              <p className="m-nonshare-text">
                <strong>AOR received</strong> and{" "}
                <strong>Biometrics completed</strong> still belong on your
                dashboard timeline; they are not offered in this list because
                the community feed only tags BIL, background, medical, and PPR.
              </p>
            </div>
          ) : null}

          <div className="m-field">
            <label className="m-label" htmlFor={`${labelId}-type`}>
              Milestone type <span className="req">Required</span>
            </label>
            <select
              id={`${labelId}-type`}
              className="m-select"
              value={milestoneKey}
              disabled={blockingLoad || Boolean(timelineError)}
              onChange={(e) => {
                const v = e.target.value;
                setMilestoneKey(v === "" ? "" : (v as MilestoneKey));
              }}
            >
              <option value="">Select milestone…</option>
              {timelineOptions.map((d) => (
                <option value={d.key} key={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
            <p className="m-hint">
              Types and descriptions are loaded from the same dashboard timeline
              as your cohort (median PPR). The date below always comes from your
              saved profile — it cannot be edited here.
            </p>
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={`${labelId}-date`}>
              Date from dashboard
            </label>
            <input
              id={`${labelId}-date`}
              className="m-input m-input-readonly"
              readOnly
              tabIndex={-1}
              value={
                !milestoneKey
                  ? ""
                  : hasDashboardDate
                    ? fmtDate(dashboardDateIso)
                    : ""
              }
              placeholder={
                milestoneKey
                  ? "No date saved yet"
                  : "Select a milestone type first"
              }
            />
          </div>

          {milestoneKey &&
          !hasDashboardDate &&
          !blockingLoad &&
          !timelineError ? (
            <div className="m-dash-warning" role="status">
              <div className="m-dash-warning-badge">Action needed</div>
              <p className="m-dash-warning-text">
                Please update this milestone on your dashboard first before
                posting here. Community posts must use the same dates as your
                tracker.
              </p>
              <Link
                href={DASHBOARD_TIMELINE_HREF}
                className="m-dash-warning-btn"
              >
                Open dashboard timeline
                <IconArrowRight size={14} aria-hidden />
              </Link>
            </div>
          ) : null}

          <div className="m-field">
            <label className="m-label" htmlFor={`${labelId}-note`}>
              Optional note
              <span className="optional-hint">(max 500 chars)</span>
            </label>
            <textarea
              id={`${labelId}-note`}
              className="m-textarea"
              placeholder="Share context about your timeline — WES timing, province, anything useful for others in your cohort…"
              maxLength={500}
              value={note}
              disabled={!hasDashboardDate && Boolean(milestoneKey)}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="m-note">
              Your post will go through Gemini moderation before appearing in
              the community feed. Usually takes under 30 seconds. Visible only
              to you until approved.
            </div>
          </div>
        </div>

        <div className="m-footer">
          <button
            type="button"
            className="m-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="m-submit"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || blockingLoad}
          >
            {submitting ? (
              "Submitting…"
            ) : (
              <>
                <span>Submit Milestone</span>
                <IconArrowRight size={14} aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
