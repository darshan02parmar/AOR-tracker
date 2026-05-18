import { MILESTONE_DEFS } from "./constants";
import type { MilestoneKey, UserProfile } from "./types";

const POST_AOR_MILESTONES: MilestoneKey[] = [
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
];

export type RemainingField =
  | {
      id: string;
      label: string;
      hint: string;
      priority: "required";
      field: "aorDate" | "stream" | "type" | "province";
    }
  | {
      id: string;
      label: string;
      hint: string;
      priority: "optional";
      field: "milestone";
      milestoneKey: MilestoneKey;
    };

export type ProfileCompleteness = {
  percent: number;
  remaining: RemainingField[];
  requiredRemaining: number;
  optionalRemaining: number;
};

function hasAor(profile: UserProfile): boolean {
  if (profile.aorDate?.trim()) return true;
  return !!profile.milestones?.aor?.date?.trim();
}

export function computeProfileCompleteness(
  profile: UserProfile,
): ProfileCompleteness {
  const remaining: RemainingField[] = [];

  if (!profile.aorDate?.trim()) {
    remaining.push({
      id: "aorDate",
      label: "AOR date",
      hint: "When IRCC sent your acknowledgement of receipt.",
      priority: "required",
      field: "aorDate",
    });
  }
  if (!profile.stream?.trim()) {
    remaining.push({
      id: "stream",
      label: "Application stream",
      hint: "Your Express Entry stream (CEC, FSW, or PNP).",
      priority: "required",
      field: "stream",
    });
  }
  if (!profile.type?.trim()) {
    remaining.push({
      id: "type",
      label: "Inland or Outland",
      hint: "How your application is processed.",
      priority: "required",
      field: "type",
    });
  }
  if (!profile.province?.trim()) {
    remaining.push({
      id: "province",
      label: "Province of residence",
      hint: "Shown on your dashboard summary.",
      priority: "required",
      field: "province",
    });
  }

  const aorLogged = hasAor(profile);
  for (const key of POST_AOR_MILESTONES) {
    if (!profile.milestones[key]?.date?.trim()) {
      const def = MILESTONE_DEFS.find((d) => d.key === key);
      remaining.push({
        id: `milestone:${key}`,
        label: def?.label ?? key,
        hint: aorLogged
          ? "Choose the date you finished this step, then Save."
          : "Add your AOR date above first.",
        priority: "optional",
        field: "milestone",
        milestoneKey: key,
      });
    }
  }

  const requiredTotal = 4;
  const requiredFilled = [
    profile.aorDate?.trim(),
    profile.stream?.trim(),
    profile.type?.trim(),
    profile.province?.trim(),
  ].filter(Boolean).length;

  const optionalTotal = POST_AOR_MILESTONES.length;
  const optionalFilled = POST_AOR_MILESTONES.filter((k) =>
    profile.milestones[k]?.date?.trim(),
  ).length;

  const requiredScore = requiredFilled / requiredTotal;
  const optionalScore = optionalFilled / optionalTotal;
  const percent = Math.round(100 * (0.4 * requiredScore + 0.6 * optionalScore));

  return {
    percent,
    remaining,
    requiredRemaining: remaining.filter((r) => r.priority === "required")
      .length,
    optionalRemaining: remaining.filter((r) => r.priority === "optional")
      .length,
  };
}
