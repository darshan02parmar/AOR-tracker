import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeGlobalSeededMilestonePace,
  estimatedIsoForMilestone,
  MILESTONE_SEGMENT_ORDER,
} from "./milestone-gap-estimates";
import type { ProfileForMilestonePace } from "./milestone-gap-estimates";

function profile(
  gaps: Partial<
    Record<
      | "biometrics"
      | "background"
      | "medical"
      | "p1"
      | "p2"
      | "ecopr",
      number
    >
  >,
  seeded = true,
): ProfileForMilestonePace {
  const aor = "2025-01-01";
  const add = (base: string, days: number) => {
    const d = new Date(`${base}T12:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  let cursor = aor;
  const milestones: Record<string, { date: string }> = { aor: { date: aor } };
  const order = [
    "biometrics",
    "background",
    "medical",
    "p1",
    "p2",
    "ecopr",
  ] as const;
  for (const key of order) {
    const gap = gaps[key];
    if (gap == null) continue;
    cursor = add(cursor, gap);
    milestones[key] = { date: cursor };
  }
  return { aorDate: aor, milestones, seededData: seeded };
}

describe("computeGlobalSeededMilestonePace", () => {
  it("averages segment gaps and sums to eCOPR total", () => {
    const pace = computeGlobalSeededMilestonePace([
      profile({
        biometrics: 20,
        background: 30,
        medical: 40,
        p1: 10,
        p2: 10,
        ecopr: 50,
      }),
      profile({
        biometrics: 40,
        background: 50,
        medical: 60,
        p1: 30,
        p2: 30,
        ecopr: 70,
      }),
      profile({
        biometrics: 30,
        background: 40,
        medical: 50,
        p1: 20,
        p2: 20,
        ecopr: 60,
      }),
      profile({
        biometrics: 28,
        background: 32,
        medical: 45,
        p1: 20,
        p2: 15,
        ecopr: 40,
      }),
      profile({
        biometrics: 32,
        background: 28,
        medical: 43,
        p1: 22,
        p2: 17,
        ecopr: 42,
      }),
    ]);

    assert.equal(pace.seeded_profiles, 5);
    assert.equal(pace.segment_avg_days.biometrics, 30);

    let sum = 0;
    for (const { key } of MILESTONE_SEGMENT_ORDER) {
      sum += pace.segment_avg_days[key] ?? 0;
    }
    assert.equal(pace.total_avg_days_to_ecopr, sum);
    assert.equal(pace.cumulative_avg_days.ecopr, sum);
  });
});

describe("estimatedIsoForMilestone", () => {
  it("projects forward from last completed milestone", () => {
    const pace = computeGlobalSeededMilestonePace([
      profile({
        biometrics: 10,
        background: 20,
        medical: 30,
        p1: 10,
        p2: 10,
        ecopr: 20,
      }),
      profile({
        biometrics: 10,
        background: 20,
        medical: 30,
        p1: 10,
        p2: 10,
        ecopr: 20,
      }),
      profile({
        biometrics: 10,
        background: 20,
        medical: 30,
        p1: 10,
        p2: 10,
        ecopr: 20,
      }),
      profile({
        biometrics: 10,
        background: 20,
        medical: 30,
        p1: 10,
        p2: 10,
        ecopr: 20,
      }),
      profile({
        biometrics: 10,
        background: 20,
        medical: 30,
        p1: 10,
        p2: 10,
        ecopr: 20,
      }),
    ]);

    const partial = {
      aorDate: "2026-03-20",
      milestones: {
        aor: { date: "2026-03-20", updatedAt: null },
        biometrics: { date: "2026-03-21", updatedAt: null },
        background: { date: null, updatedAt: null },
        medical: { date: "2026-05-22", updatedAt: null },
        p1: { date: "2026-05-24", updatedAt: null },
        p2: { date: null, updatedAt: null },
        ecopr: { date: null, updatedAt: null },
      },
    };

    const p2 = estimatedIsoForMilestone(
      "p2",
      "2026-03-20",
      pace,
      partial,
    );
    const ecopr = estimatedIsoForMilestone(
      "ecopr",
      "2026-03-20",
      pace,
      partial,
    );
    assert.ok(p2?.iso);
    assert.ok(ecopr?.iso);
    assert.ok(p2.iso < ecopr.iso);
    assert.equal(p2.source, "pace_forward");
  });
});
