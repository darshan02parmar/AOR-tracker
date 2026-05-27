export type WikiNavItem = {
  id: string;
  label: string;
};

export type WikiNavGroup = {
  id: string;
  label: string;
  children?: WikiNavItem[];
};

/** Sidebar / scroll-spy structure   ids must match section elements in WikiFullPage. */
export const WIKI_NAV: WikiNavGroup[] = [
  {
    id: "session-identity",
    label: "Session & identity",
    children: [
      { id: "sess-not-included", label: "Not included yet" },
      { id: "sess-client-session", label: "sessionStorage" },
      { id: "sess-server", label: "MongoDB profiles" },
      { id: "sess-community-actions", label: "Community actions" },
      { id: "sess-trust-model", label: "Trust model" },
      { id: "sess-flow", label: "Happy path" },
      { id: "sess-files", label: "Key files" },
      { id: "sess-cron", label: "Cron / dev auth" },
    ],
  },
  {
    id: "community-backend",
    label: "Community",
    children: [
      { id: "comm-surfaces", label: "Surfaces" },
      { id: "comm-mongo", label: "community_posts" },
      { id: "comm-adapter", label: "Marketing adapter" },
      { id: "comm-actions", label: "Server actions" },
      { id: "comm-submit-milestone", label: "Submit milestone" },
      { id: "comm-socket", label: "Socket.IO" },
      { id: "comm-client-flow", label: "Public shell" },
      { id: "comm-dashboard-panel", label: "Dashboard panel" },
    ],
  },
  {
    id: "track-backend",
    label: "Track",
    children: [
      { id: "trk-phases", label: "Three phases" },
      { id: "trk-submit-chain", label: "Submit chain" },
      { id: "trk-live-counter", label: "Hero counter" },
      { id: "trk-files", label: "Key files" },
    ],
  },
  {
    id: "dashboard-backend",
    label: "Dashboard",
    children: [
      { id: "dash-shell-load", label: "Initial load" },
      { id: "dash-appbar", label: "Top bar" },
      { id: "dash-live-vs-static", label: "v2.0 vs live" },
      { id: "dash-mutations", label: "Mutations" },
      { id: "dash-routes", label: "Routes" },
      { id: "dash-scroll-spy", label: "Scroll spy" },
      { id: "dash-context", label: "Contexts" },
    ],
  },
  {
    id: "cohort-v2",
    label: "Cohort v2.0",
    children: [
      { id: "cohort-key", label: "Cohort key" },
      { id: "cohort-algorithm", label: "Sync pipeline" },
      { id: "cohort-mongo", label: "Collections" },
      { id: "cohort-seed", label: "Dev bulk seed" },
      { id: "cohort-discord", label: "Discord webhooks" },
      { id: "cohort-cron", label: "Scheduled sync" },
      { id: "cohort-milestones", label: "Milestones" },
    ],
  },
];

export function allWikiSectionIds(): string[] {
  return WIKI_NAV.flatMap((g) => [
    g.id,
    ...(g.children?.map((c) => c.id) ?? []),
  ]);
}
