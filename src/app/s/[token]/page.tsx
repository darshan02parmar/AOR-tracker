import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { getPublicSharePayloadAction } from "@/app/actions/share";
import { PublicShareDashboardPeek } from "@/components/share/PublicShareDashboardPeek";
import { WebsiteLogo } from "@/components/WebsiteLogo";
import { buildPageMetadata } from "@/lib/marketing-metadata";

import "@/styles/dashboard-v2.css";
import "@/styles/public-share.css";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const data = await getPublicSharePayloadAction(token);
  const path = `/s/${token}`;
  const baseMeta = {
    path,
    ogImage: "guide" as const,
    robots: { index: false, follow: true } as const,
  };
  if (!data) {
    return buildPageMetadata({
      ...baseMeta,
      title: "Shared timeline — AORTrack",
      description: "View a shared Canadian PR processing timeline on AORTrack.",
    });
  }
  return buildPageMetadata({
    ...baseMeta,
    title: `${data.displayName}'s PR timeline — AORTrack`,
    description:
      "Crowd-sourced PR milestone timeline on AORTrack — read-only shared view.",
  });
}

export default async function PublicShareTimelinePage({ params }: Props) {
  const { token } = await params;
  const data = await getPublicSharePayloadAction(token);
  if (!data) notFound();

  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <div className="mkt-public-share-shell dashboard-v2-page flex min-h-0 flex-1 flex-col">
        <nav className="dnb" aria-label="Shared timeline">
          <div className="dnb-l">
            <WebsiteLogo
              href="/"
              className="dnb-brand"
              size="sm"
              aria-label="AORTrack — home"
            />
            <div className="dnb-sep" aria-hidden />
            <div className="dnb-page">Shared view · {data.applicantId}</div>
          </div>
          <div className="dnb-r">
            <div className="dnb-pill" title="This link is view-only">
              <span className="dnb-dot" aria-hidden />
              Read-only
            </div>
            <Link href="/community" className="dnb-btn">
              Community
            </Link>
            <Link href="/track" className="dnb-btn red">
              Track your AOR
              <FaArrowRight aria-hidden className="inline" />
            </Link>
          </div>
        </nav>

        <main className="mkt-public-share-main">

          <PublicShareDashboardPeek data={data} />

          <p className="share-disclaimer">
            This is a read-only snapshot. Numbers use cohort models and may differ
            from IRCC processing times. Editing milestones requires signing in on
            your own dashboard — this link does not expose your email.
          </p>
          <div className="share-cta-row">
            <Link href="/track" className="share-cta share-cta--primary">
              Start tracking
              <FaArrowRight aria-hidden />
            </Link>
            <Link href="/" className="share-cta share-cta--ghost">
              Home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
