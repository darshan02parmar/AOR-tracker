export type MilestoneKey =
  | "aor"
  | "biometrics"
  | "background"
  | "medical"
  /** Permanent Residence Portal — first invitation / initial portal tasks (inland). */
  | "p1"
  /** PR Portal — photo & Canadian mailing address for PR card (after approval in portal). */
  | "p2"
  /** Electronic Confirmation of Permanent Residence issued in the portal. */
  | "ecopr";

export type MilestoneEntry = {
  date: string | null;
  updatedAt: string | null;
};

export type UserProfile = {
  email: string;
  createdAt: string;
  updatedAt: string;
  aorDate: string;
  stream: string;
  type: string;
  province: string;
  milestones: Record<MilestoneKey, MilestoneEntry>;
  /** myimmitracker Case # — unique for CEC Excel import. */
  caseNo?: string;
  username?: string;
  /** Team label: Excel import vs live /track submissions. */
  seededData?: boolean;
  currentStatus?: string;
};

export type CohortStats = {
  cohortKey: string;
  median_days_to_ppr: number;
  p10_days?: number;
  p25_days: number;
  p75_days: number;
  p90_days?: number;
  n_verified: number;
  n_eligible?: number;
  n_completed?: number;
  n_waiting?: number;
  n_imputed?: number;
  completion_rate: number;
  weekly_delta?: number;
  per_milestone_n: Partial<Record<MilestoneKey, number>>;
  dist: { range: string; count: number; pct: number; you?: boolean }[];
  pulseWeekly: number[];
  stream_medians: { name: string; median: number }[];
  p1_p25_days?: number;
  p1_p50_days?: number;
  p1_p75_days?: number;
  algorithm_version?: string;
  last_updated: string;
};

export type CohortCalibration = {
  computed_at: string;
  cutoff_date: string;
  lookback_days: number;
  stored_median_days: number;
  new_median_days: number;
  new_p10_days: number;
  new_p25_days: number;
  new_p75_days: number;
  new_p90_days: number;
  n_eligible: number;
  n_completed: number;
  n_waiting: number;
  n_imputed: number;
};

/** Shown above a reply (Discord-style); snippet is plain text only. */
export type CommunityReplyRef = {
  id: string;
  initials: string;
  name: string;
  snippet: string;
};

export type CommunityPost = {
  id: string;
  initials: string;
  name: string;
  meta: string;
  ms: string;
  msl: string;
  body: string;
  /** Seed posts use HTML; user posts are plain text (rendered safely). */
  bodyIsHtml: boolean;
  tl: { label: string; done: boolean }[];
  helpful: number;
  /** Present when the feed was loaded for a signed-in viewer. */
  viewerHasMarkedHelpful?: boolean;
  /** When this post is a reply to another approved post. */
  replyTo?: CommunityReplyRef;
  /** Nested replies when this document is a top-level feed row. */
  replies?: CommunityPost[];
  /** ISO string of the post's creation time (set by the serializer). */
  createdAt?: string;
};
