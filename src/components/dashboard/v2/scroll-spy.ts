/**
 * Maps scroll position inside the dashboard main column (`.dmain`) to the
 * sidebar "Dashboard" / share-on-page keys so `.dsb-link.on` tracks the
 * section currently in view   same UX as clicking each anchor.
 */

export type DashboardScrollSpyKey =
  | "overview"
  | "timeline"
  | "cohort"
  | "share-link";

/** In document order   last section whose top is at/above the line wins. */
const SECTIONS: { id: string; key: DashboardScrollSpyKey }[] = [
  { id: "top", key: "overview" },
  { id: "tl-sec", key: "timeline" },
  { id: "cohort-sec", key: "cohort" },
  { id: "share-sec", key: "share-link" },
];

/**
 * @param main   the scroll container (`<main class="dmain">`)
 * @param activationOffsetPx   distance from the top of the visible main area
 *   into the content; the active section is the last one whose top edge is
 *   at or above this line (typical scroll-spy "header offset").
 */
export function pickActiveDashboardSection(
  main: HTMLElement,
  activationOffsetPx = 96,
): DashboardScrollSpyKey {
  const line = main.scrollTop + activationOffsetPx;
  let active: DashboardScrollSpyKey = "overview";
  for (const { id, key } of SECTIONS) {
    const el = main.querySelector(`#${CSS.escape(id)}`);
    if (!(el instanceof HTMLElement)) continue;
    const contentTop =
      main.scrollTop +
      (el.getBoundingClientRect().top - main.getBoundingClientRect().top);
    if (contentTop <= line) active = key;
  }
  return active;
}
