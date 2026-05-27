"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ROADMAP_STATUSES,
  type RoadmapCard as RoadmapCardData,
  type RoadmapData,
} from "./data";
import { ColumnIcon, IconArrowRight } from "./roadmap-icons";
import { RoadmapCard } from "./RoadmapCard";
import { useRoadmapUi } from "./RoadmapUiContext";

type Props = {
  data: RoadmapData;
};

/**
 * 3-column kanban (Planned · In Progress · Done). Subscribes to
 * `useRoadmapUi().filter` so changing the chip in `RoadmapFilterBar` instantly
 * filters all visible cards by category.
 *
 * Note: filter narrowing applies to ALL columns, including Done   matching
 * the sample HTML's behaviour of filtering the whole board.
 */
export function RoadmapKanban({ data }: Props) {
  const { filter } = useRoadmapUi();

  const byStatus = useMemo(() => {
    const filtered =
      filter === "all"
        ? data.cards
        : data.cards.filter((c) => c.categories.includes(filter));
    const grouped: Record<string, RoadmapCardData[]> = {
      planned: [],
      "in-progress": [],
      done: [],
    };
    for (const card of filtered) {
      grouped[card.status]?.push(card);
    }
    return grouped;
  }, [data.cards, filter]);

  return (
    <div className="rm-kanban">
      {ROADMAP_STATUSES.map((col) => {
        const cards = byStatus[col.id] ?? [];
        return (
          <div key={col.id}>
            <div className="rm-col-head">
              <span className="rm-col-icon">
                <ColumnIcon status={col.id} />
              </span>
              <h2 className="rm-col-h2">{col.title}</h2>
              <span className={`rm-col-badge ${col.badgeClass}`}>
                {col.countLabel(cards.length)}
              </span>
            </div>
            <div className={`rm-col-bar ${col.barClass}`} />

            {cards.length === 0 ? (
              <div className="rm-empty">No items match this filter.</div>
            ) : (
              cards.map((card) => (
                <RoadmapCard
                  key={card.issue}
                  card={card}
                  issueUrl={`${data.links.issueBase}/${card.issue}`}
                  changelogHref={data.links.changelog}
                />
              ))
            )}

            {col.id === "done" && cards.length > 0 && (
              <div className="rm-col-foot">
                <Link href={data.links.changelog}>
                  View full changelog
                  <IconArrowRight aria-hidden />
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
