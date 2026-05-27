import Link from "next/link";
import type { ComponentProps } from "react";
import "@/styles/website-logo.css";

type Layout = "nav" | "inline";

type Props = Omit<ComponentProps<typeof Link>, "children"> & {
  /** `nav`: hide wordmark on small screens. `inline`: always show both (e.g. footer). */
  layout?: Layout;
  /** `sm`: 24px mark (dashboard v2 bar). Default 28px. */
  size?: "md" | "sm";
};

/**
 * Logo mark + wordmark linking home. Shared across marketing, track,
 * dashboard, and landing top bars   styles live in `website-logo.css`.
 */
export function WebsiteLogo({
  href = "/",
  className = "",
  layout = "nav",
  size = "md",
  "aria-label": ariaLabel = "AORTrack   home",
  ...rest
}: Props) {
  const rootClass = [
    "website-logo",
    size === "sm" ? "website-logo--sm" : "",
    layout === "inline" ? "website-logo--inline" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={rootClass} aria-label={ariaLabel} {...rest}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Logo.png"
        alt=""
        className="website-logo__mark-img"
        width={28}
        height={28}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Logo-text.png"
        alt=""
        className="website-logo__text-img"
        width={100}
        height={44}
      />
    </Link>
  );
}
