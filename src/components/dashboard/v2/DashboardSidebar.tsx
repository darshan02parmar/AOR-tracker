"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { useDashboardV2Ui } from "./DashboardV2Context";
import {
  DN_NO_EMAIL_WARN,
  DN_PROFILE,
  DN_SIDEBAR,
  type DnProfile,
  type SidebarIconKey,
  type SidebarItem,
  type SidebarSections,
} from "./data";
import {
  IconCohort,
  IconEmail,
  IconFeed,
  IconHome,
  IconOverview,
  IconPlus,
  IconShare,
  IconStats,
  IconTimeline,
  IconTrash,
  IconWarn,
} from "./dashboard-icons";

const ICONS: Record<
  SidebarIconKey,
  ComponentType<{ "aria-hidden"?: boolean }>
> = {
  overview: IconOverview,
  timeline: IconTimeline,
  cohort: IconCohort,
  feed: IconFeed,
  stats: IconStats,
  plus: IconPlus,
  share: IconShare,
  email: IconEmail,
  trash: IconTrash,
};

function SidebarRow({
  item,
  onConfirmDelete,
}: {
  item: SidebarItem;
  onConfirmDelete: () => void;
}) {
  const Icon = ICONS[item.icon];
  const cls = [
    "dsb-link",
    item.active ? "on" : "",
    item.kind === "danger" ? "danger" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <Icon aria-hidden />
      {item.label}
      {item.badge ? (
        <span
          className={`dsb-badge${item.badgeTone === "red" ? " red" : ""}`}
        >
          {item.badge}
        </span>
      ) : null}
    </>
  );

  if (item.kind === "danger") {
    return (
      <button type="button" className={cls} onClick={onConfirmDelete}>
        {body}
      </button>
    );
  }

  if (item.href?.startsWith("#")) {
    return (
      <a href={item.href} className={cls}>
        {body}
      </a>
    );
  }

  return (
    <Link href={item.href ?? "#"} className={cls}>
      {body}
    </Link>
  );
}

/**
 * Left-rail sidebar.
 *
 * Sample reference: <aside class="sidebar">.
 *
 * Differences from the sample:
 *   - Iconography uses react-icons instead of inline SVGs/emojis.
 *   - A "Share" section is added (per spec) — the production `/dashboard`
 *     sidebar exposes a Share link, so the new design mirrors it.
 *   - The icon next to the type label uses `IconHome` instead of 🏠.
 *
 * Pass `profile` / `sections` / `noEmailWarn` to drive the seed-data preview
 * vs. the live `/dashboard` rendering. `onConfirmDelete` lets the live shell
 * wire `deleteProfileAction`; the default (used by the preview) just toasts.
 *
 * When `noEmailWarn` is explicitly `null`, the amber "Add email" banner is
 * hidden — handy on the live dashboard once the user has an email on file.
 */
export function DashboardSidebar({
  profile = DN_PROFILE,
  sections = DN_SIDEBAR,
  noEmailWarn = DN_NO_EMAIL_WARN,
  onConfirmDelete,
}: {
  profile?: DnProfile;
  sections?: SidebarSections;
  noEmailWarn?: typeof DN_NO_EMAIL_WARN | null;
  onConfirmDelete?: () => void;
} = {}) {
  const { showToast } = useDashboardV2Ui();

  const handleConfirmDelete = () => {
    const ok = window.confirm(
      "Delete all your AORTrack data permanently?\n\nThis removes:\n• AOR date and stream\n• All milestone dates\n• Community submissions\n• Shareable profile\n\nThis cannot be undone.",
    );
    if (!ok) return;
    if (onConfirmDelete) {
      onConfirmDelete();
      return;
    }
    showToast("Deletion requested — you will receive a confirmation email");
  };

  return (
    <aside className="dsb" aria-label="Dashboard sidebar">
      <div className="dsb-card">
        <div className="dsb-id">Applicant {profile.applicantId}</div>
        <div className="dsb-stream">{profile.stream}</div>
        <div className="dsb-type">
          <IconHome aria-hidden />
          {profile.typeLabel} · {profile.province}
        </div>
        <div className="dsb-aor">
          <span>AOR Date</span>
          <span>{profile.aorDateLabel}</span>
        </div>
      </div>

      {noEmailWarn ? (
        <div className="dsb-warn" role="note">
          <IconWarn aria-hidden />
          <span>
            {noEmailWarn.body}{" "}
            <Link href={noEmailWarn.linkHref}>
              {noEmailWarn.linkLabel}
            </Link>{" "}
            {noEmailWarn.trailing}
          </span>
        </div>
      ) : null}

      <div className="dsb-sec">
        <div className="dsb-lbl">Dashboard</div>
        {sections.dashboard.map((it) => (
          <SidebarRow
            key={it.key}
            item={it}
            onConfirmDelete={handleConfirmDelete}
          />
        ))}
      </div>

      <div className="dsb-div" aria-hidden />

      <div className="dsb-sec">
        <div className="dsb-lbl">Community</div>
        {sections.community.map((it) => (
          <SidebarRow
            key={it.key}
            item={it}
            onConfirmDelete={handleConfirmDelete}
          />
        ))}
      </div>

      <div className="dsb-div" aria-hidden />

      <div className="dsb-sec">
        <div className="dsb-lbl">Share</div>
        {sections.share.map((it) => (
          <SidebarRow
            key={it.key}
            item={it}
            onConfirmDelete={handleConfirmDelete}
          />
        ))}
      </div>

      <div className="dsb-div" aria-hidden />

      <div className="dsb-sec">
        <div className="dsb-lbl">Profile</div>
        {sections.profile.map((it) => (
          <SidebarRow
            key={it.key}
            item={it}
            onConfirmDelete={handleConfirmDelete}
          />
        ))}
      </div>
    </aside>
  );
}
