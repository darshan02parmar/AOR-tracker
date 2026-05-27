"use client";

import { useCommunityUi } from "./CommunityUiContext";
import type { CommunityPageData } from "./data";

type Props = {
  cta: CommunityPageData["submitCta"];
};

/**
 * Pinned "Got a milestone? Share it." card at the top of the feed.
 *
 * The CTA now opens the shared submit-milestone modal owned by the page
 * shell instead of redirecting to `/track`   matching the HTML sample.
 *
 * TODO(real-data): keep the static copy but, once we move milestone
 *   submissions out of `/track` and into this inline modal, drop the
 *   `cta.href` field entirely.
 */
export function SubmitCtaCard({ cta }: Props) {
  const { openSubmit } = useCommunityUi();
  return (
    <div className="submit-card">
      <div className="sub-card-text">
        <h3>{cta.heading}</h3>
        <p>{cta.sub}</p>
      </div>
      <button type="button" className="sub-card-btn" onClick={openSubmit}>
        {cta.buttonLabel}
      </button>
    </div>
  );
}
