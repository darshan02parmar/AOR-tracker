import Link from "next/link";
import { NorthBrand } from "../NorthBrand";
import { IconGitHub, IconPlus } from "./roadmap-icons";

type Props = {
  pageLabel?: string;
  /** URL to /changelog. */
  changelogHref: string;
  /** Public repo URL. */
  repoHref: string;
  /** GitHub issue template chooser (contributors open issues themselves). */
  feedbackHref: string;
};

/**
 * Roadmap-page-only top nav (own classes `rm-nav-*` / `rm-nbtn` so it never
 * fights the shared `.marketing-site .nav` rules). Mirrors the sample HTML
 * but uses react-icons instead of inline SVGs.
 */
export function RoadmapNav({
  pageLabel = "Public Roadmap",
  changelogHref,
  repoHref,
  feedbackHref,
}: Props) {
  return (
    <nav className="rm-nav" aria-label="Roadmap navigation">
      <div className="rm-nav-left">
        <NorthBrand />
        <span className="rm-nav-sep" aria-hidden="true" />
        <span className="rm-nav-page">{pageLabel}</span>
      </div>

      <div className="rm-nav-right">
        <Link href={changelogHref} className="rm-nbtn">
          <span className="rm-nbtn-long">Changelog</span>
          <span className="rm-nbtn-short" aria-hidden>
            Log
          </span>
        </Link>
        <a
          href={repoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rm-nbtn"
          aria-label="GitHub repository"
        >
          <IconGitHub aria-hidden />
          <span className="rm-nbtn-long">GitHub</span>
        </a>
        <a
          href={feedbackHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rm-nbtn red"
        >
          <IconPlus aria-hidden />
          <span className="rm-nbtn-long">Request Feature</span>
          <span className="rm-nbtn-short" aria-hidden>
            Request
          </span>
        </Link>
      </div>
    </nav>
  );
}
