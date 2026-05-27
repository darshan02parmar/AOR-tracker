"use client";

type Props = {
  /** Total posts from the last feed load the user is viewing. */
  currentTotal: number;
  /**
   * Polled server total for the same filter. When greater than `currentTotal`,
   * the bar shows the difference and offers to refresh.
   */
  serverTotal: number | null;
  /** Click handler that reloads the feed and clears the pending state. */
  onLoad: () => void;
};

/**
 * Fixed pill at the top of the viewport when the server has more posts than
 * the client last loaded (same filters). Hidden when counts match.
 */
export function NewPostBar({ currentTotal, serverTotal, onLoad }: Props) {
  const newCount =
    serverTotal != null && serverTotal > currentTotal
      ? serverTotal - currentTotal
      : 0;
  const isVisible = newCount > 0;
  const label = `${newCount} new post${newCount > 1 ? "s" : ""}   click to load`;

  if (!isVisible) return null;

  return (
    <button
      type="button"
      className="new-post-bar show"
      onClick={onLoad}
      aria-live="polite"
    >
      <span className="dot" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
