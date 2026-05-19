import type { MilestoneKey, MilestoneEntry, UserProfile } from "./types";
import { normalizeStreamLabel } from "./cohort";
import { MILESTONE_DEFS } from "./constants";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emptyMilestones(): Record<MilestoneKey, MilestoneEntry> {
  return Object.fromEntries(
    MILESTONE_DEFS.map((m) => [m.key, { date: null, updatedAt: null }]),
  ) as Record<MilestoneKey, MilestoneEntry>;
}

/** Merge stored `milestones` with the current `MilestoneKey` set (fills missing keys). */
export function normalizeMilestonesFromDoc(raw: unknown): UserProfile["milestones"] {
  const base = emptyMilestones();
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    { date?: string | null; updatedAt?: string | null }
  >;
  for (const k of Object.keys(base) as MilestoneKey[]) {
    const e = r[k];
    if (e && typeof e === "object") {
      const d = e.date != null ? String(e.date).trim() : "";
      const u = e.updatedAt != null ? String(e.updatedAt) : null;
      base[k] = { date: d || null, updatedAt: u };
    }
  }
  return base;
}

export function newProfile(email: string): UserProfile {
  const now = new Date().toISOString();
  return {
    email: normalizeEmail(email),
    createdAt: now,
    updatedAt: now,
    aorDate: "",
    stream: "CEC",
    type: "Inland",
    province: "Ontario",
    milestones: emptyMilestones(),
  };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
