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

/** ISR: refresh roadmap from GitHub every 10 minutes. */
export const revalidate = 600;

/**
 * /roadmap — kanban board synced from GitHub org project #3.
 * Lives outside the (marketing) route group; uses its own RoadmapNav.
 */
export default async function RoadmapPage() {
  const data = await getRoadmap();

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
