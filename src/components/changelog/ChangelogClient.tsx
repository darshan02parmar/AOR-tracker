import { ChangelogHero } from "./ChangelogHero";
import { ChangelogSidebar } from "./ChangelogSidebar";
import { UnreleasedBlock } from "./UnreleasedBlock";
import { VersionBlock } from "./VersionBlock";
import type { ChangelogData } from "./data";

type Props = {
  data: ChangelogData;
};

/**
 * Top-level layout for the changelog page.
 *
 * Structure (the shared MarketingNav / MarketingFooter come from
 * src/app/(marketing)/layout.tsx, so they're not rendered here):
 *
 *   <ChangelogHero />
 *   ┌──── cl-layout ─────────────────────────────┐
 *   │  <ChangelogSidebar />        <body>        │
 *   │                              <Unreleased>  │
 *   │                              <VersionBlock>│ × N
 *   └────────────────────────────────────────────┘
 *
 * TODO(github-integration): no JS state today (everything renders from
 * static seed data). When versions come from the GitHub API a small client
 * component should be added here to (a) scroll-spy the sidebar and (b)
 * highlight the in-view version's link with `is-current`.
 */
export function ChangelogClient({ data }: Props) {
  const unreleasedTag = data.unreleased.badge.split(" ").pop()?.trim() ?? "";

  return (
    <div className="mkt-changelog-page">
      <ChangelogHero hero={data.hero} />

      <div className="cl-layout">
        <ChangelogSidebar versions={data.versions} unreleasedTag={unreleasedTag} />

        <div>
          <UnreleasedBlock data={data.unreleased} />
          {data.versions.map((v) => (
            <VersionBlock version={v} key={v.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
