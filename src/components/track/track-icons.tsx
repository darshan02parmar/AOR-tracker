import type { IconType } from "react-icons";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCanadianMapleLeaf,
  FaCheck,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaCommentDots,
  FaExclamationTriangle,
  FaGlobe,
  FaHome,
  FaHospital,
  FaLandmark,
  FaLanguage,
  FaLaptopCode,
  FaLock,
  FaPlane,
  FaStar,
  FaTachometerAlt,
  FaTrashAlt,
  FaUsers,
} from "react-icons/fa";
import type { StreamIconKey, TrustItem } from "./data";

/**
 * Single source of truth for every emoji / inline SVG in
 * `samples/aortrack-track-updated.html`.
 *
 * Each named export wraps a `react-icons` component so consumer JSX stays
 * import-light. Sizing/colouring is driven by CSS   the icons themselves
 * use `fill: currentColor` via the rules in `track.css`.
 */

// ─── Stream cards ───────────────────────────────────────────────────────────

const STREAM_ICON: Record<StreamIconKey, IconType> = {
  maple: FaCanadianMapleLeaf,
  stem: FaLaptopCode,
  french: FaLanguage,
  globe: FaGlobe,
  landmark: FaLandmark,
  hospital: FaHospital,
};

export function StreamIcon({ icon }: { icon: StreamIconKey }) {
  const Icon = STREAM_ICON[icon];
  return <Icon aria-hidden />;
}

// ─── App-type cards (inland / outland) ──────────────────────────────────────

export const IconInland = FaHome;
export const IconOutland = FaPlane;

// ─── Trust list (left panel) ────────────────────────────────────────────────

const TRUST_ICON: Record<TrustItem["iconKey"], IconType> = {
  lock: FaLock,
  verified: FaCheckCircle,
  trash: FaTrashAlt,
  star: FaStar,
};

export function TrustIcon({ iconKey }: { iconKey: TrustItem["iconKey"] }) {
  const Icon = TRUST_ICON[iconKey];
  return <Icon aria-hidden />;
}

// ─── Success-state next-action cards ────────────────────────────────────────

export const IconDashboard = FaTachometerAlt;
export const IconCommunity = FaUsers;
export const IconFeedback = FaCommentDots;

// ─── Misc re-exports ────────────────────────────────────────────────────────

export {
  FaArrowLeft as IconArrowLeft,
  FaArrowRight as IconArrowRight,
  FaCheck as IconCheck,
  FaChevronLeft as IconChevronLeft,
  FaChevronRight as IconChevronRight,
  FaCanadianMapleLeaf as IconMaple,
  FaExclamationTriangle as IconWarn,
};
