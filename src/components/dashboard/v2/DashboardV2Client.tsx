"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DashboardAppBar } from "./DashboardAppBar";
import { DashboardCohortSection } from "./DashboardCohortSection";
import { DashboardConsultingCTA } from "./DashboardConsultingCTA";
import { DashboardHeroBar } from "./DashboardHeroBar";
import { DashboardV2UiProvider } from "./DashboardV2Context";
import { DashboardPprBar } from "./DashboardPprBar";
import { DashboardRings } from "./DashboardRings";
import { DashboardShareSection } from "./DashboardShareSection";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTimeline } from "./DashboardTimeline";
import { DashboardToaster } from "./DashboardToaster";
import { DN_SIDEBAR } from "./data";
import {
  pickActiveDashboardSection,
  type DashboardScrollSpyKey,
} from "./scroll-spy";

/**
 * Top-level client for the parallel-implementation dashboard page.
 *
 * The page tree is roughly:
 *
 *   ┌───────────────────────────────── DashboardAppBar ───────────────┐
 *   │                       dnb (sticky, h: 60)                       │
 *   │  DashboardSidebar  │             <main> dmain                   │
 *   │  (sticky, 248px)   │   HeroBar · Rings · PprBar                 │
 *   │                    │   Timeline (#tl-sec)                       │
 *   │                    │   Cohort (#cohort-sec)                     │
 *   │                    │   Share  (#share-sec)                      │
 *   │                    │   Consulting CTA                           │
 *   └────────────────────┴────────────────────────────────────────────┘
 *   DashboardToaster (fixed bottom-right)
 *
 * Lives at `src/app/(marketing)/dashboard-new/page.tsx`.
 *
 * Sidebar "Dashboard" / share-on-page highlights follow scroll position,
 * matching the live `/dashboard` shell (`DashboardShellV2`).
 */
export function DashboardV2Client() {
  const mainRef = useRef<HTMLElement | null>(null);
  const [activeScrollKey, setActiveScrollKey] =
    useState<DashboardScrollSpyKey>("overview");

  const sections = useMemo(
    () => ({
      ...DN_SIDEBAR,
      dashboard: DN_SIDEBAR.dashboard.map((it) => ({
        ...it,
        active: it.key === activeScrollKey,
      })),
      share: DN_SIDEBAR.share.map((it) => ({
        ...it,
        active:
          !!it.active ||
          (activeScrollKey === "share-link" && it.key === "share-link"),
      })),
    }),
    [activeScrollKey],
  );

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const tick = () => {
      setActiveScrollKey(pickActiveDashboardSection(main));
    };

    tick();
    main.addEventListener("scroll", tick, { passive: true });
    const ro = new ResizeObserver(() => tick());
    ro.observe(main);
    window.addEventListener("resize", tick);
    window.addEventListener("hashchange", tick);
    return () => {
      main.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
      window.removeEventListener("hashchange", tick);
      ro.disconnect();
    };
  }, []);

  return (
    <DashboardV2UiProvider>
      <div className="dashboard-v2-page flex min-h-0 flex-1 flex-col">
        <DashboardAppBar />
        <div className="dlay">
          <DashboardSidebar sections={sections} />
          <main ref={mainRef} className="dmain">
            {/* Scroll target for the "Overview" sidebar item   must sit
                inside `.dmain` (the actual scroll container). See the live
                shell (`DashboardShellV2.tsx`) for the same trick. */}
            <div id="top" aria-hidden="true" />
            <DashboardHeroBar />
            <DashboardRings />
            <DashboardPprBar />
            <DashboardTimeline />
            <DashboardCohortSection />
            <DashboardShareSection />
            <DashboardConsultingCTA />
            <div style={{ height: 36 }} />
          </main>
        </div>
        <DashboardToaster />
      </div>
    </DashboardV2UiProvider>
  );
}
