"use client";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { COMMUNITY_FEED_PAGE_SIZE } from "@/lib/community-feed";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
};

/** Compact page list with ellipses for long feeds. */
export function getVisiblePageNumbers(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  if (windowStart > 2) pages.push("ellipsis");
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
  if (windowEnd < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

/**
 * Numbered pager for the community feed (25 posts per server request).
 */
export function FeedPagination({
  page,
  totalPages,
  total,
  loading,
  onPageChange,
}: Props) {
  if (total <= 0) return null;

  const start = (page - 1) * COMMUNITY_FEED_PAGE_SIZE + 1;
  const end = Math.min(page * COMMUNITY_FEED_PAGE_SIZE, total);
  const pageNumbers = getVisiblePageNumbers(page, totalPages);
  const canPrev = page > 1 && !loading;
  const canNext = page < totalPages && !loading;

  return (
    <nav
      className="feed-pagination"
      aria-label="Community feed pages"
    >
      <p className="feed-pagination-summary">
        Showing{" "}
        <strong>
          {start.toLocaleString()}–{end.toLocaleString()}
        </strong>{" "}
        of <strong>{total.toLocaleString()}</strong> posts
        {totalPages > 1 ? (
          <>
            {" "}
            · Page <strong>{page}</strong> of{" "}
            <strong>{totalPages}</strong>
          </>
        ) : null}
      </p>

      {totalPages > 1 ? (
        <div className="feed-pagination-controls">
          <button
            type="button"
            className="feed-pagination-nav"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <FaChevronLeft aria-hidden />
            <span>Previous</span>
          </button>

          <ol className="feed-pagination-pages" role="list">
            {pageNumbers.map((item, idx) =>
              item === "ellipsis" ? (
                <li
                  key={`ellipsis-${idx}`}
                  className="feed-pagination-ellipsis"
                  aria-hidden
                >
                  …
                </li>
              ) : (
                <li key={item}>
                  <button
                    type="button"
                    className={`feed-pagination-page${
                      item === page ? " on" : ""
                    }`}
                    onClick={() => onPageChange(item)}
                    disabled={loading || item === page}
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? "page" : undefined}
                  >
                    {item}
                  </button>
                </li>
              ),
            )}
          </ol>

          <button
            type="button"
            className="feed-pagination-nav"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            aria-label="Next page"
          >
            <span>Next</span>
            <FaChevronRight aria-hidden />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
