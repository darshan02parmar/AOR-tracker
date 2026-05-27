import Link from "next/link";
import {
  IconCommunity,
  IconDashboard,
  IconFeedback,
  IconMaple,
  IconChevronRight,
} from "./track-icons";

/**
 * Final state shown after the profile is persisted. Replaces the steps /
 * progress / step panels in the right column. Always reachable via the
 * dashboard, so the inner links are also good entry points back into the
 * app.
 */
export function TrackSuccess() {
  const sub =
    "Your profile is live in MongoDB now. Bookmark your dashboard   you can return from any device using the same email.";

  return (
    <div className="tk-success" role="status" aria-live="polite">
      <div className="tk-success-icon" aria-hidden="true">
        <IconMaple aria-hidden />
      </div>
      <div className="tk-success-h">You&apos;re now tracking!</div>
      <div className="tk-success-sub">{sub}</div>

      <div className="tk-next">
        <Link href="/dashboard" className="tk-na">
          <span className="tk-na-ic tk-na-navy">
            <IconDashboard aria-hidden />
          </span>
          <div className="tk-na-text">
            <div className="tk-na-title">View my dashboard</div>
            <div className="tk-na-desc">
              See your cohort position, progress ring, and PPR window estimate
            </div>
          </div>
          <span className="tk-na-arrow" aria-hidden="true">
            <IconChevronRight />
          </span>
        </Link>

        <Link href="/community" className="tk-na">
          <span className="tk-na-ic tk-na-green">
            <IconCommunity aria-hidden />
          </span>
          <div className="tk-na-text">
            <div className="tk-na-title">Browse the community feed</div>
            <div className="tk-na-desc">
              See recent milestones from applicants in your stream
            </div>
          </div>
          <span className="tk-na-arrow" aria-hidden="true">
            <IconChevronRight />
          </span>
        </Link>

        <Link
          href="https://github.com/Get-North-Path/AOR-tracker/issues/new"
          className="tk-na"
        >
          <span className="tk-na-ic tk-na-blue">
            <IconFeedback aria-hidden />
          </span>
          <div className="tk-na-text">
            <div className="tk-na-title">Give feedback on AORTrack</div>
            <div className="tk-na-desc">
              Help us improve   no GitHub account needed
            </div>
          </div>
          <span className="tk-na-arrow" aria-hidden="true">
            <IconChevronRight />
          </span>
        </Link>
      </div>
    </div>
  );
}
