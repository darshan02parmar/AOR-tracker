"use client";

import { FaSearch } from "react-icons/fa";
import {
  useCommunityUi,
  type CommunityFeedSort,
  type CommunityMsFilter,
} from "./CommunityUiContext";
import type { FilterChip, SortOption } from "./data";

type Props = {
  chips: FilterChip[];
  sortOptions: SortOption[];
  defaultSort: string;
};

/** Chip ids in `data.filterChips` ↔ context msFilter values. */
const CHIP_TO_MS: Record<string, CommunityMsFilter> = {
  all: null,
  ecopr: "ecopr",
  p1: "p1",
  p2: "p2",
  bil: "bil",
  bgc: "bgc",
  medical: "medical",
};

/**
 * Top filter row: milestone chips, search, and sort re-fetch via
 * `CommunityShell` (server-backed, 25 posts per page). Milestone filters keep
 * the current page; search and sort reset to page 1.
 */
export function CommunityFilterBar({
  chips,
  sortOptions,
  defaultSort,
}: Props) {
  const {
    msFilter,
    setMsFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading,
  } = useCommunityUi();

  return (
    <div className="filter-bar">
      <div
        className="filter-chips"
        role="tablist"
        aria-label="Milestone filters"
      >
        {chips.map((chip) => {
          const ms = CHIP_TO_MS[chip.id] ?? null;
          const active = ms === msFilter;
          return (
            <button
              type="button"
              key={chip.id}
              className={`chip${active ? " on" : ""}`}
              role="tab"
              aria-selected={active}
              onClick={() => setMsFilter(ms)}
              disabled={loading}
            >
              {chip.dotColor ? (
                <span
                  className="chip-dot"
                  style={{ background: chip.dotColor }}
                  aria-hidden
                />
              ) : null}
              <span>{chip.label}</span>
              {chip.count != null ? (
                <span className="chip-n">{chip.count.toLocaleString()}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <label className="search-wrap">
        <FaSearch className="search-icon" aria-hidden />
        <input
          className="search-input"
          type="search"
          placeholder="Search posts…"
          aria-label="Search community posts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
      </label>

      <select
        className="sort-select"
        value={sortBy}
        aria-label="Sort posts"
        disabled={loading}
        onChange={(e) => setSortBy(e.target.value as CommunityFeedSort)}
      >
        {sortOptions.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
