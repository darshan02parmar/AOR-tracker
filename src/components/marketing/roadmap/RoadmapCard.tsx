"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconArrowRight,
  IconCheck,
  VoteChevron,
} from "./roadmap-icons";
import { useRoadmapUi } from "./RoadmapUiContext";
import type {
  RoadmapAvatarTone,
  RoadmapCard as RoadmapCardData,
  RoadmapCategory,
} from "./data";

type Props = {
  card: RoadmapCardData;
  issueUrl: string;
  changelogHref: string;
};

const CATEGORY_LABEL: Record<RoadmapCategory, string> = {
  feat: "feature",
  bug: "bug",
  data: "data",
  seo: "SEO",
  sec: "security",
  perf: "performance",
  ux: "UX",
};

const PRIORITY_CLASS: Record<RoadmapCardData["priority"], string> = {
  high: "pri-h",
  medium: "pri-m",
  low: "pri-l",
};

const AVATAR_CLASS: Record<RoadmapAvatarTone, string> = {
  blue: "av-blue",
  green: "av-green",
  amber: "av-amber",
  purple: "av-purple",
  red: "av-red",
  navy: "av-navy",
};

/**
 * Single kanban card. The card itself is a `role=button` div   clicking
 * anywhere outside the embedded vote/changelog controls opens the
 * GitHub issue (or `linkOverride`, e.g. /changelog for shipped items).
 *
 * Nested buttons are real `<button>` elements with `stopPropagation` so
 * upvoting / following the changelog link doesn't also open the issue.
 */
export function RoadmapCard({ card, issueUrl, changelogHref }: Props) {
  const router = useRouter();
  const { votedSet, toggleVote } = useRoadmapUi();
  const voted = votedSet.has(card.issue);

  const statusClass =
    card.status === "in-progress"
      ? "prog"
      : card.status === "done"
        ? "done"
        : "";
  const priorityClass = PRIORITY_CLASS[card.priority];
  const isDone = card.status === "done";
  const isInProgress = card.status === "in-progress";

  const openTarget = () => {
    const target = card.linkOverride ?? issueUrl;
    if (target.startsWith("/")) {
      router.push(target);
    } else if (typeof window !== "undefined") {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  // Animate the progress fill from 0 → target on mount (mirrors the
  // sample's `setTimeout(() => el.style.width = data-w + '%', 400)`).
  const [fillWidth, setFillWidth] = useState(0);
  useEffect(() => {
    if (!isInProgress || typeof card.progress !== "number") return;
    const t = window.setTimeout(() => setFillWidth(card.progress ?? 0), 400);
    return () => window.clearTimeout(t);
  }, [isInProgress, card.progress]);

  const computedVotes =
    card.votes +
    (voted && !card.voted ? 1 : 0) +
    (!voted && card.voted ? -1 : 0);

  const onCardKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openTarget();
    }
  };

  return (
    <div
      className={`rm-rc ${statusClass} ${priorityClass}`.trim()}
      onClick={openTarget}
      onKeyDown={onCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open issue #${card.issue}: ${card.title}`}
    >
      <div className="rm-rc-top">
        <div className="rm-rc-title">{card.title}</div>
        <div className="rm-rc-num">
          #{card.issue}
          {card.shippedVersion ? ` · ${card.shippedVersion}` : ""}
        </div>
      </div>

      {card.categories.length > 0 && (
        <div className="rm-rc-tags">
          {card.categories.map((c) => (
            <span className={`rm-tag t-${c}`} key={c}>
              {CATEGORY_LABEL[c]}
            </span>
          ))}
        </div>
      )}

      <div className="rm-rc-desc">{card.description}</div>

      {isInProgress && typeof card.progress === "number" && (
        <div className="rm-prog-wrap">
          <div className="rm-rp-label">
            <span>Progress</span>
            <span>{card.progress}%</span>
          </div>
          <div className="rm-rp-track">
            <div
              className="rm-rp-fill"
              style={{ width: `${fillWidth}%` }}
            />
          </div>
        </div>
      )}

      {card.note && (
        <div className="rm-rc-note">
          <IconArrowRight aria-hidden />
          <span>{card.note}</span>
        </div>
      )}

      <div
        className="rm-rc-foot"
        style={isInProgress ? { marginTop: 9 } : undefined}
      >
        {isDone ? (
          <>
            <div className="rm-shipped-tag">
              <IconCheck aria-hidden />
              {card.shippedAt}
            </div>
            <Link
              href={changelogHref}
              className="rm-changelog-link"
              onClick={(e) => e.stopPropagation()}
            >
              Changelog
              <IconArrowRight aria-hidden />
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`rm-vote-btn${voted ? " voted" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleVote(card.issue);
              }}
              aria-pressed={voted}
              aria-label={`Upvote #${card.issue}`}
            >
              <VoteChevron />
              <span>{computedVotes}</span>
            </button>

            {card.assignee && (
              <div className="rm-rc-meta">
                <span
                  className={`rm-avatar ${AVATAR_CLASS[card.assignee.tone]}`}
                  aria-hidden="true"
                >
                  {card.assignee.initials}
                </span>
                {card.assignee.handle && (
                  <span className="rm-rc-handle">{card.assignee.handle}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
