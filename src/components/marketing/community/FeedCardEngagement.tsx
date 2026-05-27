"use client";

import { FaRegCommentDots, FaRegThumbsUp } from "react-icons/fa";
import { useCommunityUi } from "./CommunityUiContext";
import type { ApprovedPost } from "./data";

type Props = {
  /** Full parent post   needed so `requestReply` can pass it to ReplyModal. */
  post: ApprovedPost;
  helpfulCount: number;
  helpfulActive?: boolean;
  replyCount: number;
  dataSource?: string;
};

/**
 * Engagement row. Helpful + Reply go through `useCommunityUi()` so the
 * shell can apply auth gating (SignInPromptModal) before invoking the
 * server actions.
 */
export function FeedCardEngagement({
  post,
  helpfulCount,
  helpfulActive,
  replyCount,
  dataSource,
}: Props) {
  const { requestHelpful, requestReply } = useCommunityUi();

  return (
    <div className="fc-footer">
      <button
        type="button"
        className={`eng-btn${helpfulActive ? " active" : ""}`}
        aria-pressed={helpfulActive ?? false}
        aria-label={`Mark helpful   ${helpfulCount} so far`}
        onClick={() => requestHelpful(post.id)}
      >
        <FaRegThumbsUp aria-hidden />
        Helpful <span>{helpfulCount}</span>
      </button>
      <div className="eng-sep" />
      <button
        type="button"
        className="eng-btn"
        aria-label={`Reply   ${replyCount} so far`}
        onClick={() => requestReply(post)}
      >
        <FaRegCommentDots aria-hidden />
        Reply <span>{replyCount}</span>
      </button>
      {dataSource ? (
        <div className="fc-footer-right">
          <div className="data-src">{dataSource}</div>
        </div>
      ) : null}
    </div>
  );
}
