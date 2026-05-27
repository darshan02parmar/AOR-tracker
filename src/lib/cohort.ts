import type { UserProfile } from "@/lib/types";

/** Canonical profile label stored in MongoDB for all CEC pathways. */
export const CEC_STREAM_LABEL = "CEC";

/** Legacy track labels → unified `CEC`. */
export const CEC_LEGACY_STREAM_LABELS = [
  "CEC General",
  "CEC STEM",
  "CEC Healthcare",
  "CEC French",
] as const;

const STREAM_SLUG: Record<string, string> = {
  CEC: "CEC",
  "CEC General": "CEC",
  "CEC STEM": "CEC",
  "CEC Healthcare": "CEC",
  "CEC French": "CEC",
  "FSW General": "FSW_GENERAL",
  PNP: "PNP",
};

const STATS_GROUP_LABEL: Record<string, string> = {
  CEC: "CEC",
  FSW_GENERAL: "FSW",
  PNP: "PNP",
};

const MONTH_SHORT = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function streamSlugFromLabel(stream: string): string {
  return STREAM_SLUG[stream] ?? "CEC";
}

/** Normalize stored/display stream   all CEC variants → `CEC`. */
export function normalizeStreamLabel(stream: string): string {
  const t = stream?.trim();
  if (!t) return CEC_STREAM_LABEL;
  if (t === CEC_STREAM_LABEL) return CEC_STREAM_LABEL;
  if ((CEC_LEGACY_STREAM_LABELS as readonly string[]).includes(t)) {
    return CEC_STREAM_LABEL;
  }
  const slug = STREAM_SLUG[t];
  if (slug === "CEC") return CEC_STREAM_LABEL;
  if (t.toUpperCase().startsWith("CEC ")) return CEC_STREAM_LABEL;
  return t;
}

/** Unified stream group for cohort stats (v2.0). */
export function streamGroupForStats(stream: string): string {
  const normalized = normalizeStreamLabel(stream);
  if (normalized === CEC_STREAM_LABEL) return "CEC";
  const slug = streamSlugFromLabel(normalized);
  if (slug === "CEC" || slug.startsWith("CEC_")) return "CEC";
  return STATS_GROUP_LABEL[slug] ?? slug.replace(/_GENERAL$/, "");
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Regex matching peer cohorts: same stats stream group + inland/outland   any AOR month/year.
 */
export function peerCohortKeyPattern(profileCohortKey: string): string {
  const parts = profileCohortKey.split(":");
  if (parts.length >= 4) {
    const group = escapeRegex(parts[0] ?? "");
    const kind = escapeRegex(parts[3] ?? "");
    return `^${group}:\\d+:\\d{4}:${kind}$`;
  }
  if (parts.length >= 2) {
    return `^${escapeRegex(parts[0] ?? "")}:`;
  }
  return `^${escapeRegex(profileCohortKey)}`;
}

export function humanizeCohortKey(key: string): string {
  const parts = key.split(":");
  const group = parts[0] ?? key;
  const streamLabel = group === "CEC" ? "CEC" : group.replace(/_/g, " ");

  if (parts.length >= 4) {
    const mi = parseInt(parts[1] ?? "0", 10);
    const year = parts[2] ?? "";
    const kind = parts[3] === "outland" ? "Outland" : "Inland";
    const mo =
      !mi || Number.isNaN(mi) ? " " : (MONTH_SHORT[mi] ?? parts[1]);
    return `${mo} ${year} · ${streamLabel} · ${kind}`;
  }
  if (parts.length >= 2) {
    return `${streamLabel} · ${parts[1]}`;
  }
  return streamLabel;
}

export function pulseTitleFromAor(aorDate: string): string {
  const d = new Date(`${aorDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "Weekly eCOPR pulse";
  const label = d.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
  return `Weekly eCOPR pulse   ${label} cohorts`;
}

/**
 * Stats cohort key: `{streamGroup}:{month}:{year}:{inland|outland}` (no province).
 */
export function buildStatsCohortKey(
  profile: Pick<UserProfile, "aorDate" | "stream" | "type">,
): string {
  const d = new Date(`${profile.aorDate}T12:00:00`);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const group = streamGroupForStats(profile.stream);
  const kind = profile.type.toLowerCase() === "outland" ? "outland" : "inland";
  return `${group}:${month}:${year}:${kind}`;
}

/** When AOR is missing   month 0 = unspecified. */
export function streamFallbackKey(stream: string, type?: string): string {
  const group = streamGroupForStats(stream);
  const y = new Date().getFullYear();
  const kind = type?.toLowerCase() === "outland" ? "outland" : "inland";
  return `${group}:0:${y}:${kind}`;
}

export function cohortKeyFromProfile(
  profile: Pick<UserProfile, "aorDate" | "stream" | "type" | "province">,
): string {
  if (profile.aorDate?.trim()) {
    return buildStatsCohortKey(profile);
  }
  return streamFallbackKey(profile.stream, profile.type);
}

/** @deprecated Use buildStatsCohortKey   kept for callers migrating off province keys. */
export function buildCohortKey(
  profile: Pick<UserProfile, "aorDate" | "stream" | "type" | "province">,
): string {
  return buildStatsCohortKey(profile);
}
