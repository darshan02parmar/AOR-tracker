# Cohort stats sync (v2.0)

After emptying MongoDB, use this flow so dashboard medians and calibration match the v2.0 algorithm.

## 1. Seed CEC profiles from Excel (recommended)

Place [`CEC_Cohort_Tracker_Updated.xlsx`](../CEC_Cohort_Tracker_Updated.xlsx) at the repo root (or set `CEC_SEED_XLSX`).

```bash
curl "http://localhost:3000/api/dev/seed?cec=1"
```

Requires `NODE_ENV=development` or `ALLOW_DEV_SEED=1` in `.env`.

This will:

1. Upsert ~600 profiles by **Case #** (`caseNo`, unique).
2. Set **AOR Received** → `aorDate` + `milestones.aor` (cohort month/year).
3. Map milestone columns (biometrics, background, medical, P1, P2, eCOPR).
4. Mark `seededData: true` (team tracking label only — does not exclude stats or Discord).
5. Synthetic email: `{username}{caseNo}@gmail.com` (e.g. `umairahmad16case-126792@gmail.com`).
6. Reconcile `profiles.cohortKey` → `CEC:{month}:{year}:inland`.
7. Run v2.0 cohort sync (`cohort_stats` + `cohort_calibration`).

**Query flags:**

| Flag | Effect |
|------|--------|
| `?cec=1&wipe=1` | `deleteMany({ seededData: true })` before import |
| `?cec=1&sync=0` | Import only, no cohort rebuild |
| `?cec=1&discord=summary` | One summary Discord embed after import |
| `?cec=1&discord=each` | Per-row Discord webhooks (~600 messages — avoid) |

**Discord is off by default** during CEC seed to avoid rate limits.

**Defaults:** `stream: CEC General`, `type: Inland`, `province: Ontario`.

## 2. Or add profiles manually

Use [https://track.getnorthpath.com/track](https://track.getnorthpath.com/track) (or local `/track`) to create profiles with AOR date, stream, inland/outland, and milestones.

- **Biometrics** is the single biometrics milestone (BIL removed).
- eCOPR rows **without** biometrics are excluded from median / percentile stats.
- Live saves set `seededData: false`.

## 3. Run the sync job (if not using `?cec=1`)

```bash
curl -X POST "http://localhost:3000/api/cron/sync-cohorts" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Or in dev:

```bash
curl -X POST "http://localhost:3000/api/dev/sync-cohorts"
```

Requires `CRON_SECRET` for the cron route.

The job will:

1. Reconcile `profiles.cohortKey` to `{streamGroup}:{month}:{year}:{inland|outland}` (CEC General + CEC STEM → `CEC`).
2. Load last `cohort_calibration.new_median_days` (bootstrap **180** on first run).
3. Compute dynamic cutoff: `today − clamp(1.5 × stored_median, 270, 547)` days.
4. Apply survival imputation and recency weights on eCOPR completions.
5. Upsert `cohort_stats` per cohort key and append `cohort_calibration`.

Seeded profiles (`seededData: true`) are **included** in aggregates.

## 4. Verify

In MongoDB:

- `profiles` — `seededData: true`, `caseNo`, `aorDate`, `cohortKey` (e.g. `CEC:5:2026:inland`).
- `cohort_calibration` — latest row has `cutoff_date`, `new_median_days`, `n_eligible`.
- `cohort_stats` — `algorithm_version: "v2.0"`, `p10_days` … `p90_days`.

On the dashboard (sign in with a seeded synthetic email):

- **Typical wait** uses the v2.0 median.
- **Journey %** = `days_since_AOR / median`.
- **Expected approval window** = `AOR + P25` … `AOR + P75`.
- **Queue position** = earlier-AOR peers still without eCOPR.

Discord during seed is **disabled by default**. Opt in with `?discord=summary` (one message) or `?discord=each` (testing only). Live `/track` saves still notify Discord as usual.

## Cleanup

Remove import only:

```js
db.profiles.deleteMany({ seededData: true })
```

Then re-run sync.

## Notes

- `seed-bulk.ts` (`?bulk=1`) is synthetic demo data — separate from CEC Excel import.
- `pulseWeekly` is empty until real weekly eCOPR aggregation is implemented.
