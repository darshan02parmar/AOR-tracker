import { STREAM_OPTIONS } from "@/lib/constants";

export type StreamOption = (typeof STREAM_OPTIONS)[number];

/**
 * Mapping of stream labels that have dedicated /streams/* landing pages.
 * Only streams listed here get statically generated route segments.
 */
const STREAM_PAGE_SLUG_BY_LABEL: Partial<Record<StreamOption, string>> = {
  CEC: "cec",
  "FSW General": "fsw",
  "PNP": "pnp",
};

/** SEO stream pages not tied to tracker onboarding enum. */
const EXTRA_STREAM_PAGE_SLUG_BY_LABEL: Record<string, string> = {
  "Federal Skilled Trades": "fst",
  "Atlantic Immigration": "atlantic",
};

/** URL slugs for streams that have a full landing page. */
export const STREAM_PAGE_SLUGS: readonly string[] = [
  ...Object.values(STREAM_PAGE_SLUG_BY_LABEL),
  ...Object.values(EXTRA_STREAM_PAGE_SLUG_BY_LABEL),
].filter(Boolean) as string[];

export function streamSlugFromLabel(label: StreamOption): string | null {
  return STREAM_PAGE_SLUG_BY_LABEL[label] ?? null;
}

export function streamLabelFromSitemapSlug(slug: string): string | null {
  const hit = (
    Object.entries(STREAM_PAGE_SLUG_BY_LABEL) as [StreamOption, string][]
  ).find(([, s]) => s === slug);
  if (hit) return hit[0];
  const extra = Object.entries(EXTRA_STREAM_PAGE_SLUG_BY_LABEL).find(([, s]) => s === slug);
  return extra?.[0] ?? null;
}
