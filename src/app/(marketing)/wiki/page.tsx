import "@/styles/wiki.css";
import { WikiFullPage } from "@/components/wiki/WikiFullPage";
import { buildPageMetadata } from "@/lib/marketing-metadata";

export const metadata = buildPageMetadata({
  title: "Wiki — Backend & data flow | AORTrack",
  description:
    "Single-page contributor docs: sessionStorage identity, Community, Track, and Dashboard server actions and MongoDB.",
  path: "/wiki",
  ogImage: "home",
  ogType: "article",
  openGraphTitle: "Wiki — Backend & data flow",
  openGraphDescription:
    "How server actions, MongoDB, and browser session line up across Community, Track, and Dashboard.",
  robots: { index: false, follow: false },
});

export default function WikiPage() {
  return <WikiFullPage />;
}
