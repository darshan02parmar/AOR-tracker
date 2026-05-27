import { FaStar } from "react-icons/fa";

type LandingGrowthSectionProps = {
  profileCount: number | null;
};

export function LandingGrowthSection({ profileCount }: LandingGrowthSectionProps) {
  const timelines = profileCount != null ? profileCount.toLocaleString() : "14,847";

  return (
    <section className="growth-section growth-section--v2">
      <div className="growth-inner">
        <p className="section-eye reveal" style={{ color: "rgba(255,255,255,.35)" }}>
          Built in Public   Growth Goals
        </p>
        <h2 className="section-h2 reveal" style={{ color: "#fff" }}>
          Our 6-month targets are public and tracked.
        </h2>
        <p className="section-sub reveal" style={{ color: "rgba(255,255,255,.42)" }}>
          We believe in radical transparency. Our growth targets, Discord link, and GitHub issues are
          all public. Vote on features, file bugs, or just watch us build.
        </p>

        <div className="g-table reveal">
          <div className="gt-head">
            <div>Metric</div>
            <div>Month 1</div>
            <div>Month 3</div>
            <div className="gt-head-star">
              Month 6 <FaStar size={11} className="inline-block align-middle" aria-hidden />
            </div>
            <div>Current</div>
          </div>
          <div className="gt-row">
            <div className="gt-k">Active Timelines</div>
            <div className="gt-v">15,500</div>
            <div className="gt-v">19,000</div>
            <div className="gt-v goal">25,000</div>
            <div className="gt-v current">{timelines}</div>
          </div>
          <div className="gt-row">
            <div className="gt-k">Monthly Active Users</div>
            <div className="gt-v">8,000</div>
            <div className="gt-v">13,000</div>
            <div className="gt-v goal">22,000</div>
            <div className="gt-v current">7,412</div>
          </div>
          <div className="gt-row">
            <div className="gt-k">GitHub Stars</div>
            <div className="gt-v">50</div>
            <div className="gt-v">350</div>
            <div className="gt-v goal">1,500</div>
            <div className="gt-v current">147</div>
          </div>
          <div className="gt-row">
            <div className="gt-k">Community Issues Filed</div>
            <div className="gt-v">5</div>
            <div className="gt-v">50</div>
            <div className="gt-v goal">250</div>
            <div className="gt-v current">58</div>
          </div>
          <div className="gt-row">
            <div className="gt-k">Discord Members</div>
            <div className="gt-v">200</div>
            <div className="gt-v">800</div>
            <div className="gt-v goal">3,000</div>
            <div className="gt-v current">641</div>
          </div>
        </div>
      </div>
    </section>
  );
}
