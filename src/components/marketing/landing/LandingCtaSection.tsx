import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { IconArrowRight, IconMessage } from "@/components/marketing/landing-icons";
import { DISCORD_INVITE, GH } from "./constants";

type LandingCtaSectionProps = {
  countLabel: string;
};

export function LandingCtaSection({ countLabel }: LandingCtaSectionProps) {
  return (
    <section className="cta-section">
      <div className="cta-inner">
        <div>
          <h2 className="cta-h2">
            Start tracking your PR application today.
            <br />
            It&apos;s free. It always will be.
          </h2>
          <p className="cta-sub">
            Join {countLabel} applicants using real community data   not IRCC&apos;s generic estimate.
            Open source, no signup, no ads.
          </p>
          <div className="cta-note">
            Need more than tracking?{" "}
            <a
              href="https://www.getnorthpath.com/contact?utm_source=aortrack"
              target="_blank"
              rel="noopener noreferrer"
            >
              Our consultants manage your full application from ITA to PPR <IconArrowRight />
            </a>
          </div>
        </div>
        <div className="cta-btns">
          <Link href="/track" className="btn-white">
            Track My AOR   Free <IconArrowRight />
          </Link>
          <a href={GH} target="_blank" rel="noopener noreferrer" className="btn-ghost-w mkt-btn-github-secondary">
            <FaStar size={16} aria-hidden />
            Star on GitHub
          </a>
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn-ghost-w">
            <IconMessage size={16} aria-hidden />
            Join Discord
          </a>
        </div>
      </div>
    </section>
  );
}
