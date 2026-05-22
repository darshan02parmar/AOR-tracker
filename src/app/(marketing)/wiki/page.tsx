import type { Metadata } from "next";
import "@/styles/wiki.css";
import { WikiFullPage } from "@/components/wiki/WikiFullPage";

const CANONICAL = "https://track.getnorthpath.com/wiki";

export const metadata: Metadata = {
  title: "Wiki — Backend & data flow | AORTrack",
  description:
    "Single-page contributor docs: sessionStorage identity, Community, Track, and Dashboard server actions and MongoDB.",
  alternates: { canonical: CANONICAL },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Wiki — Backend & data flow",
    description:
      "How server actions, MongoDB, and browser session line up across Community, Track, and Dashboard.",
    url: CANONICAL,
    type: "article",
  },
};

export default function WikiPage() {
  return <WikiFullPage />;
}
