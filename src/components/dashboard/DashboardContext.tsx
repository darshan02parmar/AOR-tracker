"use client";

import { createContext, useContext, type ReactNode } from "react";
import type {
  CohortSummaryRow,
  LiveCohortAggregate,
} from "@/app/actions/aggregate";
import type { ProfileCompleteness } from "@/lib/profile-completeness";
import type { PprEstimate } from "@/lib/ppr-estimate";
import type { CohortInsight, MilestoneDefRow } from "@/lib/cohort-dynamic";
import type {
  CohortStats,
  GlobalMilestonePace,
  MilestoneKey,
  UserProfile,
} from "@/lib/types";

export type DashboardContextValue = {
  email: string;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  cohort: CohortStats;
  setCohort: React.Dispatch<React.SetStateAction<CohortStats | null>>;
  cohortDisplay: CohortStats;
  liveAggregate: LiveCohortAggregate | null;
  setLiveAggregate: React.Dispatch<
    React.SetStateAction<LiveCohortAggregate | null>
  >;
  relatedCohorts: Omit<CohortSummaryRow, "isCurrent">[];
  setRelatedCohorts: React.Dispatch<
    React.SetStateAction<Omit<CohortSummaryRow, "isCurrent">[]>
  >;
  refreshAfterProfileUpdate: (next: UserProfile) => Promise<void>;
  onSaveMilestone: (key: MilestoneKey, val: string) => Promise<void>;
  openPicker: MilestoneKey | null;
  setOpenPicker: React.Dispatch<React.SetStateAction<MilestoneKey | null>>;
  savedFlash: MilestoneKey | null;
  switchProfile: () => void;
  days: number;
  /** v2.0 cohort median (PPR window, histogram, stream compare). */
  median: number;
  /** Timeline length for journey % / progress bar   seeded pace total when available. */
  journeyDays: number;
  journeyFromSeededPace: boolean;
  pct: number;
  milestonePace: GlobalMilestonePace | null;
  ppr: PprEstimate | null;
  completeness: ProfileCompleteness | null;
  similarCohortsDisplay: CohortSummaryRow[];
  cohortInsights: CohortInsight[];
  milestoneDefsForCohort: MilestoneDefRow[];
  cohortTotal: number;
  ringOffset: number;
  shareUrl: string;
  /** Set when link generation fails; empty shareUrl may mean loading or error. */
  shareLinkError: string | null;
  /** Cohort derived from the user's profile (stream, AOR month/year, type, province). */
  profileCohortKey: string;
  /** Cohort currently driving stats/rails (may differ when comparing peers). */
  activeCohortKey: string;
  selectCohort: (cohortKey: string) => void;
  resetCohortToProfile: () => void;
  syncCohortStats: () => Promise<void>;
  syncCohortBusy: boolean;
  /** Fewer than 2 profiles in the active cohort   treat model as low confidence. */
  cohortDataSparse: boolean;
  /** §6.1   peers with earlier AOR still without eCOPR. */
  queueAhead: number;
  /** Biometrics completed ≥60 days after AOR (v2.0 late flag). */
  lateBiometrics: boolean;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  value,
  children,
}: {
  value: DashboardContextValue;
  children: ReactNode;
}) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}
