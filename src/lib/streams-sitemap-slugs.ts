import { STREAM_OPTIONS } from "@/lib/constants";

export type StreamOption = (typeof STREAM_OPTIONS)[number];

/**
 * Mapping of stream labels that have dedicated /streams/* landing pages.
 * Only streams listed here get statically generated route segments.
 */
const STREAM_PAGE_SLUG_BY_LABEL: Partial<Record<StreamOption, string>> = {
  "CEC General": "cec",
  // "CEC STEM": "cec-stem",
  // "CEC Healthcare": "cec-healthcare",
  // "CEC French": "cec-french",
  "FSW General": "fsw",
  "PNP": "pnp",
};

/** URL slugs for streams that have a full landing page. */
export const STREAM_PAGE_SLUGS: readonly string[] = Object.values(
  STREAM_PAGE_SLUG_BY_LABEL,
).filter(Boolean) as string[];

export function streamSlugFromLabel(label: StreamOption): string | null {
  return STREAM_PAGE_SLUG_BY_LABEL[label] ?? null;
}

export function streamLabelFromSitemapSlug(slug: string): StreamOption | null {
  const hit = (
    Object.entries(STREAM_PAGE_SLUG_BY_LABEL) as [StreamOption, string][]
  ).find(([, s]) => s === slug);
  return hit?.[0] ?? null;
}
