import type { Db } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { buildStatsCohortKey } from "@/lib/cohort";
import {
  notifyDiscordCecSeedSummary,
  notifyDiscordProfileEvent,
} from "@/lib/discord-webhook";
import { ensureCohortStatsPlaceholder } from "@/lib/ensure-cohort-stats";
import {
  reconcileProfileCohortKeys,
  runCohortStatsSyncJob,
} from "@/lib/cohort-sync-job";
import { emptyMilestones, isValidEmail } from "@/lib/profile";
import type { MilestoneKey, MilestoneEntry } from "@/lib/types";

const DEFAULT_STREAM = "CEC";
const DEFAULT_TYPE = "Inland";
const DEFAULT_PROVINCE = "Ontario";

const MILESTONE_COLUMNS: { headerKeys: string[]; key: MilestoneKey }[] = [
  { headerKeys: ["biometrics completed"], key: "biometrics" },
  { headerKeys: ["background check initiated"], key: "background" },
  { headerKeys: ["medical results received"], key: "medical" },
  {
    headerKeys: [
      "p1   pr portal (first invitation)",
      "p1 pr portal (first invitation)",
      "p1",
    ],
    key: "p1",
  },
  {
    headerKeys: [
      "p2   pr portal (photo & address)",
      "p2 pr portal (photo & address)",
      "p2",
    ],
    key: "p2",
  },
  { headerKeys: ["ecopr issued", "ecopr"], key: "ecopr" },
];

export type CecSeedOptions = {
  filePath?: string;
  wipeSeededFirst?: boolean;
  runSync?: boolean;
  /** One summary embed after import (`?discord=summary`). Off by default. */
  discordSummary?: boolean;
  /** Per-row profile_saved webhooks   ~600 messages (`?discord=each`). Off by default. */
  discordEach?: boolean;
};

export type CecSeedResult = {
  rowsRead: number;
  upserted: number;
  modified: number;
  skipped: number;
  errors: { row: number; reason: string }[];
  cohortKeysTouched: string[];
  profilesCohortKeyUpdates?: number;
  cohortsUpserted?: number;
  calibrationMedian?: number;
  excelPath: string;
};

function normalizeHeader(h: string): string {
  return h
    .replace(/\r\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function resolveExcelPath(filePath?: string): string {
  const root = process.cwd();
  const candidates = [
    filePath,
    process.env.CEC_SEED_XLSX,
    path.join(root, "CEC_Cohort_Tracker_Updated.xlsx"),
    path.join(root, "data", "CEC_Cohort_Tracker_Updated.xlsx"),
  ]
    .filter((p): p is string => Boolean(p?.trim()))
    .map((p) => path.resolve(p));
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `CEC seed Excel not found. Tried: ${candidates.join(", ")}`,
  );
}

/** `XLSX.readFile` breaks under Next/Turbopack   read bytes then parse. */
function readWorkbook(excelPath: string): XLSX.WorkBook {
  const resolved = path.resolve(excelPath);
  let buf: Buffer;
  try {
    buf = fs.readFileSync(resolved);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Cannot read CEC seed Excel at ${resolved}: ${detail}. Close the file if it is open in Excel.`,
    );
  }
  try {
    return XLSX.read(buf, { type: "buffer" });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(`Cannot parse CEC seed Excel at ${resolved}: ${detail}`);
  }
}

function normalizeCaseNo(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (/^case-\d+$/i.test(s)) return s;
  const digits = s.replace(/^case-?/i, "").replace(/\D/g, "");
  if (!digits) return null;
  return `case-${digits}`;
}

/** Parse Excel cell to ISO date YYYY-MM-DD. */
export function parseSheetDate(cell: unknown): string | null {
  if (cell == null || cell === "") return null;
  if (cell instanceof Date && !Number.isNaN(cell.getTime())) {
    return cell.toISOString().slice(0, 10);
  }
  if (typeof cell === "number" && Number.isFinite(cell)) {
    const parsed = XLSX.SSF.parse_date_code(cell);
    if (parsed) {
      const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
      return d.toISOString().slice(0, 10);
    }
  }
  const str = String(cell).trim();
  if (!str) return null;
  const d = new Date(`${str}T12:00:00`);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const d2 = new Date(str);
  if (!Number.isNaN(d2.getTime())) return d2.toISOString().slice(0, 10);
  return null;
}

function columnIndex(
  headerNorm: string[],
  aliases: string[],
): number | undefined {
  for (const alias of aliases) {
    const i = headerNorm.indexOf(alias);
    if (i >= 0) return i;
  }
  for (let i = 0; i < headerNorm.length; i++) {
    const h = headerNorm[i]!;
    if (aliases.some((a) => h.includes(a) || a.includes(h))) return i;
  }
  return undefined;
}

function buildHeaderMap(headerRow: string[]): {
  username: number;
  caseNo: number;
  aor: number;
  currentStatus?: number;
  milestones: Map<MilestoneKey, number>;
} | null {
  const headerNorm = headerRow.map(normalizeHeader);
  const username = columnIndex(headerNorm, ["username"]);
  const caseNo = columnIndex(headerNorm, ["case #", "case#", "case"]);
  const aor = columnIndex(headerNorm, [
    "aor received",
    "aor received date",
    "aor",
    "aor date",
  ]);
  if (username === undefined || caseNo === undefined || aor === undefined) {
    return null;
  }
  const milestones = new Map<MilestoneKey, number>();
  for (const { headerKeys, key } of MILESTONE_COLUMNS) {
    const idx = columnIndex(headerNorm, headerKeys);
    if (idx !== undefined) milestones.set(key, idx);
  }
  const statusIdx = columnIndex(headerNorm, ["current status", "status"]);
  return {
    username,
    caseNo,
    aor,
    currentStatus: statusIdx,
    milestones,
  };
}

function syntheticEmail(username: string, caseNo: string): string {
  const usernameNorm = username.trim().toLowerCase().replace(/\s+/g, "");
  const caseNoNorm = caseNo.trim().toLowerCase();
  return `${usernameNorm}${caseNoNorm}@gmail.com`;
}

function setMilestone(
  milestones: Record<MilestoneKey, MilestoneEntry>,
  key: MilestoneKey,
  date: string | null,
  updatedAt: string,
): void {
  milestones[key] = {
    date,
    updatedAt: date ? updatedAt : null,
  };
}

export async function runCecTrackerSeed(
  db: Db,
  options: CecSeedOptions = {},
): Promise<CecSeedResult> {
  const excelPath = resolveExcelPath(options.filePath);
  const wb = readWorkbook(excelPath);
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("CEC seed Excel has no sheets");
  const ws = wb.Sheets[sheetName]!;
  const matrix = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
    header: 1,
    defval: "",
    raw: false,
  });
  if (matrix.length < 2) {
    throw new Error("CEC seed Excel has no data rows");
  }

  const headerMap = buildHeaderMap(matrix[0]!.map(String));
  if (!headerMap) {
    throw new Error(
      `CEC seed Excel missing required columns. Headers: ${matrix[0]?.join(" | ")}`,
    );
  }

  if (options.wipeSeededFirst) {
    await db.collection("profiles").deleteMany({ seededData: true });
  }

  const profilesCol = db.collection("profiles");
  const nowIso = new Date().toISOString();
  const now = new Date();
  const cohortKeysSet = new Set<string>();
  const errors: CecSeedResult["errors"] = [];
  const ops: {
    updateOne: {
      filter: { caseNo: string };
      update: {
        $set: Record<string, unknown>;
        $setOnInsert: Record<string, unknown>;
      };
      upsert: boolean;
    };
  }[] = [];
  const discordRows: {
    email: string;
    caseNo: string;
    username: string;
    cohortKey: string;
    aorDate: string;
  }[] = [];

  let rowsRead = 0;
  let skipped = 0;

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r]!;
    const rowNum = r + 1;
    if (!row.some((c) => String(c).trim())) continue;
    rowsRead++;

    const username = String(row[headerMap.username] ?? "").trim();
    const caseNoRaw = String(row[headerMap.caseNo] ?? "").trim();
    const caseNo = normalizeCaseNo(caseNoRaw);
    const aorDate = parseSheetDate(row[headerMap.aor]);

    if (!caseNo) {
      skipped++;
      errors.push({ row: rowNum, reason: "missing or invalid Case #" });
      continue;
    }
    if (!username) {
      skipped++;
      errors.push({ row: rowNum, reason: "missing Username" });
      continue;
    }
    if (!aorDate) {
      skipped++;
      errors.push({ row: rowNum, reason: "missing or invalid AOR date" });
      continue;
    }

    const emailNorm = syntheticEmail(username, caseNo);
    if (!isValidEmail(emailNorm)) {
      skipped++;
      errors.push({ row: rowNum, reason: `invalid synthetic email: ${emailNorm}` });
      continue;
    }

    const milestones = emptyMilestones();
    setMilestone(milestones, "aor", aorDate, nowIso);
    for (const [key, colIdx] of headerMap.milestones) {
      const parsed = parseSheetDate(row[colIdx]);
      if (parsed) setMilestone(milestones, key, parsed, nowIso);
    }

    const currentStatus =
      headerMap.currentStatus !== undefined
        ? String(row[headerMap.currentStatus] ?? "").trim() || undefined
        : undefined;

    const cohortKey = buildStatsCohortKey({
      aorDate,
      stream: DEFAULT_STREAM,
      type: DEFAULT_TYPE,
    });
    cohortKeysSet.add(cohortKey);

    ops.push({
      updateOne: {
        filter: { caseNo },
        update: {
          $set: {
            caseNo,
            username,
            emailNorm,
            seededData: true,
            aorDate,
            stream: DEFAULT_STREAM,
            type: DEFAULT_TYPE,
            province: DEFAULT_PROVINCE,
            milestones,
            cohortKey,
            currentStatus,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        upsert: true,
      },
    });

    discordRows.push({
      email: emailNorm,
      caseNo,
      username,
      cohortKey,
      aorDate,
    });
  }

  let upserted = 0;
  let modified = 0;
  if (ops.length > 0) {
    const bulk = await profilesCol.bulkWrite(ops, { ordered: false });
    upserted = bulk.upsertedCount;
    modified = bulk.modifiedCount;
  }

  const cohortKeysTouched = [...cohortKeysSet].sort();

  if (options.discordEach) {
    for (const d of discordRows) {
      await notifyDiscordProfileEvent({
        kind: "profile_saved",
        email: d.email,
        cohortKey: d.cohortKey,
        stream: DEFAULT_STREAM,
        type: DEFAULT_TYPE,
        province: DEFAULT_PROVINCE,
        aorDate: d.aorDate,
        seededData: true,
        caseNo: d.caseNo,
        username: d.username,
      });
    }
  }

  for (const cohortKey of cohortKeysTouched) {
    try {
      await ensureCohortStatsPlaceholder(db, cohortKey);
    } catch (e) {
      console.warn("[cec-seed] cohort placeholder failed", cohortKey, e);
    }
  }

  let profilesCohortKeyUpdates: number | undefined;
  let cohortsUpserted: number | undefined;
  let calibrationMedian: number | undefined;

  if (options.runSync !== false) {
    profilesCohortKeyUpdates = await reconcileProfileCohortKeys(db);
    const sync = await runCohortStatsSyncJob(db);
    cohortsUpserted = sync.cohortsUpserted;
    const cal = await db
      .collection("cohort_calibration")
      .findOne({}, { sort: { computed_at: -1 } });
    if (cal && typeof cal.new_median_days === "number") {
      calibrationMedian = cal.new_median_days;
    }
  }

  if (options.discordSummary) {
    await notifyDiscordCecSeedSummary({
      excelPath,
      rowsRead,
      upserted,
      modified,
      skipped,
      errorCount: errors.length,
      cohortKeysTouched,
      cohortsUpserted,
      calibrationMedian,
      discordEach: Boolean(options.discordEach),
    });
  }

  return {
    rowsRead,
    upserted,
    modified,
    skipped,
    errors: errors.slice(0, 50),
    cohortKeysTouched,
    profilesCohortKeyUpdates,
    cohortsUpserted,
    calibrationMedian,
    excelPath,
  };
}
