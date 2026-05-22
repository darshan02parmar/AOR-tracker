import "@/styles/track.css";
import { TrackPageClient } from "@/components/track/TrackPageClient";
import { buildPageMetadata } from "@/lib/marketing-metadata";

export const metadata = buildPageMetadata({
  title: "Track My AOR — AORTrack | Canadian PR Processing Tracker",
  description:
    "Enter your AOR date and immigration stream to instantly see your cohort position and estimated PPR window. Free, no account required.",
  path: "/track",
  ogImage: "home",
  openGraphTitle: "Track My AOR — AORTrack",
  openGraphDescription:
    "See your exact cohort position and PPR window. Three steps, takes under two minutes.",
  robots: { index: false, follow: false },
});

/**
 * /track
 *
 * The track page now owns the full 3-step flow:
 *   1. Application details (AOR date, stream, type, province if PNP)
 *   2. Completed milestones
 *   3. Review + email mode + consent → save profile
 *
 * This replaces the prior `/track` (email-only gate) + `/onboarding`
 * (steps 2-3) split — both are now collapsed into one focused page,
 * matching `samples/aortrack-track-updated.html`.
 *
 * Persistence still runs through the existing server actions in
 * `@/app/actions/profile` (MongoDB-backed); see `TrackPageClient` for the
 * email-vs-anon submit branches.
 */
export default function TrackPage() {
  return <TrackPageClient />;
}
