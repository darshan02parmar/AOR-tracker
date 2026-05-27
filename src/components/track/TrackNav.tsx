import Link from "next/link";
import { WebsiteLogo } from "@/components/WebsiteLogo";
import { IconChevronLeft } from "./track-icons";

/**
 * Top navbar for the standalone `/track` page.
 *
 * Mirrors the markup in `samples/aortrack-track-updated.html`:
 *
 *   - sticky dark-navy bar (64px) flush with the viewport top,
 *   - left: AORTrack logo + wordmark + "by GetNorthPath" tagline,
 *   - right: "← Back to home" link.
 *
 * Uses its own `tk-nav-*` class namespace (consistent with the rest of
 * the track page's `tk-*` scope) so it never fights the shared
 * `.marketing-site .nav` rules used on / and /changelog.
 */
export function TrackNav() {
  return (
    <nav className="tk-nav" aria-label="Track page navigation">
      <WebsiteLogo href="/" className="tk-nav-brand" aria-label="AORTrack   home" />

      <Link href="/" className="tk-nav-back">
        <IconChevronLeft aria-hidden />
        Back to home
      </Link>
    </nav>
  );
}
