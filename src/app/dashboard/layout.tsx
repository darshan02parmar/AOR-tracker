import type { Metadata } from "next";
import "@/styles/dashboard-v2.css";
import { DashboardShellV2 } from "@/components/dashboard/v2/DashboardShellV2";

export const metadata: Metadata = {
  title: "Dashboard — AORTrack",
  robots: { index: false, follow: false },
};

/**
 * `/dashboard` layout — wraps every sub-route in `DashboardShellV2`, which
 * loads the user profile + cohort data, mounts the v2 chrome (app-bar,
 * sidebar, toaster) and provides both `DashboardContext` and
 * `DashboardV2UiContext` to its children.
 *
 * Old chrome (`DashboardShell`) is still on disk under
 * `src/components/dashboard/` and can be deleted once we're confident the
 * migration has no regressions in production.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellV2>{children}</DashboardShellV2>;
}
