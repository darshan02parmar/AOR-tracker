import Link from "next/link";
import { MARKETING_CONTENT_DATE_LABEL, STREAM_MEDIANS_2026 } from "@/lib/marketing-seo";

const STREAM_ROWS = [
  { slug: "cec", label: "CEC   Canadian Experience Class", days: STREAM_MEDIANS_2026.cec },
  { slug: "fsw", label: "FSW   Federal Skilled Worker", days: STREAM_MEDIANS_2026.fsw },
  { slug: "pnp", label: "PNP   Provincial Nominee Program", days: STREAM_MEDIANS_2026.pnp },
  { slug: "fst", label: "FST   Federal Skilled Trades", days: STREAM_MEDIANS_2026.fst },
  {
    slug: "atlantic",
    label: "Atlantic Immigration Program",
    days: STREAM_MEDIANS_2026.atlantic,
  },
] as const;

type Props = { profileCount?: number | null };

export function LandingSeoIntroSection({ profileCount }: Props) {
  const countPhrase =
    profileCount != null && profileCount > 0
      ? ` It aggregates milestone data from ${profileCount.toLocaleString()}+ applicants who voluntarily log AOR dates and processing steps.`
      : " It aggregates anonymized milestone data from applicants who voluntarily log AOR dates and processing steps.";

  return (
    <section className="seo-intro section" aria-labelledby="seo-intro-heading">
      <div className="inner">
        <h2 id="seo-intro-heading" className="section-h2 reveal">
          What is AORTrack?
        </h2>
        <p className="seo-intro-lead reveal">
          AORTrack is a free, open-source Canadian permanent residency processing time tracker.
          {countPhrase} Medians below measure community-reported days from Acknowledgement of Receipt
          (AOR) to eCOPR-style milestones by Express Entry and related stream  {" "}
          <strong>not official IRCC processing times</strong>. Use them for cohort context and
          peer comparison; check IRCC for your case status.
        </p>
        <div className="seo-intro-table-wrap reveal">
          <table className="seo-intro-table">
            <caption className="seo-intro-caption">
              Community median processing days (AOR → eCOPR-style)   updated{" "}
              {MARKETING_CONTENT_DATE_LABEL}
            </caption>
            <thead>
              <tr>
                <th scope="col">Stream</th>
                <th scope="col">Median days</th>
              </tr>
            </thead>
            <tbody>
              {STREAM_ROWS.map((row) => (
                <tr key={row.slug}>
                  <td>
                    <Link href={`/streams/${row.slug}`}>{row.label}</Link>
                  </td>
                  <td>
                    <span className="seo-intro-days">{row.days}</span> days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
