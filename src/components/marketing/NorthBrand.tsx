import { WebsiteLogo } from "@/components/WebsiteLogo";

/** Marketing / community / roadmap nav   thin wrapper around `WebsiteLogo`. */
export function NorthBrand() {
  return (
    <WebsiteLogo className="nbrand" href="/" aria-label="AORTrack   home" />
  );
}
