"use client";

import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { NorthBrand } from "../NorthBrand";
import { IconDashboardGrid } from "./community-icons";
import { useCommunityUi } from "./CommunityUiContext";

type Props = {
  /** Headline shown to the right of the brand (e.g. "Community Feed"). */
  pageLabel?: string;
  /** Where the "Dashboard" link in the right cluster should send users. */
  dashboardHref: string;
};

/**
 * Community-page-only top nav. Mirrors the markup in
 * `samples/aortrack-community-updated.html` but uses `cm-nav-*` / `cm-nbtn`
 * class names so it never fights the shared `.marketing-site .nav` rules
 * in `marketing-core.css` (which the page also pulls in for footer
 * styling).
 *
 * Live count + "+ Submit Milestone" both wire into `useCommunityUi()`  
 * the shell owns the auto-ticking counter and the submit-modal state.
 */
export function CommunityNav({
  pageLabel = "Community Feed",
  dashboardHref,
}: Props) {
  const { liveCount, openSubmit } = useCommunityUi();
  const formatted = new Intl.NumberFormat("en-US").format(liveCount);

  return (
    <nav className="cm-nav" aria-label="Community navigation">
      <div className="cm-nav-left">
        <NorthBrand />
        <span className="cm-nav-sep" aria-hidden="true" />
        <span className="cm-nav-page">{pageLabel}</span>
      </div>

      <div className="cm-nav-right">
        <div className="cm-nav-live" role="status" aria-live="polite">
          <span className="cm-nav-live-dot" aria-hidden="true" />
          <span>{formatted}</span>
          <span className="cm-nav-live-word">live</span>
        </div>
        <Link href={dashboardHref} className="cm-nbtn">
          <IconDashboardGrid aria-hidden />
          Dashboard
        </Link>
        <button
          type="button"
          className="cm-nbtn red"
          onClick={openSubmit}
          aria-label="Submit milestone"
        >
          <FaPlus aria-hidden />
          <span className="cm-nbtn-text cm-nbtn-text-desktop" aria-hidden="true">
            Submit Milestone
          </span>
          <span className="cm-nbtn-text cm-nbtn-text-mobile" aria-hidden="true">
            Post
          </span>
        </button>
      </div>
    </nav>
  );
}
