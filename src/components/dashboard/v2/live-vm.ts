"use client";

/**
 * Adapters that derive the v2 dashboard view-models from the live
 * `DashboardContext` shape. Each function returns the prop value expected by
 * a single v2 section component (HeroBar, Rings, PprBar, Timeline, etc.).
 *
 * Keeping these here (vs inside the section components) means:
 *   - The section components stay framework-agnostic and props-driven, so
 *     the seed preview and live dashboard share one implementation.
 *   - All cohort-stats → UI math lives in one place — easy to audit when
 *     swapping the data pipeline (e.g. once histogram bucket sizes change).
 *
 * Naming follows the seed structure (`Dn*`) so the v2 components don't need
 * to learn anything new.
 */

import type { DashboardContextValue } from "@/components/dashboard/DashboardContext";
import { fmtDate } from "@/lib/format";
import { humanizeCohortKey } from "@/lib/cohort";
import type { MilestoneDefRow } from "@/lib/cohort-dynamic";
import type { MilestoneKey, UserProfile } from "@/lib/types";
import { applicantIdFromEmail, timelineRowsFromProfile } from "@/lib/share-timeline-vm";
import type {
  DnAlertCard,
  DnCohortBar,
  DnDotMap,
  DnHeroStats,
  DnHistBar,
  DnInfoCard,
  DnJourneyProgress,
  DnProfile,
  DnStreamRow,
  DnTimelineRow,
  SidebarItem,
  SidebarSections,
} from "./data";

/* ─── PROFILE / IDENTITY ────────────────────────────────────────────── */

export function profileVM(email: string, profile: UserProfile): DnProfile {
  return {
    applicantId: applicantIdFromEmail(email),
    stream: profile.stream || "—",
    typeLabel: profile.type || "—",
    province: profile.province || "—",
    aorDateLabel: fmtDate(profile.aorDate) || "Not set",
    cohortLabel: humanizeCohortKey(
      `${profile.stream}:${profile.aorDate}:${profile.type}:${profile.province}`,
    ),
  };
}

/* ─── HERO STATS ────────────────────────────────────────────────────── */

export function heroStatsVM(
  ctx: Pick<
    DashboardContextValue,
    "days" | "median" | "cohort" | "cohortDisplay" | "ppr" | "profile"
  >,
): DnHeroStats {
  const { days, median, cohortDisplay, ppr } = ctx;
  const aheadCount = cohortDisplay.per_milestone_n?.ecopr ?? 0;
  const totalCount = cohortDisplay.n_verified || 1;
  const rankPct = Math.max(
    0,
    Math.round(100 - (aheadCount / totalCount) * 100),
  );
  const atTop = aheadCount === 0;
  const med = median > 0 ? median : null;

  return {
    daysSinceAor: days,
    typicalWait: {
      value: med != null ? `${med} days` : "—",
      note:
        med != null
          ? "Based on real data from people like you"
          : "Cohort median appears once enough eCOPR timelines exist in your group",
    },
    queuePosition: {
      value: atTop ? "Top of the list" : `Top ${rankPct}%`,
      note: atTop
        ? "0 people with the same profile ahead of you"
        : `${aheadCount} people with the same profile ahead of you`,
      tone: atTop || rankPct >= 50 ? "good" : "warn",
    },
    expectedApproval: {
      value: ppr?.windowLabel ?? "—",
      note: ppr?.limitedData
        ? "Early estimate — limited data"
        : "Not guaranteed — estimate only",
    },
  };
}

/* ─── RINGS ─────────────────────────────────────────────────────────── */

export function infoCardsVM(
  ctx: Pick<DashboardContextValue, "pct" | "days" | "median" | "cohort">,
): DnInfoCard[] {
  const cohortPct = Math.round((ctx.cohort.completion_rate ?? 0) * 100);
  const pw = ctx.cohort.pulseWeekly ?? [];
  const thisWeek = pw[pw.length - 1] ?? 0;
  const lastWeek = pw[pw.length - 2] ?? 0;
  const weeklyDelta =
    lastWeek > 0
      ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
      : Math.round((ctx.cohort.weekly_delta ?? 0) * 100);

  const journeyExplain =
    ctx.median > 0
      ? `You've passed ${ctx.pct}% of the typical timeline. Most people in your group finish their journey in about ${ctx.median} days — you're on Day ${ctx.days}.`
      : `You're on Day ${ctx.days}. A cohort median will appear once enough people in your group have logged eCOPR dates.`;

  const cohortExplain =
    cohortPct === 0
      ? "Nobody in your group has received final approval yet. This is normal — you're all early in the process. Check back weekly for updates."
      : `${cohortPct}% of your group has received final approval. Check back weekly for updates as more people complete their journey.`;

  const weeklyExplain =
    weeklyDelta > 0
      ? `Great news — approvals are picking up! ${weeklyDelta}% more than last week. This suggests IRCC is processing files faster.`
      : weeklyDelta < 0
        ? `Approvals slowed slightly this week — ${Math.abs(weeklyDelta)}% fewer than last week. Weekly counts often fluctuate.`
        : "Approval volume is steady compared to last week. Check back for updates as the week progresses.";

  return [
    {
      id: "journey",
      label: "How far along you are",
      tooltip:
        "We compare how many days have passed vs how long it typically takes for people with your profile.",
      value: `${ctx.pct}%`,
      valueTone: "teal",
      note: "of the typical journey complete",
      explain: journeyExplain,
    },
    {
      id: "cohort-ppr",
      label: "Approvals in your group so far",
      tooltip:
        "This shows what percentage of people who applied at the same time as you have already received their permanent residence approval.",
      value: `${cohortPct}%`,
      note: "of your group has been approved yet",
      explain: cohortExplain,
    },
    {
      id: "weekly-ppr",
      label: "Approval happening this week",
      tooltip:
        "Number of people across all groups who received their final PR approval this week.",
      value: String(thisWeek),
      valueTone: "teal",
      note: "people approved across all groups this week",
      explain: weeklyExplain,
    },
  ];
}

/* ─── PPR WINDOW ────────────────────────────────────────────────────── */

export function journeyProgressVM(
  ctx: Pick<DashboardContextValue, "days" | "median" | "pct" | "profile">,
): DnJourneyProgress {
  const { days, median, pct, profile } = ctx;
  const remaining = median > 0 ? Math.max(0, median - days) : null;
  const aorLabel = fmtDate(profile.aorDate) || "AOR pending";

  return {
    title: "Where you are on your journey",
    subtitle:
      "This shows today's position between when you applied and when we expect you'll be approved",
    progressPct: Math.min(100, pct),
    axisLabels: [
      `Day 0 — You applied (${aorLabel})`,
      `Today — Day ${days}`,
      median > 0
        ? `Day ${median} — Typical finish line`
        : "Typical finish line — pending cohort data",
    ],
    daysWaited: {
      label: "Days you've already waited",
      value: `${days} days`,
    },
    daysRemaining: {
      label: "Estimated days remaining",
      value: remaining != null ? `~${remaining} more days` : "—",
    },
  };
}

/* ─── TIMELINE ──────────────────────────────────────────────────────── */

export function timelineRowsVM(
  defs: MilestoneDefRow[],
  profile: UserProfile,
): DnTimelineRow[] {
  return timelineRowsFromProfile(defs, profile, { includeEdit: true });
}

/* ─── COHORT BARS ───────────────────────────────────────────────────── */

const BAR_FILL_BY_KEY: Record<MilestoneKey, "g" | "b" | "a" | "r"> = {
  aor: "g",
  bil: "b",
  biometrics: "b",
  background: "a",
  medical: "a",
  p1: "a",
  p2: "a",
  ecopr: "r",
};

export function cohortBarsVM(
  ctx: Pick<DashboardContextValue, "cohortDisplay" | "cohortTotal">,
  defs: MilestoneDefRow[],
): DnCohortBar[] {
  const total = ctx.cohortTotal || 1;
  return defs.map((d) => {
    const n = ctx.cohortDisplay.per_milestone_n?.[d.key] ?? 0;
    const pct = Math.round((n / total) * 100);
    return {
      name: d.label,
      countLabel: `${n} / ${total} (${pct}%)`,
      pct,
      fill: BAR_FILL_BY_KEY[d.key],
    };
  });
}

/* ─── HISTOGRAM ─────────────────────────────────────────────────────── */

export function histVM(
  ctx: Pick<DashboardContextValue, "cohort">,
): DnHistBar[] {
  return ctx.cohort.dist.map((r) => ({
    label: r.range,
    value: r.count,
    type: r.you ? "y" : "n",
  }));
}

/* ─── DOT MAP ───────────────────────────────────────────────────────── */

export function dotMapVM(
  ctx: Pick<
    DashboardContextValue,
    "cohortTotal" | "days" | "median" | "cohortDataSparse" | "cohort"
  >,
): DnDotMap {
  // We render at most 500 dots to keep the SVG cheap. When the cohort is
  // smaller we render the actual count so the legend remains accurate.
  const total = Math.min(Math.max(ctx.cohortTotal, 1), 500);
  const completionPct = ctx.cohort.completion_rate ?? 0;
  const pprUpTo = Math.round(total * completionPct);
  const midUpTo = Math.min(total, pprUpTo + Math.round(total * 0.3));
  const youIndex = Math.min(
    total - 1,
    Math.max(0, Math.round((ctx.days / Math.max(ctx.median, 1)) * total)),
  );
  return { total, pprUpTo, midUpTo, youIndex };
}

/* ─── STREAM COMPARE ────────────────────────────────────────────────── */

export function streamCompareVM(
  ctx: Pick<DashboardContextValue, "cohort" | "profile">,
): DnStreamRow[] {
  const medians = ctx.cohort.stream_medians;
  if (medians.length === 0) return [];
  const max = Math.max(...medians.map((s) => s.median), 1);
  const fastest = medians.reduce(
    (acc, cur) => (cur.median < acc.median ? cur : acc),
    medians[0],
  );
  const userTokens = ctx.profile.stream
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return medians.map((s) => {
    const nameL = s.name.toLowerCase().replace(/—/g, " ");
    const isYou = userTokens.every((tok) => nameL.includes(tok));
    const variant: DnStreamRow["variant"] = isYou
      ? "you"
      : s.name === fastest.name
        ? "fastest"
        : "neutral";
    return {
      name: s.name,
      days: `${s.median}d`,
      fillPct: Math.round((s.median / max) * 95),
      variant,
    };
  });
}

/* ─── ALERTS ────────────────────────────────────────────────────────── */

export function alertsVM(
  ctx: Pick<DashboardContextValue, "cohortInsights">,
): DnAlertCard[] {
  return ctx.cohortInsights.slice(0, 4).map((ins) => ({
    tone: ins.t === "r" || ins.t === "a" ? "amber" : "green",
    iconKind: ins.t === "r" || ins.t === "a" ? "warn" : "check",
    title: stripHtml(ins.txt).split(" — ")[0] ?? "Community update",
    desc: stripHtml(ins.txt),
    meta: ["Community"],
    linkLabel: "View details",
    href: "/community",
  }));
}

function stripHtml(html: string): string {
  const plain = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  // Decode entities left in insight strings so plain-text alerts never show
  // literals like "&apos;" (double-escaped upstream or legacy content).
  if (typeof document === "undefined") {
    return plain
      .replace(/&apos;|&#39;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&");
  }
  const ta = document.createElement("textarea");
  ta.innerHTML = plain;
  return ta.value;
}

/* ─── SIDEBAR SECTIONS ──────────────────────────────────────────────── */

/**
 * Produce the four sidebar sections for the live dashboard.
 *
 * The Dashboard section uses in-page anchor links (`#tl-sec`, `#cohort-sec`,
 * `#alerts-sec`) — when the user is on `/dashboard` these scroll smoothly;
 * on sub-routes (`/dashboard/share`, `/dashboard/stats`) they navigate to
 * `/dashboard#…`. The Share section links to the two real sub-routes
 * (`/dashboard/stats`, `/dashboard/share`).
 *
 * `pathname` is used to flag the active item for `/dashboard/stats` and
 * `/dashboard/share` in the Share section. On `/dashboard`, the "Dashboard"
 * row highlights are driven by scroll-spy in `DashboardShellV2`, not here.
 */
export function sidebarSectionsVM({
  pathname,
  cohortTotal,
  hasEmail,
}: {
  pathname: string | null;
  cohortTotal: number;
  hasEmail: boolean;
}): SidebarSections {
  const onDashboard = pathname === "/dashboard";
  const onStats = pathname === "/dashboard/stats";
  const onShare = pathname === "/dashboard/share";

  const anchor = (frag: string) =>
    onDashboard ? frag : `/dashboard${frag}`;

  const dashboard: SidebarItem[] = [
    {
      key: "overview",
      label: "Overview",
      icon: "overview",
      href: anchor("#top"),
      /* `active` for dashboard items on `/dashboard` is driven by scroll-spy
         in `DashboardShellV2` so the highlight follows the visible section. */
    },
    {
      key: "timeline",
      label: "My Timeline",
      icon: "timeline",
      href: anchor("#tl-sec"),
    },
    {
      key: "cohort",
      label: "My Cohort",
      icon: "cohort",
      href: anchor("#cohort-sec"),
      badge: cohortTotal > 0 ? cohortTotal.toLocaleString() : undefined,
    },
    {
      key: "alerts",
      label: "Alerts",
      icon: "alerts",
      href: anchor("#alerts-sec"),
    },
  ];

  const community: SidebarItem[] = [
    {
      key: "feed",
      label: "Community Feed",
      icon: "feed",
      href: "/community",
    },
    {
      key: "feedback",
      label: "Give Feedback",
      icon: "plus",
      href: "https://github.com/Get-North-Path/AOR-tracker/issues/new",
    },
  ];

  const share: SidebarItem[] = [
    {
      key: "share-stats",
      label: "Processing Stats",
      icon: "stats",
      href: "/dashboard/stats",
      active: onStats,
    },
    {
      key: "share-link",
      label: "Share Timeline",
      icon: "share",
      href: "/dashboard/share",
      active: onShare,
    },
  ];

  const profile: SidebarItem[] = [
    ...(hasEmail
      ? []
      : [
          {
            key: "add-email",
            label: "Add Email",
            icon: "email" as const,
            href: "/profile/add-email",
          },
        ]),
    {
      key: "delete",
      label: "Delete My Data",
      icon: "trash" as const,
      kind: "danger" as const,
    },
  ];

  return { dashboard, community, share, profile };
}
