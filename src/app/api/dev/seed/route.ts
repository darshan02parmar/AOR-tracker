import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { runBulkCohortSeed } from "@/lib/seed-bulk";
import { runCecTrackerSeed } from "@/lib/seed-cec-tracker";
import { seedDemoDataIfEmpty } from "@/lib/seed";

/**
 * Demo data seeding (development or `ALLOW_DEV_SEED=1`).
 *
 * - Default: inserts sample `community_posts` only if that collection is empty.
 * - `?bulk=1`: wipes `aortracker.demo.*` profiles, inserts 200 demo profiles.
 * - `?cec=1`: imports `CEC_Cohort_Tracker_Updated.xlsx` (~600 CEC rows), reconciles
 *   cohort keys, runs v2.0 sync (default). `?cec=1&wipe=1` deletes prior seeded rows first.
 *   `?cec=1&sync=0` import only. Discord off by default; `?discord=summary` or `?discord=each` to opt in.
 *
 * Example: `curl "http://localhost:3000/api/dev/seed?cec=1"`
 */
export async function GET(req: NextRequest) {
  const allowed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_DEV_SEED === "1";
  if (!allowed) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }
  try {
    const db = await getDb();
    const params = req.nextUrl.searchParams;

    if (params.get("cec") === "1") {
      const discord = params.get("discord");
      const cec = await runCecTrackerSeed(db, {
        wipeSeededFirst: params.get("wipe") === "1",
        runSync: params.get("sync") !== "0",
        discordSummary: discord === "summary" || discord === "1",
        discordEach: discord === "each",
      });
      return NextResponse.json({
        ok: true,
        cec,
        message: `CEC seed: ${cec.upserted} inserted, ${cec.modified} updated, ${cec.skipped} skipped. Cohorts: ${cec.cohortKeysTouched.length}. Sync median: ${cec.calibrationMedian ?? "n/a"}.`,
      });
    }

    if (params.get("bulk") === "1") {
      const bulk = await runBulkCohortSeed(db);
      return NextResponse.json({
        ok: true,
        bulk,
        message: `Bulk seed: ${bulk.profilesInserted} profiles, ${bulk.cohortsSynced} cohort stats upserted. Excel: ${bulk.excelPath ?? "not written"}${bulk.excelError ? ` (${bulk.excelError})` : ""}.`,
      });
    }
    const result = await seedDemoDataIfEmpty(db);
    return NextResponse.json({
      ok: true,
      ...result,
      message:
        result.postsInserted === 0
          ? "Nothing inserted — community_posts already had data."
          : "Demo community posts inserted.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
