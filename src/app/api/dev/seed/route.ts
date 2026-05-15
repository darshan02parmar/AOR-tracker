import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { runBulkCohortSeed } from "@/lib/seed-bulk";
import { seedDemoDataIfEmpty } from "@/lib/seed";

/**
 * Demo data seeding (development or `ALLOW_DEV_SEED=1`).
 *
 * - Default: inserts sample `community_posts` only if that collection is empty.
 * - `?bulk=1`: wipes `aortracker.demo.*` profiles, inserts 200 demo profiles across
 *   20 cohorts (stream + inland/outland + province + AOR month/year), runs cohort
 *   sync, writes `data/bulk-seed-profiles.xlsx`.
 *
 * Example: `curl "http://localhost:3000/api/dev/seed?bulk=1"`
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
    if (req.nextUrl.searchParams.get("bulk") === "1") {
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
