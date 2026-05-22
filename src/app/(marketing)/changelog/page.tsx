import "@/styles/changelog.css";
import { ChangelogClient } from "@/components/changelog/ChangelogClient";
import { getChangelog } from "@/components/changelog/data";
import { buildPageMetadata } from "@/lib/marketing-metadata";

export const metadata = buildPageMetadata({
  title: "Changelog — AORTrack | Canadian PR Processing Tracker",
  description:
    "AORTrack version history — all notable changes, fixes, and additions per release. Follows Keep a Changelog format.",
  path: "/changelog",
  ogImage: "home",
  openGraphTitle: "Changelog — AORTrack",
  openGraphDescription:
    "All notable changes per Keep a Changelog. Versions follow Semantic Versioning.",
});

/**
 * /changelog
 *
 * Shared MarketingNav + MarketingFooter come from
 * src/app/(marketing)/layout.tsx, which wraps every page in this route group
 * with `.marketing-site`, the nav, and the footer.
 *
 * TODO(github-integration): the data is static today (see
 * `src/components/marketing/changelog/data.ts`). When we wire this up to the
 * GitHub Releases API:
 *   - make `getChangelog()` async,
 *   - turn this component into `export default async function ChangelogPage()`,
 *   - add `export const revalidate = 3600;` for hourly ISR so the page stays
 *     cheap to serve while still picking up new releases.
 */
export default function ChangelogPage() {
  const data = getChangelog();
  return <ChangelogClient data={data} />;
}
