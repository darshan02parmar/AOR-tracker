import Link from "next/link";
import { IconArrowRight, IconPlus } from "./roadmap-icons";

type Props = {
  feedbackHref: string;
  issuesHref: string;
};

/**
 * Dark navy CTA band that sits above the kanban   "Don't see what you need?"
 * with two CTAs (Request Feature, View GitHub Issues).
 */
export function RoadmapCtaBand({ feedbackHref, issuesHref }: Props) {
  return (
    <div className="rm-cta-band">
      <div className="rm-ctab-text">
        <h3>Don&apos;t see what you need?</h3>
        <p>
          Submit a feature request, bug, or data correction   no GitHub account
          required. We handle the issue creation automatically.
        </p>
      </div>
      <div className="rm-ctab-btns">
        <Link href={feedbackHref} className="rm-btn rm-btn-r">
          <IconPlus aria-hidden />
          Request Feature
        </Link>
        <a
          href={issuesHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rm-btn rm-btn-g"
        >
          View GitHub Issues
          <IconArrowRight aria-hidden />
        </a>
      </div>
    </div>
  );
}
