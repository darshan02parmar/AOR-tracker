import "@/styles/wiki.css";
import { WikiFullPage } from "@/components/wiki/WikiFullPage";
import { buildNoIndexMetadata } from "@/lib/marketing-metadata";

export const metadata = buildNoIndexMetadata({
  title: "Wiki — Backend & data flow | AORTrack",
  description:
    "Single-page contributor docs: sessionStorage identity, Community, Track, and Dashboard server actions and MongoDB.",
  path: "/wiki",
  ogImage: "home",
  ogType: "article",
  openGraphTitle: "Wiki — Backend & data flow",
  openGraphDescription:
    "How server actions, MongoDB, and browser session line up across Community, Track, and Dashboard.",
});

export default function WikiPage() {
  return <WikiFullPage />;
}
