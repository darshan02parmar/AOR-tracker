# Cohort stats sync (v2.0)

After emptying MongoDB, use this flow so dashboard medians and calibration match the v2.0 algorithm.

## 1. Add profiles

Use [https://track.getnorthpath.com/track](https://track.getnorthpath.com/track) (or local `/track`) to create profiles with AOR date, stream, inland/outland, and milestones.

- **Biometrics** is the single biometrics milestone (BIL / registration letter removed).
- eCOPR rows **without** a biometrics date are excluded from median / percentile stats.

## 2. Run the sync job

```bash
curl -X POST "http://localhost:3000/api/cron/sync-cohorts" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Requires `CRON_SECRET` in `.env`.

The job will:

1. Reconcile `profiles.cohortKey` to `{streamGroup}:{month}:{year}:{inland|outland}` (CEC General + CEC STEM → `CEC`).
2. Load last `cohort_calibration.new_median_days` (bootstrap **180** on first run).
3. Compute dynamic cutoff: `today − clamp(1.5 × stored_median, 270, 547)` days.
4. Apply survival imputation (`days_elapsed + 30` for still-waiting) and recency weights on eCOPR completions.
5. Upsert `cohort_stats` per cohort key and append a `cohort_calibration` row.

## 3. Verify

In MongoDB:

- `cohort_calibration` — latest row has `cutoff_date`, `new_median_days`, `n_eligible`, `n_imputed`.
- `cohort_stats` — documents have `algorithm_version: "v2.0"`, `p10_days` … `p90_days`, `n_eligible`.

On the dashboard:

- **Typical wait** uses the v2.0 median (not the old ~123d survivor-biased value).
- **Journey %** = `days_since_AOR / median`.
- **Expected approval window** = calendar range `AOR + P25` … `AOR + P75`.
- **Queue position** = count of earlier-AOR peers still without eCOPR.

## Notes

- Bulk seed (`seed-bulk.ts`) is unchanged for this doc; use `/track` + sync for now.
- `pulseWeekly` is empty until real weekly eCOPR aggregation is implemented.
