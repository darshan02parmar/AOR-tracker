import { DashboardStatsTabV2 } from "@/components/dashboard/v2/DashboardStatsTabV2";
import { buildPageMetadata } from "@/lib/marketing-metadata";

export const metadata = buildPageMetadata({
  title: "Live PR Processing Stats by Stream — CEC, FSW, PNP, FST, Atlantic | AORTrack",
  description:
    "Live Express Entry processing stats: community medians, P25–P75, and histograms by stream (CEC, FSW, PNP, FST, Atlantic). Crowd-sourced — not IRCC official.",
  path: "/dashboard/stats",
  ogImage: "guide",
  keywords: [
    "Express Entry processing stats",
    "Canada PR processing time dashboard",
    "CEC FSW PNP median days",
    "AOR cohort statistics",
    "community PR processing data",
  ],
  robots: { index: true, follow: true },
  includeModifiedTime: true,
});

export default function DashboardStatsPage() {
  return <DashboardStatsTabV2 />;
}
