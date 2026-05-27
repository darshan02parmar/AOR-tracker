"use client";

import { useDashboard } from "@/components/dashboard/DashboardContext";
import { DashboardConsultingCTA } from "./DashboardConsultingCTA";
import { DashboardShareSection } from "./DashboardShareSection";

/**
 * `/dashboard/share`   focused share view in the v2 design.
 *
 * The page is intentionally lean: a single ShareSection (Copy / WhatsApp /
 * GitHub) fed by the real `shareUrl` from `DashboardContext`, plus the
 * shared bottom consulting CTA. The visual language matches the on-page
 * share section that lives at `/dashboard#share-sec`.
 */
export function DashboardShareTabV2() {
  const { shareUrl, shareLinkError } = useDashboard();
  return (
    <>
      <DashboardShareSection
        share={{
          shareUrl,
          shareUrlDisplay: shareUrl.replace(/^https?:\/\//, ""),
          githubUrl: "https://github.com/Get-North-Path/AOR-tracker",
        }}
        error={shareLinkError}
      />
      <DashboardConsultingCTA />
      <div style={{ height: 36 }} />
    </>
  );
}
