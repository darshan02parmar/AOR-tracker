"use client";

import { IconArrowRight, IconGitHub } from "./roadmap-icons";
import type { RoadmapFilterChip } from "./data";
import { useRoadmapUi } from "./RoadmapUiContext";

type Props = {
  filters: RoadmapFilterChip[];
  issuesHref: string;
};

/**
 * Sticky filter bar that sits below the stats. Chips read/write
 * `useRoadmapUi().filter`   the kanban subscribes to the same context to
 * decide which cards to render.
 */
export function RoadmapFilterBar({ filters, issuesHref }: Props) {
  const { filter, setFilter } = useRoadmapUi();

  return (
    <div className="rm-fbar">
      <div className="rm-fbar-inner">
        {filters.map((chip) => {
          const active = chip.id === filter;
          return (
            <button
              type="button"
              key={chip.id}
              className={`rm-chip${active ? " on" : ""}`}
              aria-pressed={active}
              onClick={() => setFilter(chip.id)}
            >
              {chip.dot ? (
                <span
                  className="rm-chip-dot"
                  style={{ background: chip.dot }}
                  aria-hidden="true"
                />
              ) : null}
              {chip.label}
            </button>
          );
        })}

        <div className="rm-fbar-spacer" />

        <a
          href={issuesHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rm-gh-link"
        >
          <IconGitHub aria-hidden />
          All issues on GitHub
          <IconArrowRight aria-hidden />
        </a>
      </div>
    </div>
  );
}
