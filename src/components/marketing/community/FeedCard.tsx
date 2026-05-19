"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { AppealLinkButton } from "./AppealLinkButton";
import {
  IconPending,
  IconRemoved,
  MilestoneIcon,
} from "./community-icons";
import { FeedCardEngagement } from "./FeedCardEngagement";
import { MiniTimeline } from "./MiniTimeline";
import type {
  CohortItem,
  MilestoneChipColor,
  Post,
  Reply,
} from "./data";

type Props = {
  post: Post;
  /** When true, adds the slide-down `.new-entry` animation class. */
  newEntry?: boolean;
};

function CohortRow({ items }: { items: CohortItem[] }) {
  return (
    <div className="fc-cohort">
      {items.map((item, idx) => (
        <div className="fcc-item" key={`${item.label}-${idx}`}>
          <div className="fcc-label">{item.label}</div>
          <div className={`fcc-val${item.emphasis ? ` ${item.emphasis}` : ""}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetaRow({
  displayId,
  milestoneChip,
  stream,
  timestamp,
  geminiVerified,
  removedBadge,
}: {
  displayId: string;
  milestoneChip: { label: string; color: MilestoneChipColor };
  stream?: string;
  timestamp: string;
  geminiVerified?: boolean;
  removedBadge?: boolean;
}) {
  return (
    <div className="fc-header">
      <div className="fc-meta">
        <div className="fc-id">{displayId}</div>
        <div className={`fc-milestone ms-${milestoneChip.color}`}>
          <MilestoneIcon milestone={milestoneChip.color} />
          {milestoneChip.label}
        </div>
        {stream ? <div className="fc-stream">{stream}</div> : null}
        {geminiVerified ? (
          <div className="fc-mod-badge mod-soft">Gemini Verified</div>
        ) : null}
        {removedBadge ? (
          <div className="fc-mod-badge mod-removed">Removed</div>
        ) : null}
      </div>
      <div className="fc-ts">{timestamp}</div>
    </div>
  );
}

function RepliesList({ replies }: { replies: Reply[] }) {
  return (
    <div className="replies-list" role="list">
      {replies.map((reply) => (
        <div className="reply-item" key={reply.id} role="listitem">
          <div
            className="reply-avatar"
            style={{ background: reply.avatarColor }}
            aria-hidden
          >
            {reply.avatarLabel}
          </div>
          <div className="reply-bd">
            <div className="reply-name-row">
              <span className="reply-name">{reply.authorId}</span>
              {reply.timestamp ? (
                <span className="reply-ts">{reply.timestamp}</span>
              ) : null}
            </div>
            <div className="reply-text">{reply.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RepliesSection({
  replies,
  replyCount,
}: {
  replies: Reply[];
  replyCount: number;
}) {
  const [open, setOpen] = useState(false);
  if (replyCount <= 0) return null;

  const label = replyCount === 1 ? "1 reply" : `${replyCount} replies`;

  return (
    <section className="fc-replies" aria-label="Replies">
      <button
        type="button"
        className="fc-replies-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <FaChevronDown
          className={`fc-replies-chevron${open ? " is-open" : ""}`}
          aria-hidden
        />
        <span>
          {open ? "Hide" : "View"} {label}
        </span>
      </button>
      {open ? <RepliesList replies={replies} /> : null}
    </section>
  );
}

/**
 * Single feed card. Handles the three rendering variants:
 *   - approved   : standard public post
 *   - ownPending : amber banner + post body (visible to author only IRL)
 *   - ownRemoved : red banner + greyed-out body + appeal CTA
 */
export function FeedCard({ post, newEntry }: Props) {
  // ─── Own pending ─────────────────────────────────────────────
  if (post.kind === "ownPending") {
    return (
      <div className="feed-card own-pending" id={post.id}>
        <div className="own-pending-label">
          <IconPending aria-hidden />
          <span>{post.pendingMessage}</span>
        </div>
        <div className={`fc-accent accent-${post.accent}`} />
        <div className="fc-inner">
          <MetaRow
            displayId={post.displayId}
            milestoneChip={post.milestoneChip}
            stream={post.stream}
            timestamp={post.timestamp}
          />
          <CohortRow items={post.cohort} />
          <div
            className="fc-body"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
          />
        </div>
      </div>
    );
  }

  // ─── Own removed ─────────────────────────────────────────────
  if (post.kind === "ownRemoved") {
    const cohortLabel = post.cohort
      .map((item) => item.value)
      .filter(Boolean)
      .join(" · ");
    return (
      <div className="feed-card own-removed" id={post.id}>
        <div className="removed-label">
          <IconRemoved aria-hidden />
          <div>
            <strong>{post.removedTitle}</strong>
            {post.removedReason}
            <AppealLinkButton
              daysRemaining={post.appealDaysRemaining}
              context={{
                milestoneLabel: post.milestoneChip.label,
                day: post.cohort[0]?.value ?? "",
                cohortLabel,
                reason: post.removedReason,
                daysRemaining: post.appealDaysRemaining,
              }}
            />
          </div>
        </div>
        <div className={`fc-accent accent-${post.accent}`} />
        <div className="fc-inner" style={{ opacity: 0.6 }}>
          <MetaRow
            displayId={post.displayId}
            milestoneChip={post.milestoneChip}
            timestamp={post.timestamp}
            removedBadge
          />
          <CohortRow items={post.cohort} />
          <div
            className="fc-body"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
          />
        </div>
      </div>
    );
  }

  // ─── Approved (default) ──────────────────────────────────────
  const replies = post.replies ?? [];

  return (
    <div
      className={`feed-card${newEntry ? " new-entry" : ""}`}
      id={post.id}
    >
      <div className={`fc-accent accent-${post.accent}`} />
      <div className="fc-inner">
        <MetaRow
          displayId={post.displayId}
          milestoneChip={post.milestoneChip}
          stream={post.stream}
          timestamp={post.timestamp}
          geminiVerified={post.geminiVerified}
        />
        <CohortRow items={post.cohort} />
        {post.timeline ? <MiniTimeline dots={post.timeline} /> : null}
        <div
          className="fc-body"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />
        <FeedCardEngagement
          post={post}
          helpfulCount={post.helpfulCount}
          helpfulActive={post.helpfulActive}
          replyCount={post.replyCount}
          dataSource={post.dataSource}
        />
      </div>
      <RepliesSection replies={replies} replyCount={post.replyCount} />
    </div>
  );
}
