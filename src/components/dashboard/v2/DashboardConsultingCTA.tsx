"use client";

import { DN_CONSULTING_CTA } from "./data";
import { IconArrowRight } from "./dashboard-icons";

/**
 * Bottom red CTA bar   GetNorthPath consulting upsell.
 *
 * Sample reference: `.cta-bar` block in `aortrack-dashboard.html`.
 */
export function DashboardConsultingCTA() {
  return (
    <div className="cta-bar" style={{ marginTop: 26 }}>
      <div>
        <div className="cta-bar-h">{DN_CONSULTING_CTA.heading}</div>
        <div className="cta-bar-sub">{DN_CONSULTING_CTA.sub}</div>
      </div>
      <a
        href={DN_CONSULTING_CTA.href}
        className="cta-bar-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        {DN_CONSULTING_CTA.ctaLabel}
        <IconArrowRight aria-hidden />
      </a>
    </div>
  );
}
