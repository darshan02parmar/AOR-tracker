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
 * TODO: add a small client component for scroll-spy sidebar highlighting
 * (`is-current` on the in-view version link).
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
