import "@/styles/marketing-core.css";
import "@/styles/guides.css";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNav } from "@/components/marketing/MarketingNav";

export default function MarketingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <MarketingNav />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <MarketingFooter />
    </div>
  );
}
