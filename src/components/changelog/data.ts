/**
 * Changelog data — static seed.
 *
 * TODO(github-integration): Today this file is the single source of truth for
 *   what is rendered on /changelog. In the future we want releases to come
 *   directly from the GitHub repo (Get-North-Path/AOR-tracker) so that cutting
 *   a release and merging the PR is enough to update this page. Target shape:
 *
 *     async function loadChangelog(): Promise<ChangelogData> {
 *       // 1. GET https://api.github.com/repos/Get-North-Path/AOR-tracker/releases
 *       //    -> map each release to a Version (parse body markdown into
 *       //       ChangeSection[] by "### Added" / "### Fixed" / etc. headings).
 *       // 2. GET /issues?state=open&labels=in-progress for the unreleased box.
 *       // 3. GET /commits or release.author for contributor avatars/names.
 *       // 4. Cache server-side (Next.js fetch with revalidate: 3600).
 *     }
 *
 *   When that lands:
 *     - delete `seedChangelog` below,
 *     - replace `getChangelog()` with the async loader,
 *     - bump the page (page.tsx) to `export const revalidate = 3600` (or ISR).
 *   The component layer should not need to change — it already consumes the
 *   typed shape declared here.
 */

const REPO = "https://github.com/Get-North-Path/AOR-tracker";

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
   * works. Content is fully authored by us (or, later, fetched from our own
   * GitHub repo body), so this is trusted input.
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

// ─── Static seed ────────────────────────────────────────────────────────────

const seedChangelog: ChangelogData = {
  hero: {
    latest: "v0.4.1",
    releasedAt: "May 3, 2026",
    license: "MIT",
    releaseCount: 6,
  },

  unreleased: {
    badge: "Unreleased — v0.5",
    title: "In Progress",
    items: [
      "Stream SSR pages with JSON-LD Dataset schema (#49)",
      "Discord webhook notifications replacing Slack (#45)",
      "OINP stream — first provincial nominee stream launch (#47)",
      "90-day anonymous session + POST /api/v1/profile/add-email (#53)",
      "Cohort dot map visualisation (#50)",
      "sitemap.xml auto-generated with noindex below 50 data points",
    ],
    noteHtml:
      'Expected: May 2026 · Track progress on the <a href="/roadmap">Public Roadmap</a>',
  },

  versions: [
    // ── v0.4.1 ────────────────────────────────────────────────
    {
      id: "v041",
      version: "v0.4.1",
      date: "May 3, 2026",
      title: "Moderation hotfixes",
      description:
        "Patch reducing D2 false-positive rate and fixing JSON parse failures on malformed moderation API responses.",
      releaseUrl: `${REPO}/releases/tag/v0.4.1`,
      isLatest: true,
      sections: [
        {
          type: "fixed",
          items: [
            {
              html: 'D2 (consultant solicitation) false-positive rate reduced from 12% to 3.4% — implicit solicitation detection threshold raised from 0.55 → 0.68. <em>Genuine applicants writing "my consultant said…" no longer flagged</em>',
              dot: "r",
              issue: { number: 68, url: `${REPO}/issues/68` },
            },
            {
              html: "JSON repair prompt retry now fires correctly on malformed moderation API response — previously returned unhandled promise rejection causing submissions to silently drop",
              dot: "r",
              issue: { number: 65, url: `${REPO}/issues/65` },
            },
            {
              html: "Appeals upheld rate metric on <code>/admin/metrics</code> now computes correctly — was reading from wrong collection after v0.4.0 schema rename",
              dot: "r",
              issue: { number: 67, url: `${REPO}/issues/67` },
            },
            {
              html: "SSE connection now reconnects with exponential backoff (1s → 4s → 16s) — was retrying immediately causing server overload during IRCC draw day spikes",
              dot: "r",
              issue: { number: 69, url: `${REPO}/issues/69` },
            },
          ],
        },
      ],
      contribRow: {
        label: "Contributors:",
        contributors: [
          { initials: "gn", color: "var(--green)" },
          { initials: "cd", color: "var(--blue)" },
        ],
        names: "@getnorthpath, @community-dev",
      },
    },

    // ── v0.4.0 ────────────────────────────────────────────────
    {
      id: "v040",
      version: "v0.4.0",
      date: "May 1, 2026",
      title: "Community moderation pipeline",
      description:
        "Full 7-category AI moderation, BullMQ queue, admin review UI with keyboard shortcuts, appeal flow, and IP cluster detection.",
      releaseUrl: `${REPO}/releases/tag/v0.4.0`,
      sections: [
        {
          type: "added",
          items: [
            {
              html: "Automated moderation pipeline — all 7 detection categories (D1 date fraud, D2 solicitation, D3 multi-account, D4 off-topic, D5 misinformation, D6 harassment, D7 PII) evaluated per submission. Light → full review escalation at confidence 0.55–0.75 or &gt;2 prior violations",
              dot: "g",
              issue: { number: 31, url: `${REPO}/issues/31` },
            },
            {
              html: "BullMQ queue with token bucket rate limiting — accepts 1,000 submissions/minute, retries with exponential backoff (1s, 4s, 16s, 60s), no silent drops",
              dot: "g",
            },
            {
              html: "5-tier action-service: APPROVE, SOFT_FLAG, SHADOW_FLAG, REMOVE, BAN — all written to append-only <code>moderation_audit_log</code>",
              dot: "g",
            },
            {
              html: "Admin review queue at <code>/admin/queue</code> — split-panel UI with flagged evidence spans highlighted amber, cohort mini-chart, account history, keyboard shortcuts A/R/E/P/N",
              dot: "g",
            },
            {
              html: "Appeal flow — 7-day window for REMOVE, 14-day for BAN. Human-only review (no automated re-review). Upheld appeals restore post to feed",
              dot: "g",
            },
            {
              html: "Moderation metrics dashboard at <code>/admin/metrics</code> — precision, recall estimate, appeals upheld rate, queue depth, Flash vs Pro split, P95 latency",
              dot: "g",
            },
            {
              html: "IP hashing (<code>SHA-256(ip + daily_rotating_salt)</code>) for cluster detection. Rate limit: 5 profiles/24h = flag, 20/24h = HTTP 429",
              dot: "g",
            },
            {
              html: "Moderation service unavailable fallback: all submissions shadow-flagged with <code>moderation_unavailable</code> status and routed to human review — no data loss",
              dot: "g",
            },
          ],
        },
        {
          type: "security",
          items: [
            {
              html: "Admin endpoints: RS256 JWT (15-min expiry) + TOTP MFA + IP allowlist at API gateway — triple defence-in-depth",
              dot: "a",
            },
            {
              html: "Moderation prompts moved to environment secrets. Post body HTML-stripped and truncated to 2,000 chars before review to mitigate injection attacks",
              dot: "a",
            },
            {
              html: "Moderation verdict JSON schema validation before action-service logic runs — unexpected <code>action</code> field values rejected and shadow-flagged",
              dot: "a",
            },
          ],
        },
        {
          type: "changed",
          items: [
            {
              html: "Community feed now shows only <code>moderation_status = approved</code> posts. Previously showed all submitted posts pending manual review",
              dot: "b",
            },
            {
              html: "<code>POST /api/v1/submissions</code> returns HTTP 202 in &lt;500ms — processing is fully async. Dashboard updates optimistically",
              dot: "b",
            },
          ],
        },
      ],
      contribRow: {
        label: "Contributors:",
        contributors: [
          { initials: "gn", color: "var(--green)" },
          { initials: "sc", color: "var(--purple)" },
          { initials: "jl", color: "var(--amber)" },
        ],
        names: "@getnorthpath, @sec-contrib, @jl-dev +2",
      },
      whatsNext: {
        title: "What came next",
        items: [
          "v0.4.1 hotfix — D2 false-positive fix and JSON parse error handling",
          "v0.5 in progress — SEO infrastructure and OINP stream",
        ],
      },
    },

    // ── v0.3.0 ────────────────────────────────────────────────
    {
      id: "v030",
      version: "v0.3.0",
      date: "Apr 21, 2026",
      title: "Community Layer",
      description:
        "Community feed, SSE live updates, 3-step onboarding wizard, share slugs, histogram, dot map, and community insights panel.",
      releaseUrl: `${REPO}/releases/tag/v0.3.0`,
      sections: [
        {
          type: "added",
          items: [
            {
              html: "Community feed at <code>/community</code> — paginated approved-only posts with SSE new-post notification bar (5-second delivery target)",
              dot: "g",
              issue: { number: 22, url: `${REPO}/issues/22` },
            },
            {
              html: "Filter chips: All, PPR, BIL, BGC, Medical — active filter persisted to localStorage and restored on return",
              dot: "g",
            },
            {
              html: "Helpful / Reply / Save engagement on feed cards. Replies routed through same moderation pipeline as primary submissions",
              dot: "g",
            },
            {
              html: "3-step onboarding: Application Details → Completed Milestones → Review &amp; Email. localStorage draft persists between steps and return sessions",
              dot: "g",
              issue: { number: 28, url: `${REPO}/issues/28` },
            },
            {
              html: "Share feature — unique slug <code>/t/{adjective}-{noun}-{stream}-{aordate}</code>. Read-only. Copy / WhatsApp / PNG card (1200×630 server-generated)",
              dot: "g",
              issue: { number: 25, url: `${REPO}/issues/25` },
            },
            {
              html: "PPR celebration prompt auto-shown on PPR milestone log — pre-filled tweet and LinkedIn post with share URL",
              dot: "g",
            },
            {
              html: "Days-to-PPR histogram in 30-day buckets. User estimated window highlighted red. Community-verified submissions only",
              dot: "g",
            },
            {
              html: "Cohort dot map — 500-sampled grid, colour-coded by stage. User dot: white outline ring. Hover tooltip shows anonymised applicant ID and stage",
              dot: "g",
            },
            {
              html: "Community Insights panel — alert cards with 72-hour auto-expiry, auto-generated ≤140 char summaries, moderated before display",
              dot: "g",
            },
          ],
        },
        {
          type: "fixed",
          items: [
            {
              html: "Dashboard cohort stats now refresh in background without blocking initial render — was causing 1.2s layout shift on return visits",
              dot: "r",
              issue: { number: 29, url: `${REPO}/issues/29` },
            },
          ],
        },
      ],
      contribRow: {
        label: "Contributors:",
        contributors: [
          { initials: "gn", color: "var(--green)" },
          { initials: "cd", color: "var(--blue)" },
          { initials: "mk", color: "var(--teal)" },
        ],
        names: "@getnorthpath, @community-dev, @mk-dev +3",
      },
    },

    // ── v0.2.0 ────────────────────────────────────────────────
    {
      id: "v020",
      version: "v0.2.0",
      date: "Apr 10, 2026",
      title: "Data Quality & Security",
      description:
        "SHA-256 hashing, PIPEDA deletion, animated SVG progress ring, P25–P75 PPR window, cohort progress bars, magic-link resume.",
      releaseUrl: `${REPO}/releases/tag/v0.2.0`,
      sections: [
        {
          type: "added",
          items: [
            {
              html: 'SVG progress ring — animates from 0% on dashboard load. WCAG 2.1 AA text equivalent for screen readers: "65% of median elapsed (120 of 184 days)"',
              dot: "g",
              issue: { number: 19, url: `${REPO}/issues/19` },
            },
            {
              html: "PPR window estimate as p25–p75 date range (never a single date). Minimum 2-week buffer applied when p25 is already past. Requires ≥30 verified cohort submissions",
              dot: "g",
            },
            {
              html: 'Per-milestone cohort progress bars with animated fill, absolute count, and percentage ("482 of 1,240 past this stage")',
              dot: "g",
            },
            {
              html: "Magic link resume via <code>POST /api/v1/auth/resume</code> — single-use HMAC-signed JWT, 24h TTL, Redis invalidation. Works from any device for email-registered users",
              dot: "g",
              issue: { number: 17, url: `${REPO}/issues/17` },
            },
            {
              html: "Processing stats page at <code>/stats</code> — stream leaderboard with p25–p75 confidence bars, WES verification table, data source labels on all statistics",
              dot: "g",
            },
          ],
        },
        {
          type: "security",
          items: [
            {
              html: "Email stored as SHA-256 hash only. Separate AES-256-GCM <code>notifications_blob</code> for transactional email — raw email never persisted anywhere",
              dot: "a",
              issue: { number: 14, url: `${REPO}/issues/14` },
            },
            {
              html: "One-click PIPEDA data deletion from dashboard — cascades to all collections. Nightly hard-delete of soft-deleted records after 24h",
              dot: "a",
            },
            {
              html: "IP stored as <code>SHA-256(ip + daily_rotating_salt)</code> — raw IPs never logged to any persistent store",
              dot: "a",
            },
          ],
        },
        {
          type: "fixed",
          items: [
            {
              html: "PPR submissions without biometrics date now excluded from community statistics with a clear dashboard warning — was silently included causing inflated estimates",
              dot: "r",
              issue: { number: 18, url: `${REPO}/issues/18` },
            },
          ],
        },
      ],
      contribRow: {
        label: "Contributors:",
        contributors: [
          { initials: "gn", color: "var(--green)" },
          { initials: "jl", color: "var(--amber)" },
        ],
        names: "@getnorthpath, @jl-dev",
      },
    },

    // ── v0.1.1 ────────────────────────────────────────────────
    {
      id: "v011",
      version: "v0.1.1",
      date: "Mar 28, 2026",
      title: "Critical Cohort Fix",
      description:
        "Patch fixing cohort key collision that caused FSW General and CEC General data to merge incorrectly.",
      releaseUrl: `${REPO}/releases/tag/v0.1.1`,
      sections: [
        {
          type: "fixed",
          items: [
            {
              html: "<strong>Critical:</strong> Cohort key collision between <code>FSW_GENERAL:2:2026:inland</code> and <code>CEC_GENERAL:2:2026:inland</code> due to missing stream-type prefix check. FSW estimates were inflated by ~30 days. All affected records re-indexed and cohort stats recomputed",
              dot: "r",
              issue: { number: 12, url: `${REPO}/issues/12` },
            },
            {
              html: "Live counter now cached at 5-minute TTL server-side — was hitting MongoDB directly on every request causing 120ms latency spike at peak load",
              dot: "r",
              issue: { number: 13, url: `${REPO}/issues/13` },
            },
          ],
        },
      ],
    },

    // ── v0.1.0 ────────────────────────────────────────────────
    {
      id: "v010",
      version: "v0.1.0",
      date: "Mar 14, 2026",
      title: "Initial Public Release 🍁",
      description:
        "The first public version — core tracker, MongoDB schema, cohort key design, and basic dashboard.",
      releaseUrl: `${REPO}/releases/tag/v0.1.0`,
      sections: [
        {
          type: "added",
          items: [
            {
              html: "AOR date submission at <code>/track</code> — stream dropdown, inland/outland type, optional email, form validation, 202 response",
              dot: "g",
            },
            {
              html: "MongoDB <code>users</code> collection with cohort key format <code>{stream}:{aor_month}:{aor_year}:{type}</code>. Fallback to annual key when cohort n &lt; 30",
              dot: "g",
            },
            {
              html: "Personal dashboard — days counter, stream median, cohort rank, 6-milestone timeline with hover-to-edit inline date pickers and optimistic UI",
              dot: "g",
            },
            {
              html: "Session token (HMAC-signed UUID) in HttpOnly cookie for anonymous user persistence on same device",
              dot: "g",
            },
            {
              html: "6 streams at launch: CEC General, CEC STEM, CEC French, FSW General, FST, PNP",
              dot: "g",
            },
            {
              html: "Feedback form → GitHub Issues API with labels <code>source:community</code> and <code>type:[bug/feature/data]</code>. <code>feedback_queue</code> collection for API failure fallback",
              dot: "g",
            },
            {
              html: "CONTRIBUTING.md, CODE_OF_CONDUCT.md (Contributor Covenant v2.1), 4 GitHub issue templates, MIT LICENSE",
              dot: "g",
            },
            {
              html: "Landing page — SSR hero with live counter (5-min TTL), How It Works, stream cards, trust signals, consulting cross-sell",
              dot: "g",
            },
          ],
        },
      ],
      contribRow: {
        label: "Founded by:",
        contributors: [{ initials: "gn", color: "var(--green)" }],
        names: "@getnorthpath — GetNorthPath Inc.",
      },
    },
  ],
};

// ─── Loader ────────────────────────────────────────────────────────────────

/**
 * Returns the changelog data the page should render.
 *
 * TODO(github-integration): swap this for an async loader that fetches the
 *   releases + open issues from the GitHub REST API (see the file header).
 *   The function is intentionally sync today so server components can call
 *   it without awaiting; once it goes async, the calling page becomes
 *   `export default async function ChangelogPage()`.
 */
export function getChangelog(): ChangelogData {
  return seedChangelog;
}

// ─── Helpers for components ────────────────────────────────────────────────

/**
 * Short label shown in the sidebar (e.g. "May 1" for "May 1, 2026"). The
 * latest version uses "Latest" instead of a date.
 */
export function shortDateTag(date: string): string {
  // "May 3, 2026" -> "May 3"
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
