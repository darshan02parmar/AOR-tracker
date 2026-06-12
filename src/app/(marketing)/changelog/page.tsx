import "@/styles/changelog.css";
import { ChangelogClient } from "@/components/changelog/ChangelogClient";
import { getChangelog } from "@/components/changelog/data";
import { buildPageMetadata } from "@/lib/marketing-metadata";

export const metadata = buildPageMetadata({
  title: "Changelog   AORTrack | Canadian PR Processing Tracker",
  description:
    "AORTrack version history   all notable changes, fixes, and additions per release. Follows Keep a Changelog format.",
  path: "/changelog",
  ogImage: "home",
  openGraphTitle: "Changelog   AORTrack",
  openGraphDescription:
    "All notable changes per Keep a Changelog. Versions follow Semantic Versioning.",
});

/** Revalidate hourly so new GitHub releases appear without a full rebuild. */
export const revalidate = 3600;

/**
 * /changelog
 *
 * Shared MarketingNav + MarketingFooter come from
 * src/app/(marketing)/layout.tsx, which wraps every page in this route group
 * with `.marketing-site`, the nav, and the footer.
 */
export default async function ChangelogPage() {
  const data = await getChangelog();
  return <ChangelogClient data={data} />;
}
