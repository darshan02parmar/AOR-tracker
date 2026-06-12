/**
 * Changelog data — types and async loader.
 *
 * Releases and the unreleased box come from GitHub REST via
 * `src/lib/github-changelog.ts`. When the token is missing or the API fails,
 * an empty shell is returned (no placeholder release history).
 */

import { loadLiveChangelogSlice } from "@/lib/github-changelog";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChangeType =
  | "added"
  | "fixed"
  | "changed"
  | "removed"
  | "security"
  | "performance";

export type ChangeDot = "g" | "r" | "b" | "a" | "t" | "m";

export type ChangeItem = {
  /**
   * Bullet text. HTML is supported (we render with dangerouslySetInnerHTML)
   * so authored markup like <code>foo</code>, <em>note</em>, <strong>x</strong>
   * works. Content is fully authored by us (or fetched from our GitHub release
   * bodies), so this is trusted input.
   */
  html: string;
  dot?: ChangeDot;
  issue?: { number: number; url: string };
};

export type ChangeSection = {
  type: ChangeType;
  items: ChangeItem[];
};

export type Contributor = {
  initials: string;
  color: string;
};

export type ContribRow = {
  label: string;
  contributors: Contributor[];
  names: string;
};

export type WhatsNext = {
  title: string;
  items: string[];
};

export type Version = {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  releaseUrl: string;
  isLatest?: boolean;
  sections: ChangeSection[];
  contribRow?: ContribRow;
  whatsNext?: WhatsNext;
};

export type Unreleased = {
  badge: string;
  title: string;
  items: string[];
  noteHtml: string;
};

export type ChangelogData = {
  hero: {
    latest: string;
    releasedAt: string;
    license: string;
    releaseCount: number;
  };
  unreleased: Unreleased;
  versions: Version[];
};

// ─── Empty fallback ─────────────────────────────────────────────────────────

function emptyChangelog(): ChangelogData {
  return {
    hero: {
      latest: "—",
      releasedAt: "—",
      license: "MIT",
      releaseCount: 0,
    },
    unreleased: {
      badge: "Unreleased",
      title: "In Progress",
      items: [],
      noteHtml:
        'Track progress on the <a href="/roadmap">Public Roadmap</a>',
    },
    versions: [],
  };
}

// ─── Loader ────────────────────────────────────────────────────────────────

/** Loads changelog data from GitHub Releases (ISR-cached). */
export async function getChangelog(): Promise<ChangelogData> {
  const live = await loadLiveChangelogSlice();
  return live ?? emptyChangelog();
}

// ─── Helpers for components ────────────────────────────────────────────────

/**
 * Short label shown in the sidebar (e.g. "May 1" for "May 1, 2026"). The
 * latest version uses "Latest" instead of a date.
 */
export function shortDateTag(date: string): string {
  const parts = date.split(",");
  return (parts[0] ?? date).trim();
}

export const CHANGE_TYPE_LABEL: Record<ChangeType, string> = {
  added: "Added",
  fixed: "Fixed",
  changed: "Changed",
  removed: "Removed",
  security: "Security",
  performance: "Performance",
};

export const CHANGE_TYPE_CLASS: Record<ChangeType, string> = {
  added: "cl-ct-add",
  fixed: "cl-ct-fix",
  changed: "cl-ct-chg",
  removed: "cl-ct-rem",
  security: "cl-ct-sec",
  performance: "cl-ct-prf",
};
