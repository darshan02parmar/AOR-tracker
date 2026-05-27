/**
 * Pure milestone timeline view-model helpers (no React).
 * Used by the dashboard v2 client VM and by the public `/s/[token]` share page.
 */

import type { DnTimelineRow, DnTimelineState } from "@/components/dashboard/v2/data";
import type { MilestoneDefRow } from "@/lib/cohort-dynamic";
import { fmtDate } from "@/lib/format";
import type { UserProfile } from "@/lib/types";

/**
 * Stable short id ("#4821")   same algorithm as the signed-in dashboard chrome.
 */
export function applicantIdFromEmail(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = (h * 31 + email.charCodeAt(i)) | 0;
  }
  const n = (Math.abs(h) % 9000) + 1000;
  return `#${n}`;
}

function rowStateFor(
  defs: MilestoneDefRow[],
  idx: number,
  profile: UserProfile,
): DnTimelineState {
  const hasDate = !!profile.milestones[defs[idx].key]?.date;
  if (hasDate) {
    let lastDone = -1;
    defs.forEach((d, i) => {
      if (profile.milestones[d.key]?.date) lastDone = i;
    });
    return idx === lastDone ? "done" : "done";
  }
  for (let i = 0; i < idx; i++) {
    if (!profile.milestones[defs[i].key]?.date) return "wait";
  }
  return defs[idx].key === "ecopr" ? "final" : "now";
}

function dayLabel(aorDate: string, milestoneDate: string): string {
  const aor = new Date(`${aorDate}T12:00:00`);
  const m = new Date(`${milestoneDate}T12:00:00`);
  if (Number.isNaN(aor.getTime()) || Number.isNaN(m.getTime())) return " ";
  const d = Math.round((m.getTime() - aor.getTime()) / 86_400_000);
  return `Day ${d}`;
}

export function timelineRowsFromProfile(
  defs: MilestoneDefRow[],
  profile: UserProfile,
  options?: { includeEdit?: boolean },
): DnTimelineRow[] {
  const includeEdit = options?.includeEdit !== false;

  return defs.map((def, idx) => {
    const m = profile.milestones[def.key];
    const hasDate = !!m?.date;
    const state = rowStateFor(defs, idx, profile);

    const baseDate = hasDate
      ? { date: fmtDate(m.date) || "Set", day: dayLabel(profile.aorDate, m.date!) }
      : undefined;

    const row: DnTimelineRow = {
      key: def.key,
      state,
      name: def.label,
      desc: def.desc,
      badge: hasDate
        ? { kind: "verified", label: "Verified" }
        : state === "now"
          ? { kind: "pending", label: "In progress · contribute your date" }
          : { kind: "estimate", label: `Est. ${def.est}` },
      date: baseDate,
      pending: !hasDate,
    };

    if (includeEdit && def.key !== "ecopr") {
      row.edit = {
        label: hasDate ? "Edit" : "Add date",
        fieldLabel: `${def.label} Date`,
        initial: m?.date ?? undefined,
        saveLabel: hasDate
          ? "Save"
          : "Save & contribute to community",
        fromDate: hasDate,
      };
    }

    return row;
  });
}
