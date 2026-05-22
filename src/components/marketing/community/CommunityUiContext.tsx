"use client";

import { createContext, useContext } from "react";
import type { ApprovedPost } from "./data";

export type ToastTone = "default" | "green" | "amber";

export type AppealContext = {
  milestoneLabel: string;
  day: string;
  cohortLabel: string;
  reason: string;
  daysRemaining: number;
};

export type CommunityFeedSort = "newest" | "helpful";

/** Marketing chip id; `null` = "All". */
export type CommunityMsFilter =
  | null
  | "ecopr"
  | "p1"
  | "p2"
  | "bil"
  | "bgc"
  | "medical";

/**
 * Shared UI surface for the community page's interactive bits.
 *
 * Owned by `CommunityShell` and consumed by the nav, sidebar, filter bar,
 * each feed card and the modal triggers. The shell holds the canonical feed
 * state (posts/page/total/filter) plus the viewer-email-derived auth state,
 * and exposes the small set of action dispatchers below.
 */
export type CommunityUi = {
  /** Real online-presence proxy (driven by Socket.IO connect/disconnect). */
  liveCount: number;
  /** `true` while the socket is connected; drives the "Live" pill. */
  socketLive: boolean;

  /* ─── auth ─── */
  /** sessionStorage email, hydrated on mount (null = anonymous). */
  viewerEmail: string | null;
  /** Convenience: `!!viewerEmail` AND a profile lookup succeeded. */
  isSignedIn: boolean;

  /* ─── feed state ─── */
  /** Adapted live posts (no own-pending/own-removed today). */
  posts: ApprovedPost[];
  page: number;
  totalPages: number;
  total: number;
  msFilter: CommunityMsFilter;
  searchQuery: string;
  sortBy: CommunityFeedSort;
  loading: boolean;

  /* ─── action dispatchers ─── */
  /** Open the Submit Milestone modal (or sign-in prompt if anonymous). */
  requestPost: () => void;
  /** Mark Helpful (optimistic). Anonymous viewers see the sign-in prompt. */
  requestHelpful: (postId: string) => void;
  /** Open the Reply modal targeting `post`. Anonymous → sign-in prompt. */
  requestReply: (post: ApprovedPost) => void;
  /** Re-fetch a specific page (filter-aware). */
  loadPage: (n: number) => void;
  /** Switch milestone filter and reload (keeps current page, clamped server-side). */
  setMsFilter: (ms: CommunityMsFilter) => void;
  /** Update search text (debounced re-fetch in shell). */
  setSearchQuery: (q: string) => void;
  /** Change sort order and reload page 1. */
  setSortBy: (sort: CommunityFeedSort) => void;

  /* ─── overlay dispatchers ─── */
  openSubmit: () => void;
  openAppeal: (ctx?: AppealContext) => void;
  toast: (message: string, tone?: ToastTone) => void;
};

const CommunityUiCtx = createContext<CommunityUi | null>(null);
CommunityUiCtx.displayName = "CommunityUiContext";

export const CommunityUiProvider = CommunityUiCtx.Provider;

export function useCommunityUi(): CommunityUi {
  const value = useContext(CommunityUiCtx);
  if (!value) {
    throw new Error(
      "useCommunityUi must be used inside <CommunityShell> (which provides CommunityUiContext)",
    );
  }
  return value;
}
