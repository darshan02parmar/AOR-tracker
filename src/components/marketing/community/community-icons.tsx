import type { IconType } from "react-icons";
import {
  FaBan,
  FaChartLine,
  FaCheckCircle,
  FaDiscord,
  FaDoorOpen,
  FaEnvelopeOpenText,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaFingerprint,
  FaHospital,
  FaHourglassHalf,
  FaIdCard,
  FaInfoCircle,
  FaSearch,
  FaThLarge,
  FaTimes,
  FaTrophy,
} from "react-icons/fa";
import type { Insight, MilestoneChipColor } from "./data";

/**
 * Single source of truth for the community page's icon set.
 *
 * Replaces every loose emoji and inline `<svg>` that used to live in the
 * community components   the sample HTML had a mix of strokes, fills, and
 * picture-character emojis ("🍁", "⚠️", etc.). Centralising here means:
 *
 *   - components stay free of icon-import noise,
 *   - the `data.ts` seed has no emoji literals to maintain,
 *   - swapping the icon for a milestone / tone is a one-line change here.
 */

// ─── Milestones ──────────────────────────────────────────────────────────────

/**
 * Keys we accept. Covers both the chip color enum and the looser ids used by
 * sidebar quick-filters (e.g. "medical" vs the chip's "med") and the submit
 * modal's milestone-type select ("biometrics", "copr").
 */
export type MilestoneIconKey =
  | MilestoneChipColor
  | "medical"
  | "biometrics"
  | "copr";

const MILESTONE_ICON: Record<MilestoneIconKey, IconType> = {
  ecopr: FaTrophy,
  p1: FaDoorOpen,
  p2: FaIdCard,
  bil: FaEnvelopeOpenText,
  bgc: FaSearch,
  med: FaHospital,
  medical: FaHospital,
  aor: FaFileAlt,
  biometrics: FaFingerprint,
  copr: FaTrophy,
};

type MilestoneIconProps = {
  milestone: string;
  className?: string;
};

/**
 * Renders the milestone-specific icon, or `null` if we don't have a mapping
 * for the supplied key (forwards-compatible   unknown keys won't crash).
 */
export function MilestoneIcon({ milestone, className }: MilestoneIconProps) {
  const Icon = MILESTONE_ICON[milestone as MilestoneIconKey];
  if (!Icon) return null;
  return <Icon aria-hidden className={className} />;
}

// ─── Insight tone ────────────────────────────────────────────────────────────

const INSIGHT_TONE_ICON: Record<Insight["tone"], IconType> = {
  amber: FaExclamationTriangle,
  green: FaChartLine,
  red: FaExclamationCircle,
  blue: FaInfoCircle,
};

export function InsightToneIcon({ tone }: { tone: Insight["tone"] }) {
  const Icon = INSIGHT_TONE_ICON[tone];
  return <Icon aria-hidden />;
}

// ─── Toast tone (matches CommunityUiContext's ToastTone) ─────────────────────

const TOAST_TONE_ICON = {
  green: FaCheckCircle,
  amber: FaExclamationTriangle,
} as const;

export function ToastToneIcon({ tone }: { tone: "green" | "amber" | "default" }) {
  if (tone === "default") return null;
  const Icon = TOAST_TONE_ICON[tone];
  return <Icon aria-hidden />;
}

// ─── Re-exports for misc usage sites ────────────────────────────────────────

export {
  FaBan as IconRemoved,
  FaDiscord as IconDiscord,
  FaHourglassHalf as IconPending,
  FaThLarge as IconDashboardGrid,
  FaTimes as IconClose,
};
