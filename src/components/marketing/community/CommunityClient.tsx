import { CommunityFeed } from "./CommunityFeed";
import { CommunityLeftSidebar } from "./CommunityLeftSidebar";
import { CommunityRightPanel } from "./CommunityRightPanel";
import type { CommunityPageData } from "./data";

type Props = {
  data: CommunityPageData;
};

/**
 * Body of the community page. Three columns on desktop; below the `cm-layout`
 * breakpoint the feed stays first and the left/right rails stack beneath it
 * (see `community.css`).
 * The page-level wrapper (`.mkt-community-page`) and the community-specific
 * top nav live in `src/app/community/page.tsx` — this component only renders
 * the layout grid.
 *
 * Posts and pagination state live in `CommunityShell` via
 * `useCommunityUi()`; the sidebar / feed / right-panel pull whatever they
 * need from the context. `data` is the SSR-built `CommunityPageData`
 * (used for the still-seeded surfaces: insights, pulse, contributors,
 * discord card, filter labels, etc.).
 */
export function CommunityClient({ data }: Props) {
  return (
    <div className="cm-layout">
      <CommunityLeftSidebar
        cohortMini={data.cohortMini}
        browseLinks={data.browseLinks}
        milestoneLinks={data.milestoneLinks}
        quickLinks={data.quickLinks}
      />

      <CommunityFeed
        filterChips={data.filterChips}
        sortOptions={data.sortOptions}
        defaultSort={data.defaultSort}
        submitCta={data.submitCta}
      />

      {/* <CommunityRightPanel
        insights={data.insights}
        pulse={data.pulse}
        contributors={data.contributors}
        discord={data.discord}
      /> */}
    </div>
  );
}
