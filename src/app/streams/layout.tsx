import type { ReactNode } from "react";
import "@/styles/marketing-core.css";
import { StreamsNav } from "@/components/marketing/StreamsNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function StreamsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <StreamsNav />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <MarketingFooter />
    </div>
  );
}
