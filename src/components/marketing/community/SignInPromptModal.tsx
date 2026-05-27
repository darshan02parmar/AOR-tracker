"use client";

import Link from "next/link";
import { useEffect, useId } from "react";
import { IconArrowRight } from "../landing-icons";
import { IconClose } from "./community-icons";

type Props = {
  open: boolean;
  /** Optional friendly verb shown in the prompt copy, e.g. "post". */
  action?: "post" | "mark helpful" | "reply";
  onClose: () => void;
};

const ACTION_COPY: Record<NonNullable<Props["action"]>, string> = {
  post: "post a milestone",
  "mark helpful": "mark a post helpful",
  reply: "reply to a post",
};

/**
 * Shown when an anonymous viewer tries to use any gated action
 * (`requestPost`, `requestHelpful`, `requestReply`). Offers a primary
 * CTA that drops the user into the `/track` onboarding flow   once they
 * finish the flow, their session email is written to `sessionStorage`
 * and they return to `/community` ready to use the gated actions.
 *
 * Visually reuses the `.modal-overlay` / `.modal` chrome from the existing
 * SubmitMilestoneModal so it inherits the same look + escape/backdrop UX.
 */
export function SignInPromptModal({ open, action = "post", onClose }: Props) {
  const labelId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function onOverlayMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
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
            Continue from /track to {ACTION_COPY[action]}
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            <IconClose aria-hidden />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            To {ACTION_COPY[action]} we need your AORTrack profile. It only
            takes a minute   share your stream, AOR date and a few milestones,
            and you&apos;ll be able to contribute back to the community.
          </p>
          <p style={{ marginTop: 12, marginBottom: 0, lineHeight: 1.6 }}>
            You stay anonymous on the feed   only your initials and stream are
            shown.
          </p>
        </div>

        <div className="m-footer">
          <button type="button" className="m-cancel" onClick={onClose}>
            Maybe later
          </button>
          <Link href="/track" className="m-submit" onClick={onClose}>
            <span>Continue to /track</span>
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
