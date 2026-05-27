"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  getCommunityFeedAction,
  markCommunityHelpfulAction,
} from "@/app/actions/community";
import { getProfileAction } from "@/app/actions/profile";
import { COMMUNITY_FEED_PAGE_SIZE } from "@/lib/community-feed";
import { readSessionEmail } from "@/lib/session-client";
import type { UserProfile } from "@/lib/types";
import { AppealModal } from "./AppealModal";
import { communityPostToApproved } from "./adapter";
import {
  CommunityUiProvider,
  type AppealContext,
  type CommunityFeedSort,
  type CommunityMsFilter,
  type CommunityUi,
  type ToastTone,
} from "./CommunityUiContext";
import { CommunityToaster, type ToastItem } from "./CommunityToaster";
import type { ApprovedPost, CommunityPageData } from "./data";
import { NewPostBar } from "./NewPostBar";
import { ReplyModal } from "./ReplyModal";
import { SignInPromptModal } from "./SignInPromptModal";
import { SubmitMilestoneModal } from "./SubmitMilestoneModal";

/** Marketing chip → backend `ms`. `null` = no filter (all posts). */
const FILTER_TO_MS: Record<NonNullable<CommunityMsFilter>, string> = {
  ecopr: "ecopr",
  p1: "p1",
  p2: "p2",
  bil: "bil",
  bgc: "bg",
  medical: "med",
};

const FEED_REFRESH_DEBOUNCE_MS = 280;
const TOAST_MS = 3500;

type Props = {
  data: CommunityPageData;
  initialMsFilter: CommunityMsFilter;
  initialPage: number;
  initialTotal: number;
  initialTotalPages: number;
  children: React.ReactNode;
};

type GatedAction = "post" | "mark helpful" | "reply";

/**
 * Top-level client wrapper for `/community`.
 *
 * Owns:
 *   - viewer-email hydration (from sessionStorage) + profile fetch
 *   - Socket.IO `feed:refresh` → debounced auto refetch (bar is offline fallback)
 *   - live feed state (posts/page/total/msFilter/loading) + re-fetch on
 *     filter / page change
 *   - sign-in prompt overlay for gated actions
 *   - submit / reply modals (wired to real server actions)
 *   - toast queue + AppealModal (still simulated; moderation pipeline TODO)
 *
 * Only the live-only `ApprovedPost[]` flows through the new feed state; the
 * seeded `ownPending`/`ownRemoved` cards still live on `data.posts` and are
 * rendered by `CommunityFeed` from the initial server payload.
 */
export function CommunityShell({
  data,
  initialMsFilter,
  initialPage,
  initialTotal,
  initialTotalPages,
  children,
}: Props) {
  /* ─── auth ─── */
  const [viewerEmail, setViewerEmail] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [viewerProfile, setViewerProfile] = useState<UserProfile | null>(null);

  /* ─── feed state ─── */
  const initialApproved = useMemo<ApprovedPost[]>(
    () =>
      data.posts.filter(
        (p): p is ApprovedPost => p.kind === "approved",
      ),
    [data.posts],
  );
  const [posts, setPosts] = useState<ApprovedPost[]>(initialApproved);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [msFilter, setMsFilterState] =
    useState<CommunityMsFilter>(initialMsFilter);
  const [searchQuery, setSearchQueryState] = useState("");
  const [sortBy, setSortByState] = useState<CommunityFeedSort>("newest");
  const [loading, setLoading] = useState(false);

  /* ─── socket / live signals ─── */
  const [liveCount, setLiveCount] = useState(data.liveCount);
  const [socketLive, setSocketLive] = useState(false);
  /** Polled feed total when server count exceeds `total` (see NewPostBar). */
  const [aheadTotal, setAheadTotal] = useState<number | null>(null);

  /* ─── overlays ─── */
  const [submitOpen, setSubmitOpen] = useState(false);
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealContext, setAppealContext] = useState<AppealContext | null>(
    null,
  );
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ApprovedPost | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInAction, setSignInAction] = useState<GatedAction>("post");
  const [toast, setToast] = useState<ToastItem | null>(null);
  const toastIdRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);
  const feedRefreshTimerRef = useRef<number | null>(null);
  const socketLiveRef = useRef(false);

  /* ─── refs mirroring state for socket / event handlers ─── */
  const pageRef = useRef(page);
  const totalRef = useRef(total);
  const msFilterRef = useRef(msFilter);
  const searchQueryRef = useRef(searchQuery);
  const sortByRef = useRef(sortBy);
  const viewerEmailRef = useRef(viewerEmail);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    totalRef.current = total;
  }, [total]);
  useEffect(() => {
    msFilterRef.current = msFilter;
  }, [msFilter]);
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);
  useEffect(() => {
    viewerEmailRef.current = viewerEmail;
  }, [viewerEmail]);

  /* ─── toast helper ─── */
  const showToast = useCallback(
    (message: string, tone: ToastTone = "default") => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastIdRef.current += 1;
      setToast({ id: toastIdRef.current, message, tone });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, TOAST_MS);
    },
    [],
  );

  /* ─── core re-fetch ─── */
  const fetchPage = useCallback(
    async (
      pageNum: number,
      filter: CommunityMsFilter,
      search: string,
      sort: CommunityFeedSort,
    ) => {
      setLoading(true);
      setAheadTotal(null);
      setPage(pageNum);
      try {
        const ms = filter ? FILTER_TO_MS[filter] : null;
        const result = await getCommunityFeedAction(
          viewerEmailRef.current,
          {
            page: pageNum,
            pageSize: COMMUNITY_FEED_PAGE_SIZE,
            msFilter: ms,
            searchQuery: search.trim() || null,
            sortBy: sort,
          },
        );
        setPosts(result.posts.map((p) => communityPostToApproved(p)));
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const scrollFeedToTop = useCallback(() => {
    document
      .querySelector<HTMLElement>(".mkt-community-page .feed-main")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ─── hydrate viewer email + profile on mount ─── */
  useEffect(() => {
    const em = readSessionEmail();
    if (!em) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      setViewerEmail(em);
      void (async () => {
        const r = await getProfileAction(em);
        if (cancelled) return;
        setIsSignedIn(r.ok);
        setViewerProfile(r.ok ? r.profile : null);
      })();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  /* Refresh profile when opening Submit Milestone so dates match dashboard. */
  useEffect(() => {
    if (!submitOpen || !viewerEmail) return;
    let cancelled = false;
    void getProfileAction(viewerEmail).then((r) => {
      if (cancelled) return;
      if (r.ok) setViewerProfile(r.profile);
    });
    return () => {
      cancelled = true;
    };
  }, [submitOpen, viewerEmail]);

  /* When the email becomes known, re-fetch with the viewer header so
     `viewerHasMarkedHelpful` is accurate. */
  useEffect(() => {
    if (!viewerEmail) return;
    void fetchPage(
      pageRef.current,
      msFilterRef.current,
      searchQueryRef.current,
      sortByRef.current,
    );
  }, [viewerEmail, fetchPage]);

  /** Poll server total; show NewPostBar when it exceeds the loaded feed total. */
  const checkForNewPosts = useCallback(async () => {
    const ms = msFilterRef.current ? FILTER_TO_MS[msFilterRef.current] : null;
    const result = await getCommunityFeedAction(viewerEmailRef.current, {
      page: 1,
      pageSize: 1,
      msFilter: ms,
      searchQuery: searchQueryRef.current.trim() || null,
      sortBy: sortByRef.current,
    });
    if (result.total > totalRef.current) {
      setAheadTotal(result.total);
    } else {
      setAheadTotal(null);
    }
  }, []);

  const scheduleNewPostCheck = useCallback(() => {
    if (feedRefreshTimerRef.current !== null) {
      window.clearTimeout(feedRefreshTimerRef.current);
    }
    feedRefreshTimerRef.current = window.setTimeout(() => {
      feedRefreshTimerRef.current = null;
      void checkForNewPosts();
    }, FEED_REFRESH_DEBOUNCE_MS);
  }, [checkForNewPosts]);

  /** Re-fetch feed; new top-level posts use page 1, replies keep the current page. */
  const refreshFeed = useCallback(
    (opts?: { goToFirstPage?: boolean }) => {
      setAheadTotal(null);
      const pageNum = opts?.goToFirstPage ? 1 : pageRef.current;
      void fetchPage(
        pageNum,
        msFilterRef.current,
        searchQueryRef.current,
        sortByRef.current,
      );
    },
    [fetchPage],
  );

  const scheduleFeedRefresh = useCallback(
    (opts?: { goToFirstPage?: boolean }) => {
      if (feedRefreshTimerRef.current !== null) {
        window.clearTimeout(feedRefreshTimerRef.current);
      }
      feedRefreshTimerRef.current = window.setTimeout(() => {
        feedRefreshTimerRef.current = null;
        refreshFeed(opts);
        setLiveCount((c) => c + 1);
      }, FEED_REFRESH_DEBOUNCE_MS);
    },
    [refreshFeed],
  );

  const loadNewPosts = useCallback(() => {
    refreshFeed({ goToFirstPage: true });
  }, [refreshFeed]);

  /* ─── Socket.IO ─── */
  useEffect(() => {
    const socket: Socket = io({
      path: "/socket.io",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => {
      socketLiveRef.current = true;
      setSocketLive(true);
    });
    socket.on("disconnect", () => {
      socketLiveRef.current = false;
      setSocketLive(false);
    });
    socket.on("connect_error", () => {
      socketLiveRef.current = false;
      setSocketLive(false);
    });
    socket.on("feed:refresh", () => {
      scheduleNewPostCheck();
    });
    return () => {
      if (feedRefreshTimerRef.current !== null) {
        window.clearTimeout(feedRefreshTimerRef.current);
      }
      socket.disconnect();
    };
  }, [scheduleNewPostCheck]);

  /* ─── action dispatchers ─── */
  const requireSignedIn = useCallback(
    (action: GatedAction): boolean => {
      if (viewerEmail && isSignedIn) return true;
      setSignInAction(action);
      setSignInOpen(true);
      return false;
    },
    [viewerEmail, isSignedIn],
  );

  const requestPost = useCallback(() => {
    if (!requireSignedIn("post")) return;
    setSubmitOpen(true);
  }, [requireSignedIn]);

  const requestReply = useCallback(
    (post: ApprovedPost) => {
      if (!requireSignedIn("reply")) return;
      setReplyTarget(post);
      setReplyOpen(true);
    },
    [requireSignedIn],
  );

  const requestHelpful = useCallback(
    (postId: string) => {
      if (!requireSignedIn("mark helpful")) return;
      const email = viewerEmail;
      if (!email) return;

      /* Optimistic update   flip the local state immediately so the count
         increments without a network roundtrip. Roll back on failure. */
      let prev: ApprovedPost | undefined;
      setPosts((all) =>
        all.map((p) => {
          if (p.id !== postId) return p;
          prev = p;
          if (p.helpfulActive) return p;
          return {
            ...p,
            helpfulCount: p.helpfulCount + 1,
            helpfulActive: true,
          };
        }),
      );
      void markCommunityHelpfulAction(email, postId).then((res) => {
        if (!res.ok) {
          setPosts((all) =>
            all.map((p) => (p.id === postId && prev ? prev : p)),
          );
          showToast(res.error, "amber");
          return;
        }
        /* Reconcile with the canonical server count. */
        setPosts((all) =>
          all.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  helpfulCount: res.helpful,
                  helpfulActive: res.viewerHasMarkedHelpful,
                }
              : p,
          ),
        );
      });
    },
    [requireSignedIn, viewerEmail, showToast],
  );

  const setMsFilter = useCallback(
    (ms: CommunityMsFilter) => {
      setMsFilterState(ms);
      void fetchPage(
        pageRef.current,
        ms,
        searchQueryRef.current,
        sortByRef.current,
      );
    },
    [fetchPage],
  );

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
  }, []);

  const setSortBy = useCallback(
    (sort: CommunityFeedSort) => {
      setSortByState(sort);
      void fetchPage(1, msFilterRef.current, searchQueryRef.current, sort);
    },
    [fetchPage],
  );

  const searchMountedRef = useRef(false);
  useEffect(() => {
    if (!searchMountedRef.current) {
      searchMountedRef.current = true;
      return;
    }
    const id = window.setTimeout(() => {
      void fetchPage(1, msFilterRef.current, searchQuery, sortByRef.current);
    }, 320);
    return () => window.clearTimeout(id);
  }, [searchQuery, fetchPage]);

  const loadPage = useCallback(
    (n: number) => {
      void fetchPage(
        Math.max(1, n),
        msFilterRef.current,
        searchQueryRef.current,
        sortByRef.current,
      ).then(scrollFeedToTop);
    },
    [fetchPage, scrollFeedToTop],
  );

  /* ─── overlay helpers ─── */
  const openSubmit = useCallback(() => requestPost(), [requestPost]);
  const closeSubmit = useCallback(() => setSubmitOpen(false), []);

  const openAppeal = useCallback((ctx?: AppealContext) => {
    setAppealContext(ctx ?? null);
    setAppealOpen(true);
  }, []);
  const closeAppeal = useCallback(() => setAppealOpen(false), []);
  const closeReply = useCallback(() => {
    setReplyOpen(false);
    setReplyTarget(null);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (feedRefreshTimerRef.current !== null) {
        window.clearTimeout(feedRefreshTimerRef.current);
      }
    };
  }, []);

  const ctxValue = useMemo<CommunityUi>(
    () => ({
      liveCount,
      socketLive,
      viewerEmail,
      isSignedIn,
      posts,
      page,
      totalPages,
      total,
      msFilter,
      searchQuery,
      sortBy,
      loading,
      requestPost,
      requestHelpful,
      requestReply,
      loadPage,
      setMsFilter,
      setSearchQuery,
      setSortBy,
      openSubmit,
      openAppeal,
      toast: showToast,
    }),
    [
      liveCount,
      socketLive,
      viewerEmail,
      isSignedIn,
      posts,
      page,
      totalPages,
      total,
      msFilter,
      searchQuery,
      sortBy,
      loading,
      requestPost,
      requestHelpful,
      requestReply,
      loadPage,
      setMsFilter,
      setSearchQuery,
      setSortBy,
      openSubmit,
      openAppeal,
      showToast,
    ],
  );

  return (
    <CommunityUiProvider value={ctxValue}>
      {children}

      <NewPostBar
        currentTotal={total}
        serverTotal={aheadTotal}
        onLoad={loadNewPosts}
      />

      <SubmitMilestoneModal
        open={submitOpen}
        email={viewerEmail}
        profile={viewerProfile}
        onClose={closeSubmit}
        onSuccess={() => {
          showToast("Posted to the community feed", "green");
          scheduleFeedRefresh({ goToFirstPage: true });
        }}
        onValidationFail={(msg) => showToast(msg, "amber")}
      />
      <ReplyModal
        open={replyOpen}
        parent={replyTarget}
        email={viewerEmail}
        onClose={closeReply}
        onSuccess={() => {
          showToast("Reply posted", "green");
          scheduleFeedRefresh();
        }}
        onValidationFail={(msg) => showToast(msg, "amber")}
      />
      <AppealModal
        open={appealOpen}
        context={appealContext}
        onClose={closeAppeal}
        onSuccess={(msg) => showToast(msg, "green")}
        onValidationFail={(msg) => showToast(msg, "amber")}
      />
      <SignInPromptModal
        open={signInOpen}
        action={signInAction}
        onClose={() => setSignInOpen(false)}
      />

      <CommunityToaster toast={toast} />
    </CommunityUiProvider>
  );
}
