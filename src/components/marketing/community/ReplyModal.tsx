"use client";

import { useEffect, useId, useState } from "react";
import {
  createCommunityPostAction,
  type CommunityMs,
} from "@/app/actions/community";
import { IconArrowRight } from "../landing-icons";
import { IconClose } from "./community-icons";
import type { ApprovedPost } from "./data";

type Props = {
  open: boolean;
  /** The parent post being replied to. `null` when the modal is closed. */
  parent: ApprovedPost | null;
  /** Viewer email; the modal is only opened when this is non-null. */
  email: string | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onValidationFail: (msg: string) => void;
};

/** Marketing accent → backend CommunityMs. Backend stores `bg`/`med`. */
const ACCENT_TO_MS: Record<ApprovedPost["accent"], CommunityMs> = {
  ecopr: "ecopr",
  p1: "p1",
  p2: "p2",
  bil: "bil",
  bgc: "bg",
  med: "med",
  aor: "bil",
};

/**
 * Replies to an approved community post.
 *
 * The parent's metadata (initials / name / displayId / milestone chip) is
 * surfaced at the top of the modal so the reply context is visually clear.
 * Submission goes through `createCommunityPostAction` with `replyToId` set,
 * which causes the server to attach a `replyToPreview` to the new row and
 * fan out a `feed:refresh` Socket.IO event so other open tabs see the new
 * card via the NewPostBar.
 */
export function ReplyModal({
  open,
  parent,
  email,
  onClose,
  onSuccess,
  onValidationFail,
}: Props) {
  const [body, setBody] = useState("");
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
    setBody("");
  }, [open, submitting]);

  function onOverlayMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !submitting) onClose();
  }

  async function handleSubmit() {
    if (!parent) return;
    if (!email) {
      onValidationFail("You need to sign in to reply.");
      return;
    }
    const trimmed = body.trim();
    if (trimmed.length < 3) {
      onValidationFail("Your reply is too short   add a bit more context.");
      return;
    }
    setSubmitting(true);
    try {
      const ms = ACCENT_TO_MS[parent.accent];
      const res = await createCommunityPostAction(email, {
        body: trimmed,
        ms,
        replyToId: parent.id,
      });
      if (!res.ok) {
        onValidationFail(res.error);
        return;
      }
      onSuccess(
        "Reply posted   others will see it once the new-post bar refreshes",
      );
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

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
      >
        <div className="modal-header">
          <div className="modal-title" id={labelId}>
            Reply to {parent?.displayId ?? "post"}
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
          {parent ? (
            <div className="m-field">
              <label className="m-label">Replying to</label>
              <div
                style={{
                  borderLeft: "3px solid var(--border2)",
                  paddingLeft: 12,
                  marginTop: 4,
                  color: "var(--muted)",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--navy)" }}>
                  {parent.displayId}
                  <span
                    style={{ marginLeft: 8, fontWeight: 400, fontSize: "0.78rem" }}
                  >
                    {parent.milestoneChip.label}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  dangerouslySetInnerHTML={{ __html: parent.bodyHtml }}
                />
              </div>
            </div>
          ) : null}

          <div className="m-field">
            <label className="m-label" htmlFor={`${labelId}-body`}>
              Your reply <span className="req">Required</span>
            </label>
            <textarea
              id={`${labelId}-body`}
              className="m-textarea"
              placeholder="Share follow-up context   your stream, dates, WES timing, anything useful…"
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="m-note">
              {body.length}/2000 · Plain text only · Reviewed by moderation
              before appearing publicly.
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
            disabled={submitting || !parent}
          >
            {submitting ? (
              "Posting…"
            ) : (
              <>
                <span>Post reply</span>
                <IconArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
