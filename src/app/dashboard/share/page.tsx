import type { Metadata } from "next";
import { DashboardShareTabV2 } from "@/components/dashboard/v2/DashboardShareTabV2";
import { NOINDEX_ROBOTS } from "@/lib/sitemap-paths";

export const metadata: Metadata = {
  title: "Share — AORTrack",
  robots: NOINDEX_ROBOTS,
};

export default function DashboardSharePage() {
  return <DashboardShareTabV2 />;
}
