import "@/styles/marketing-core.css";
import "@/styles/roadmap.css";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { getRoadmap } from "@/components/marketing/roadmap/data";
import { RoadmapCtaBand } from "@/components/marketing/roadmap/RoadmapCtaBand";
import { RoadmapFilterBar } from "@/components/marketing/roadmap/RoadmapFilterBar";
import { RoadmapHero } from "@/components/marketing/roadmap/RoadmapHero";
import { RoadmapKanban } from "@/components/marketing/roadmap/RoadmapKanban";
import { RoadmapMilestones } from "@/components/marketing/roadmap/RoadmapMilestones";
import { RoadmapNav } from "@/components/marketing/roadmap/RoadmapNav";
import { RoadmapShell } from "@/components/marketing/roadmap/RoadmapShell";
import { RoadmapStatsBar } from "@/components/marketing/roadmap/RoadmapStatsBar";
import { buildPageMetadata } from "@/lib/marketing-metadata";

export const metadata = buildPageMetadata({
  title: "Public Roadmap   AORTrack | Canadian PR Tracker",
  description:
    "See what the AORTrack community is building next. Vote on features, claim issues, and track our progress in the open.",
  path: "/roadmap",
  ogImage: "home",
  openGraphTitle: "Public Roadmap   AORTrack",
  openGraphDescription:
    "Community-driven backlog. Vote on what matters, claim issues, ship code.",
});

/**
 * /roadmap
 *
 * Lives OUTSIDE the (marketing) route group on purpose   the roadmap page
 * has its own top nav (RoadmapNav) mirroring the sample HTML, distinct from
 * the shared MarketingNav used on /, /changelog, /track, etc.
 *
 * The page still reuses the shared `MarketingFooter`. To keep the footer
 * styled we wrap the page in `.marketing-site` and pull in
 * `marketing-core.css`, which is where the footer's CSS variables and rules
 * live.
 *
 * `RoadmapShell` is the client wrapper that owns:
 *   - active filter chip,
 *   - voted-issue set + vote/unvote handler,
 *   - the auto-dismissing toast queue.
 *
 * The static body (nav, hero, stats, CTA band, milestones) is rendered
 * server-side; only the filter bar, kanban, and toaster need to live on
 * the client.
 *
 * TODO(github-projects-integration): the page is currently fed by static
 * seed data (see `src/components/marketing/roadmap/data.ts`). When we wire
 * it to the GitHub Projects v2 GraphQL API:
 *   - make `getRoadmap()` async,
 *   - convert this component to `export default async function RoadmapPage()`,
 *   - add `export const revalidate = 600;` for ISR so the board picks up
 *     new issues / Project board moves on a 10-minute cadence.
 */
export default function RoadmapPage() {
  const data = getRoadmap();

  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <div className="mkt-roadmap-page flex min-h-0 flex-1 flex-col">
        <RoadmapShell data={data}>
          <RoadmapNav
            changelogHref={data.links.changelog}
            repoHref={data.links.repo}
            feedbackHref={data.links.feedback}
          />
          <RoadmapHero hero={data.hero} />
          <RoadmapStatsBar stats={data.stats} />
          <RoadmapFilterBar filters={data.filters} issuesHref={data.links.issues} />
          <div className="rm-main">
            <RoadmapCtaBand
              feedbackHref={data.links.feedback}
              issuesHref={data.links.issues}
            />
            <RoadmapKanban data={data} />
            <RoadmapMilestones milestones={data.milestones} />
          </div>
        </RoadmapShell>
      </div>
      <MarketingFooter />
    </div>
  );
}
