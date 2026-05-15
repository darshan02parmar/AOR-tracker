import type { Db } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { buildCohortKey } from "@/lib/cohort";
import { runCohortStatsSyncJob } from "@/lib/cohort-sync-job";
import { emptyMilestones, normalizeEmail } from "@/lib/profile";
import type { MilestoneKey, UserProfile } from "@/lib/types";

/** Prefix for bulk-seeded demo accounts — safe to wipe and re-run. */
export const BULK_SEED_EMAIL_PREFIX = "aortracker.demo.";

const FIRST = [
  "Emma",
  "Noah",
  "Olivia",
  "Liam",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "Lucas",
  "Mia",
  "James",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Henry",
  "Harper",
  "Alexander",
  "Evelyn",
  "Michael",
  "Abigail",
  "Daniel",
  "Emily",
  "Matthew",
  "Elizabeth",
  "David",
  "Sofia",
  "Joseph",
  "Avery",
  "Jackson",
  "Ella",
  "Sebastian",
  "Madison",
  "Jack",
  "Scarlett",
  "Owen",
  "Victoria",
  "Samuel",
  "Aria",
  "Ryan",
  "Grace",
  "Nathan",
  "Chloe",
  "Carter",
  "Camila",
  "Jayden",
  "Penelope",
  "John",
  "Layla",
  "Luke",
];

const LAST = [
  "Nguyen",
  "Patel",
  "Singh",
  "Kim",
  "Garcia",
  "Rodriguez",
  "Martinez",
  "Lee",
  "Brown",
  "Wilson",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Moore",
  "Clark",
  "Lewis",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "King",
  "Wright",
  "Scott",
  "Green",
  "Baker",
  "Adams",
  "Nelson",
  "Carter",
  "Mitchell",
  "Roberts",
  "Turner",
  "Phillips",
  "Campbell",
  "Parker",
  "Evans",
  "Edwards",
  "Collins",
  "Stewart",
  "Morris",
  "Rogers",
  "Reed",
  "Cook",
  "Morgan",
  "Bell",
  "Murphy",
  "Bailey",
];

const DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "live.ca",
  "proton.me",
  "fastmail.com",
];

export type CohortSpec = {
  stream: UserProfile["stream"];
  type: UserProfile["type"];
  province: UserProfile["province"];
  /** Representative AOR (month/year drive `cohortKey`); per-profile AOR varies within the same month. */
  cohortAnchorAor: string;
  /** Target centre for days AOR→eCOPR (completed profiles). */
  targetPprMedian: number;
};

/** 20 cohorts: stream + inland/outland + province + AOR month/year; keys like `CEC_GENERAL:2:2025:inland:ON`. */
export const BULK_COHORT_SPECS: CohortSpec[] = [
  {
    stream: "CEC General",
    type: "Inland",
    province: "Ontario",
    cohortAnchorAor: "2025-02-14",
    targetPprMedian: 182,
  },
  {
    stream: "CEC General",
    type: "Outland",
    province: "Ontario",
    cohortAnchorAor: "2025-02-18",
    targetPprMedian: 198,
  },
  {
    stream: "CEC General",
    type: "Inland",
    province: "British Columbia",
    cohortAnchorAor: "2025-03-10",
    targetPprMedian: 176,
  },
  {
    stream: "CEC General",
    type: "Outland",
    province: "British Columbia",
    cohortAnchorAor: "2025-03-12",
    targetPprMedian: 205,
  },
  {
    stream: "CEC STEM",
    type: "Inland",
    province: "Ontario",
    cohortAnchorAor: "2025-01-22",
    targetPprMedian: 162,
  },
  {
    stream: "CEC STEM",
    type: "Outland",
    province: "Alberta",
    cohortAnchorAor: "2025-01-28",
    targetPprMedian: 178,
  },
  {
    stream: "CEC Healthcare",
    type: "Inland",
    province: "Ontario",
    cohortAnchorAor: "2025-04-08",
    targetPprMedian: 172,
  },
  {
    stream: "CEC French",
    type: "Inland",
    province: "Quebec",
    cohortAnchorAor: "2025-02-26",
    targetPprMedian: 148,
  },
  {
    stream: "FSW General",
    type: "Outland",
    province: "Ontario",
    cohortAnchorAor: "2025-05-06",
    targetPprMedian: 218,
  },
  {
    stream: "FSW General",
    type: "Inland",
    province: "Manitoba",
    cohortAnchorAor: "2025-05-14",
    targetPprMedian: 204,
  },
  {
    stream: "PNP",
    type: "Inland",
    province: "British Columbia",
    cohortAnchorAor: "2025-06-04",
    targetPprMedian: 242,
  },
  {
    stream: "PNP",
    type: "Outland",
    province: "Saskatchewan",
    cohortAnchorAor: "2025-06-11",
    targetPprMedian: 256,
  },
  {
    stream: "CEC General",
    type: "Inland",
    province: "Alberta",
    cohortAnchorAor: "2024-11-18",
    targetPprMedian: 168,
  },
  {
    stream: "CEC General",
    type: "Outland",
    province: "Ontario",
    cohortAnchorAor: "2024-12-09",
    targetPprMedian: 201,
  },
  {
    stream: "CEC STEM",
    type: "Inland",
    province: "British Columbia",
    cohortAnchorAor: "2025-04-22",
    targetPprMedian: 155,
  },
  {
    stream: "CEC Healthcare",
    type: "Outland",
    province: "Ontario",
    cohortAnchorAor: "2025-03-28",
    targetPprMedian: 188,
  },
  {
    stream: "CEC General",
    type: "Inland",
    province: "Quebec",
    cohortAnchorAor: "2025-05-20",
    targetPprMedian: 179,
  },
  {
    stream: "FSW General",
    type: "Outland",
    province: "British Columbia",
    cohortAnchorAor: "2025-02-04",
    targetPprMedian: 226,
  },
  {
    stream: "PNP",
    type: "Inland",
    province: "Ontario",
    cohortAnchorAor: "2025-07-08",
    targetPprMedian: 238,
  },
  {
    stream: "CEC French",
    type: "Outland",
    province: "Ontario",
    cohortAnchorAor: "2025-01-16",
    targetPprMedian: 162,
  },
];

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function aorInSameCohortMonth(anchor: string, rng: () => number): string {
  const base = new Date(`${anchor}T12:00:00`);
  const y = base.getFullYear();
  const m = base.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const day = 1 + Math.floor(rng() * last);
  const d = new Date(y, m, day);
  return d.toISOString().slice(0, 10);
}

/** Seven monotonic day offsets from AOR ending at `total` days to eCOPR. */
function pprOffsets(total: number, rng: () => number): number[] {
  const gaps = Array.from({ length: 7 }, () => 0.06 + rng() * 0.19);
  const s = gaps.reduce((a, b) => a + b, 0);
  const scaled = gaps.map((g) => Math.max(1, Math.round((g / s) * total)));
  const diff = total - scaled.reduce((a, b) => a + b, 0);
  scaled[6] = Math.max(1, scaled[6]! + diff);
  const cum: number[] = [];
  let c = 0;
  for (let i = 0; i < 7; i++) {
    c += scaled[i]!;
    cum.push(c);
  }
  cum[6] = total;
  for (let i = 1; i < 7; i++) {
    if (cum[i]! <= cum[i - 1]!) cum[i] = cum[i - 1]! + 1;
  }
  cum[6] = total;
  return cum;
}

function buildMilestonesForProfile(
  aor: string,
  targetPpr: number,
  complete: boolean,
  rng: () => number,
): UserProfile["milestones"] {
  const m = emptyMilestones();
  const now = new Date().toISOString();
  const set = (key: MilestoneKey, date: string) => {
    m[key] = { date, updatedAt: now };
  };
  set("aor", aor);

  if (!complete) {
    const keys: MilestoneKey[] = [
      "bil",
      "biometrics",
      "background",
      "medical",
      "p1",
      "p2",
    ];
    const maxStep = Math.max(1, Math.floor(rng() * (keys.length + 1)));
    const partialTotal = 45 + Math.floor(rng() * 95);
    const cum = pprOffsets(partialTotal, rng);
    for (let i = 0; i < maxStep && i < keys.length; i++) {
      set(keys[i]!, addDays(aor, cum[i]!));
    }
    return m;
  }

  const total = Math.max(
    110,
    Math.min(310, Math.round(targetPpr + (rng() - 0.5) * 36)),
  );
  const cum = pprOffsets(total, rng);
  const keys: MilestoneKey[] = [
    "bil",
    "biometrics",
    "background",
    "medical",
    "p1",
    "p2",
    "ecopr",
  ];
  for (let i = 0; i < keys.length; i++) {
    set(keys[i]!, addDays(aor, cum[i]!));
  }
  return m;
}

export type BulkSeedResult = {
  profilesInserted: number;
  profilesDeleted: number;
  cohortStatsDeleted: number;
  cohortsSynced: number;
  profileCohortKeyUpdates: number;
  cohortKeys: string[];
  excelPath: string | null;
  excelError?: string;
};

export async function runBulkCohortSeed(db: Db): Promise<BulkSeedResult> {
  const profilesCol = db.collection("profiles");
  const statsCol = db.collection("cohort_stats");

  const delProf = await profilesCol.deleteMany({
    emailNorm: { $regex: `^${escapeRegex(BULK_SEED_EMAIL_PREFIX)}` },
  });

  const plannedKeys = BULK_COHORT_SPECS.map((spec) =>
    buildCohortKey({
      aorDate: spec.cohortAnchorAor,
      stream: spec.stream,
      type: spec.type,
      province: spec.province,
    }),
  );
  const delStats = await statsCol.deleteMany({ cohortKey: { $in: plannedKeys } });

  const docs: Record<string, unknown>[] = [];
  const excelRows: Record<string, string | number>[] = [];

  let globalIdx = 0;
  for (let c = 0; c < BULK_COHORT_SPECS.length; c++) {
    const spec = BULK_COHORT_SPECS[c]!;
    for (let i = 0; i < 10; i++) {
      const rngP = mulberry32(0xdeadbeef + globalIdx * 1315423911);
      const first = FIRST[globalIdx % FIRST.length]!;
      const last = LAST[(globalIdx * 7) % LAST.length]!;
      const domain = DOMAINS[globalIdx % DOMAINS.length]!;
      const local = `${first.toLowerCase()}.${last.toLowerCase()}.${String(globalIdx + 1).padStart(3, "0")}`;
      const emailRaw = `${BULK_SEED_EMAIL_PREFIX}${local}@${domain}`;
      const emailNorm = normalizeEmail(emailRaw);

      const aorDate = aorInSameCohortMonth(spec.cohortAnchorAor, rngP);
      const complete = rngP() < 0.72;
      const milestones = buildMilestonesForProfile(
        aorDate,
        spec.targetPprMedian,
        complete,
        rngP,
      );

      const profileLike: Pick<
        UserProfile,
        "aorDate" | "stream" | "type" | "province"
      > = {
        aorDate,
        stream: spec.stream,
        type: spec.type,
        province: spec.province,
      };
      const cohortKey = buildCohortKey(profileLike);
      const createdAt = new Date();
      const eco = milestones.ecopr?.date;
      let daysToEcopr = "";
      if (typeof eco === "string" && eco) {
        const a = new Date(`${aorDate}T12:00:00`).getTime();
        const e = new Date(`${eco}T12:00:00`).getTime();
        if (!Number.isNaN(a) && !Number.isNaN(e)) {
          daysToEcopr = String(Math.max(0, Math.round((e - a) / 86_400_000)));
        }
      }

      docs.push({
        emailNorm,
        createdAt,
        updatedAt: createdAt,
        aorDate,
        stream: spec.stream,
        type: spec.type,
        province: spec.province,
        milestones,
        cohortKey,
      });

      excelRows.push({
        email: emailNorm,
        cohortKey,
        stream: spec.stream,
        type: spec.type,
        province: spec.province,
        aorDate,
        daysToEcopr,
        bil: milestones.bil?.date ?? "",
        biometrics: milestones.biometrics?.date ?? "",
        background: milestones.background?.date ?? "",
        medical: milestones.medical?.date ?? "",
        p1: milestones.p1?.date ?? "",
        p2: milestones.p2?.date ?? "",
        ecopr: milestones.ecopr?.date ?? "",
      });

      globalIdx++;
    }
  }

  if (docs.length !== 200) {
    throw new Error(`Expected 200 profile docs, got ${docs.length}`);
  }

  await profilesCol.insertMany(docs);

  const sync = await runCohortStatsSyncJob(db);

  let excelPath: string | null = null;
  let excelError: string | undefined;
  try {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    excelPath = path.join(dir, "bulk-seed-profiles.xlsx");
    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profiles");
    XLSX.writeFile(wb, excelPath);
  } catch (e) {
    excelError = e instanceof Error ? e.message : "excel_write_failed";
  }

  return {
    profilesInserted: docs.length,
    profilesDeleted: delProf.deletedCount,
    cohortStatsDeleted: delStats.deletedCount,
    cohortsSynced: sync.cohortsUpserted,
    profileCohortKeyUpdates: sync.profilesCohortKeyUpdates,
    cohortKeys: [...new Set(plannedKeys)],
    excelPath,
    excelError,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
