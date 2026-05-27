"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCommentAlt,
  FaInbox,
  FaPlus,
  FaUserFriends,
} from "react-icons/fa";
import { IconArrowRight } from "../landing-icons";
import { getProfileAction } from "@/app/actions/profile";
import { daysSinceAor } from "@/lib/ppr-estimate";
import type { UserProfile } from "@/lib/types";
import { MilestoneIcon } from "./community-icons";
import { useCommunityUi, type CommunityMsFilter } from "./CommunityUiContext";
import type { CohortMini, SidebarLink } from "./data";

type Props = {
  cohortMini: CohortMini;
  browseLinks: SidebarLink[];
  milestoneLinks: SidebarLink[];
  quickLinks: SidebarLink[];
};

/** Icon map for the static "Browse" group. */
const BROWSE_ICON: Record<string, React.ReactNode> = {
  all: <FaInbox aria-hidden />,
  "my-cohort": <FaUserFriends aria-hidden />,
};

const QUICK_ICON: Record<string, React.ReactNode> = {
  submit: <FaPlus aria-hidden />,
  feedback: <FaCommentAlt aria-hidden />,
};

const MS_LINK_TO_FILTER: Record<string, CommunityMsFilter> = {
  ecopr: "ecopr",
  p1: "p1",
  p2: "p2",
  bil: "bil",
  bgc: "bgc",
  medical: "medical",
};

/** Convert "2026-02-14" to "Feb 2026" without tripping over timezones. */
function formatAorMonth(aorDate: string): string {
  if (!aorDate) return "";
  const d = new Date(`${aorDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return aorDate;
  return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

function buildCohortMiniFromProfile(p: UserProfile): CohortMini {
  const submissions = Object.values(p.milestones ?? {}).filter(
    (m) => m && m.date,
  ).length;
  return {
    label: "My Profile",
    rows: [
      { key: "Stream", value: p.stream || " ", emphasis: "green" },
      { key: "AOR Month", value: formatAorMonth(p.aorDate) || " " },
      {
        key: "Day",
        value: p.aorDate ? String(daysSinceAor(p.aorDate)) : " ",
        emphasis: "green",
      },
      { key: "Submissions", value: String(submissions) },
    ],
  };
}

const TRACK_HREF = "/track";

function CohortMiniCard({ data }: { data: CohortMini }) {
  return (
    <div className="cohort-mini">
      <div className="cm-label">{data.label}</div>
      {data.rows.map((row) => (
        <div className="cm-row" key={row.key}>
          <div className="cm-key">{row.key}</div>
          <div className={`cm-val${row.emphasis ? " g" : ""}`}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileOnboardingCard({ hasSessionEmail }: { hasSessionEmail: boolean }) {
  return (
    <div className="profile-onboarding">
      <p className="profile-onboarding-title">
        {hasSessionEmail ? "Finish your profile" : "Create your profile"}
      </p>
      <p className="profile-onboarding-text">
        {hasSessionEmail
          ? "Complete the tracker setup to see your stream, AOR day, and milestones here   and to post or reply on the feed."
          : "Set up a free AORTrack profile (about a minute) to see your cohort stats in this sidebar and contribute to the community."}
      </p>
      <Link href={TRACK_HREF} className="profile-onboarding-btn">
        <span>{hasSessionEmail ? "Continue setup" : "Get started"}</span>
        <IconArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}

function SidebarItem({
  link,
  icon,
  onClick,
  active,
}: {
  link: SidebarLink;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const className = `lsb-link${active ?? link.active ? " on" : ""}`;
  const inner = (
    <>
      {icon}
      <span>{link.label}</span>
      {link.badge ? <span className="lsb-badge">{link.badge}</span> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {inner}
      </button>
    );
  }
  if (link.href) {
    return (
      <Link href={link.href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {inner}
    </button>
  );
}

/**
 * Sticky left rail: viewer's cohort mini-card (when onboarded) or a
 * /track onboarding prompt + browse / milestone filters + quick actions.
 *
 * TODO(real-data, scope-deferred):
 *   - `my-cohort` Browse link: backend doesn't yet support a `cohortKey`
 *     filter on `getCommunityFeedAction`. For now it's inert + emits a toast.
 *   - "Active Session" / online-presence stat: no presence channel yet.
 */
export function CommunityLeftSidebar({
  cohortMini: _cohortMini,
  browseLinks,
  milestoneLinks,
  quickLinks,
}: Props) {
  const {
    viewerEmail,
    isSignedIn,
    msFilter,
    setMsFilter,
    requestPost,
    toast,
  } = useCommunityUi();

  const [profileMini, setProfileMini] = useState<CohortMini | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (viewerEmail && isSignedIn) {
      setProfileLoading(true);
      void getProfileAction(viewerEmail).then((res) => {
        if (cancelled) return;
        setProfileLoading(false);
        if (res.ok) setProfileMini(buildCohortMiniFromProfile(res.profile));
        else setProfileMini(null);
      });
    } else {
      setProfileLoading(false);
      setProfileMini(null);
    }
    return () => {
      cancelled = true;
    };
  }, [viewerEmail, isSignedIn]);

  return (
    <aside className="left-sb" aria-label="Community filters">
      <div className="lsb-sec">
        <div className="lsb-label">My Profile</div>
        {isSignedIn && profileMini ? (
          <CohortMiniCard data={profileMini} />
        ) : isSignedIn && profileLoading ? (
          <p className="profile-onboarding-loading">Loading your profile…</p>
        ) : (
          <ProfileOnboardingCard hasSessionEmail={Boolean(viewerEmail)} />
        )}
      </div>

      <div className="lsb-sec">
        <div className="lsb-label">Browse</div>
        {browseLinks.map((link) => {
          if (link.id === "all") {
            return (
              <SidebarItem
                link={link}
                icon={BROWSE_ICON[link.id]}
                key={link.id}
                active={msFilter === null}
                onClick={() => setMsFilter(null)}
              />
            );
          }
          return (
            <SidebarItem
              link={link}
              icon={BROWSE_ICON[link.id]}
              key={link.id}
              onClick={() =>
                toast(
                  "Coming soon   cohort-only filter needs a backend pass.",
                  "default",
                )
              }
            />
          );
        })}
      </div>

      <div className="lsb-divider" />

      <div className="lsb-sec">
        <div className="lsb-label">Milestones</div>
        {milestoneLinks.map((link) => {
          const ms = MS_LINK_TO_FILTER[link.id] ?? null;
          return (
            <SidebarItem
              link={link}
              icon={<MilestoneIcon milestone={link.id} />}
              key={link.id}
              active={ms !== null && ms === msFilter}
              onClick={() => setMsFilter(ms)}
            />
          );
        })}
      </div>

      <div className="lsb-divider" />

      <div className="lsb-sec">
        <div className="lsb-label">Quick</div>
        {quickLinks.map((link) => (
          <SidebarItem
            link={link}
            icon={QUICK_ICON[link.id]}
            key={link.id}
            onClick={link.id === "submit" ? requestPost : undefined}
          />
        ))}
      </div>
    </aside>
  );
}
