"use client";

import { useEffect, useId, useState } from "react";
import { IconArrowRight } from "../landing-icons";
import { IconClose } from "./community-icons";
import type { AppealContext } from "./CommunityUiContext";

type Props = {
  open: boolean;
  context: AppealContext | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onValidationFail: (msg: string) => void;
};

/**
 * Appeal modal. Mirrors the appeal flow from the HTML sample — pre-fills the
 * "Removed post" context block from the post that triggered it (passed via
 * the `AppealContext`), and accepts a free-form explanation up to 1000
 * chars.
 *
 * TODO(real-data): when we ship real moderation, point this at the appeals
 *   server action and pass the post id through. The reason / cohort / day /
 *   appealDaysRemaining are already on the OwnRemovedPost type today.
 */
export function AppealModal({
  open,
  context,
  onClose,
  onSuccess,
  onValidationFail,
}: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const labelId = useId();

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
    if (open) return;
    if (submitting) return;
    setReason("");
  }, [open, submitting]);

  function onOverlayMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !submitting) onClose();
  }

  function handleSubmit() {
    if (!reason.trim()) {
      onValidationFail("Please describe why your date is correct");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onSuccess(
        "Appeal submitted — a moderator will review within 48 hours",
      );
      onClose();
    }, 1200);
  }

  return (
    <div
      className={`modal-overlay appeal-modal${open ? " open" : ""}`}
      role="presentation"
      onMouseDown={onOverlayMouseDown}
      aria-hidden={!open}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
      >
        <div className="modal-header">
          <div className="modal-title" id={labelId}>
            Appeal Moderation Decision
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
          {context ? (
            <div className="appeal-context">
              <strong>Removed post:</strong> {context.milestoneLabel} ·{" "}
              {context.day} · {context.cohortLabel}
              <br />
              <strong>Reason:</strong> {context.reason}
            </div>
          ) : null}

          <div className="m-field">
            <label className="m-label" htmlFor={`${labelId}-reason`}>
              Your appeal explanation <span className="req">Required</span>
            </label>
            <textarea
              id={`${labelId}-reason`}
              className="m-textarea"
              placeholder="Explain why your date is correct. Supporting documentation (e.g. IRCC portal screenshot, email screenshot) is strongly recommended. Paste any relevant context here…"
              style={{ minHeight: 110 }}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="m-note">
              Appeals are reviewed by a human moderator within 48
              hours. You have {context?.daysRemaining ?? 6} days remaining to
              appeal.
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
            className="m-submit m-submit-red"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              "Submitting…"
            ) : (
              <>
                <span>Submit Appeal</span>
                <IconArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
