import type { MilestoneKey } from "@/lib/types";
import { STREAM_OPTIONS, PROVINCES } from "@/lib/constants";

/**
 * View-model data for the `/track` 3-step form.
 *
 * The actual storage shape is owned by `src/lib/types.ts` (`UserProfile`,
 * `MilestoneKey`, …). This file only carries:
 *
 *   1. UI-facing stream cards (icon, name, sub-label, "avg / tracked")
 *      — keyed by the same labels used in `STREAM_OPTIONS` so we don't
 *      diverge from the persistence layer.
 *   2. The milestone checklist labels rendered in step 2. We re-key the
 *      ones that come from the sample HTML (`ms-bil`, `ms-biometrics`, …)
 *      to the canonical `MilestoneKey` enum so the submit handler can
 *      build a `UserProfile.milestones` map directly.
 *
 * NOTE on AOR: the sample HTML uses "AOR Date" as a top-level form field
 * (step 1) AND lists every other milestone in step 2. We mirror that —
 * step 2 only lists post-AOR milestones; `aor` is set from the step-1
 * date when we save.
 */

export type StreamId = (typeof STREAM_OPTIONS)[number];

export type StreamCard = {
  /** Storage value (matches `STREAM_OPTIONS`). */
  id: StreamId;
  /** Headline label on the card (e.g. "CEC"). */
  name: string;
  /** Long-form description ("Canadian Experience Class"). */
  sub: string;
  /** "184d avg · 1,240 tracked"-style line; static for now. */
  meta: string;
  /** Icon key — looked up in `track-icons.tsx`. */
  icon: StreamIconKey;
};

export type StreamIconKey =
  | "maple"
  | "stem"
  | "french"
  | "globe"
  | "landmark"
  | "hospital";

export const STREAM_CARDS: StreamCard[] = [
  {
    id: "CEC",
    name: "CEC",
    sub: "Canadian Experience Class (all pathways)",
    meta: "184d avg · 1,240 tracked",
    icon: "maple",
  },
  {
    id: "FSW General",
    name: "FSW General",
    sub: "Federal Skilled Worker",
    meta: "198d avg · 623 tracked",
    icon: "globe",
  },
  {
    id: "PNP",
    name: "PNP",
    sub: "Provincial Nominee Program",
    meta: "216d avg · 489 tracked",
    icon: "landmark",
  },
];

/** Best-effort lookup for the "stream avg" used in the step-3 summary. */
const STREAM_AVG_DAYS: Record<StreamId, number> = {
  CEC: 184,
  "FSW General": 198,
  PNP: 216,
};

export function streamAverage(stream: StreamId): number {
  return STREAM_AVG_DAYS[stream] ?? 180;
}

// ─── Application type ───────────────────────────────────────────────────────

export type AppType = "Inland" | "Outland";

export const APP_TYPES: { id: AppType; name: string; desc: string }[] = [
  { id: "Inland", name: "Inland", desc: "Applying from within Canada" },
  { id: "Outland", name: "Outland", desc: "Applying from outside Canada" },
];

// ─── Provinces ──────────────────────────────────────────────────────────────

export const PROVINCE_OPTIONS = PROVINCES;

// ─── Step-2 milestones (post-AOR only) ──────────────────────────────────────

export type TrackMilestoneDef = {
  key: Exclude<MilestoneKey, "aor">;
  label: string;
  emptyState: string;
  note: string;
};

export const TRACK_MILESTONES: TrackMilestoneDef[] = [
  {
    key: "biometrics",
    label: "Biometrics Completed",
    emptyState: "Not yet confirmed",
    note: "When IRCC confirmed your biometrics in the portal.",
  },
  {
    key: "background",
    label: "Background Check Started",
    emptyState: "Not yet started",
    note: "Date background check was initiated.",
  },
  {
    key: "medical",
    label: "Medical Results Passed",
    emptyState: "Not yet received",
    note: "Date your medical results were accepted.",
  },
  {
    key: "p1",
    label: "P1 — PR Portal (first invitation)",
    emptyState: "Not yet received",
    note:
      "Date IRCC invited you to the Permanent Residence Portal for the first confirmation step (inland).",
  },
  {
    key: "p2",
    label: "P2 — PR Portal (photo & address)",
    emptyState: "Not yet received",
    note:
      "Date you completed the portal step to submit your photo and Canadian mailing address for your PR card.",
  },
  {
    key: "ecopr",
    label: "eCOPR issued",
    emptyState: "Not yet received",
    note:
      "Date your electronic Confirmation of Permanent Residence appeared in the portal.",
  },
];

// ─── Step-1 left-panel cohort preview (static; future: live cohort fetch) ───

export type CohortBar = {
  /** 0–100 visual height. */
  height: number;
  /** "120d", "135d", … */
  label: string;
  state?: "active" | "you";
};

/**
 * Static preview of the CEC cohort histogram used in the left panel.
 *
 * TODO(real-cohort): wire to `getCohortStatsAction(streamFallbackKey(stream))`
 *   on stream change so the histogram reflects the currently-selected
 *   cohort. Keep the static shape below as a typed fallback for first paint.
 */
export const COHORT_PREVIEW: CohortBar[] = [
  { height: 20, label: "120d" },
  { height: 35, label: "135d" },
  { height: 65, label: "150d", state: "active" },
  { height: 90, label: "165d", state: "active" },
  { height: 100, label: "180d", state: "active" },
  { height: 82, label: "195d", state: "active" },
  { height: 60, label: "210d" },
  { height: 40, label: "225d" },
  { height: 22, label: "240d" },
  { height: 10, label: "255d" },
];

/** Highlight the bucket nearest to the user's typical journey / eCOPR estimate. */
export function cohortPreviewForEstimate(days: number | null): CohortBar[] {
  if (days == null || days <= 0) {
    return COHORT_PREVIEW.map((b) => ({
      ...b,
      state: b.label === "210d" ? ("you" as const) : b.state,
    }));
  }
  const bucketDays = COHORT_PREVIEW.map((b) =>
    Number.parseInt(b.label.replace(/\D/g, ""), 10),
  );
  let youIdx = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < bucketDays.length; i++) {
    const diff = Math.abs(bucketDays[i]! - days);
    if (diff < best) {
      best = diff;
      youIdx = i;
    }
  }
  return COHORT_PREVIEW.map((b, i) => ({
    ...b,
    state:
      i === youIdx
        ? ("you" as const)
        : b.state === "active"
          ? ("active" as const)
          : undefined,
  }));
}

// ─── Left-panel "preview stats" cards (static; future: cohort/PPR feed) ─────

export type LeftStat = {
  value: string;
  unit?: string;
  label: string;
  /** "+2d this week" or "-4d this week" — green text under the value. */
  delta?: string;
};

export const LEFT_PANEL_STATS: LeftStat[] = [
  { value: "184", unit: "d", label: "CEC avg", delta: "+2d this week" },
  { value: "198", unit: "d", label: "FSW General avg", delta: "-4d this week" },
  { value: "96", unit: "%", label: "Accuracy rate" },
  { value: "39", unit: "%", label: "Feb cohort PPR'd" },
];

// ─── Trust list (left panel) ────────────────────────────────────────────────

export type TrustItem = {
  iconKey: "lock" | "verified" | "trash" | "star";
  /** Plain text + optional inline link rendered at the end. */
  text: string;
  link?: { href: string; label: string };
};

export const TRUST_ITEMS: TrustItem[] = [
  {
    iconKey: "lock",
    text: "Your email is used only to resume your profile — we never sell or share it",
  },
  {
    iconKey: "verified",
    text: "All community submissions are reviewed before affecting your estimates",
  },
  {
    iconKey: "trash",
    text: "Delete your data at any time from your dashboard — PIPEDA compliant",
  },
  {
    iconKey: "star",
    text: "Open source under MIT licence —",
    link: {
      href: "https://github.com/Get-North-Path/AOR-tracker",
      label: "review the code on GitHub",
    },
  },
];
