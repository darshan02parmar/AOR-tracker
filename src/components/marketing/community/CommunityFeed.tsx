"use client";

import { CommunityFilterBar } from "./CommunityFilterBar";
import { FeedPagination } from "./FeedPagination";
import { useCommunityUi } from "./CommunityUiContext";
import { FeedCard } from "./FeedCard";
import { SubmitCtaCard } from "./SubmitCtaCard";
import type { CommunityPageData } from "./data";

type Props = {
  filterChips: CommunityPageData["filterChips"];
  sortOptions: CommunityPageData["sortOptions"];
  defaultSort: string;
  submitCta: CommunityPageData["submitCta"];
};

/**
 * Middle column: filter bar + submit CTA card + posts + numbered pagination.
 *
 * Posts and pagination state come from `useCommunityUi()` — the shell owns
 * the canonical list (25 per request), refetches on filter/page change, and
 * broadcasts Socket.IO `feed:refresh` events via the NewPostBar.
 */
export function CommunityFeed({
  filterChips,
  sortOptions,
  defaultSort,
  submitCta,
}: Props) {
  const { posts, page, totalPages, total, loading, loadPage } =
    useCommunityUi();

  return (
    <div className="feed-main">
      <CommunityFilterBar
        chips={filterChips}
        sortOptions={sortOptions}
        defaultSort={defaultSort}
      />

      <div
        className={`feed-list${loading ? " is-loading" : ""}`}
        id="feed-list"
        aria-busy={loading}
      >
        <SubmitCtaCard cta={submitCta} />

        {posts.length === 0 && !loading ? (
          <div
            className="feed-empty"
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.9rem",
            }}
          >
            No posts match this filter yet — be the first to share!
          </div>
        ) : null}

        {posts.map((post) => (
          <FeedCard post={post} key={post.id} />
        ))}

        <FeedPagination
          page={page}
          totalPages={totalPages}
          total={total}
          loading={loading}
          onPageChange={loadPage}
        />
      </div>
    </div>
  );
}
