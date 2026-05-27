import { FaCodeBranch, FaHandshake, FaHeart, FaLock, FaSearch, FaStar } from "react-icons/fa";
import { IconGitHub } from "@/components/marketing/landing-icons";
import { GH } from "./constants";

export function LandingOssSection() {
  return (
    <section className="oss-section" id="opensource">
      <div className="oss-inner">
        <div className="reveal">
          <p className="section-eye" style={{ color: "rgba(255,255,255,.55)" }}>
            Open Source · MIT
          </p>
          <h2 className="section-h2" style={{ color: "#fff" }}>
            Built in public.
            <br />
            <em style={{ fontStyle: "italic", color: "#c4b5fd" }}>Owned by everyone.</em>
          </h2>
          <p className="section-sub" style={{ color: "rgba(255,255,255,.7)", marginBottom: "2rem" }}>
            AORTrack is fully open source   every line of code is on GitHub, every decision is made in
            public, and every feature is driven by the community. No black boxes. No corporate agenda.
          </p>
          <div className="oss-feats">
            <div className="oss-feat">
              <div className="oss-ic">
                <FaLock size={18} aria-hidden />
              </div>
              <div>
                <div className="oss-ft">MIT Licensed</div>
                <div className="oss-fb">
                  Use it, fork it, build on it. The code belongs to everyone, forever.
                </div>
              </div>
            </div>
            <div className="oss-feat">
              <div className="oss-ic">
                <FaHeart size={18} aria-hidden />
              </div>
              <div>
                <div className="oss-ft">Free Forever   No Ads, No Selling Data</div>
                <div className="oss-fb">
                  AORTrack products are ad-free. We will never sell your data or put features behind a
                  paywall.
                </div>
              </div>
            </div>
            <div className="oss-feat">
              <div className="oss-ic">
                <FaSearch size={18} aria-hidden />
              </div>
              <div>
                <div className="oss-ft">Public Roadmap &amp; Changelog</div>
                <div className="oss-fb">
                  Growth targets, feature plans, and every release are tracked in the open. No hidden
                  surprises.
                </div>
              </div>
            </div>
            <div className="oss-feat">
              <div className="oss-ic">
                <FaHandshake size={18} aria-hidden />
              </div>
              <div>
                <div className="oss-ft">Community Governed</div>
                <div className="oss-fb">
                  Features are prioritised by community votes. File issues, submit PRs, and shape the
                  roadmap yourself.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal">
          <div className="gh-card">
            <div className="gh-bar">
              <div className="gh-repo">
                <IconGitHub />
                Get-North-Path / AOR-tracker
              </div>
              <div className="gh-meta">
                <span className="mkt-inline-icon">
                  <FaStar size={11} aria-hidden />
                  147
                </span>
                <span className="mkt-inline-icon">
                  <FaCodeBranch size={11} aria-hidden />
                  12
                </span>
                <span>MIT</span>
              </div>
            </div>
            <div className="gh-issue">
              <div className="gh-dot-iss dot-open" />
              <div className="gh-issue-body">
                <div className="gh-it">Add CEC STEM stream processing data</div>
                <div className="gh-im">opened 2 days ago · 8 comments</div>
              </div>
              <span className="gh-lbl l-feat">enhancement</span>
            </div>
            <div className="gh-issue">
              <div className="gh-dot-iss dot-merged" />
              <div className="gh-issue-body">
                <div className="gh-it">Messaging system: Discord + Email notifications</div>
                <div className="gh-im">merged 5 days ago · PR #84</div>
              </div>
              <span className="gh-lbl l-data">feature</span>
            </div>
            <div className="gh-issue">
              <div className="gh-dot-iss dot-open" />
              <div className="gh-issue-body">
                <div className="gh-it">Cohort histogram: add &quot;you are here&quot; marker</div>
                <div className="gh-im">opened 1 week ago · 14 comments</div>
              </div>
              <span className="gh-lbl l-ux">UX</span>
            </div>
            <div className="gh-issue">
              <div className="gh-dot-iss dot-open" />
              <div className="gh-issue-body">
                <div className="gh-it">Fix: Atlantic Immigration avg days calculation</div>
                <div className="gh-im">opened 3 days ago · 3 comments</div>
              </div>
              <span className="gh-lbl l-bug">bug</span>
            </div>
            <div className="gh-contrib">
              <div className="gh-avs">
                <div className="gh-av" style={{ background: "#2D6A4F" }}>
                  GK
                </div>
                <div className="gh-av" style={{ background: "#1E5F8C" }}>
                  PV
                </div>
                <div className="gh-av" style={{ background: "#B5651D" }}>
                  MR
                </div>
                <div className="gh-av" style={{ background: "#5B21B6" }}>
                  JS
                </div>
                <div className="gh-av" style={{ background: "#0D7377" }}>
                  +8
                </div>
              </div>
              <div className="gh-contrib-txt">
                <strong>12 contributors</strong> have shipped code. PRs welcome.
              </div>
              <a href={GH} target="_blank" rel="noopener noreferrer" className="gh-star-btn">
                <FaStar size={12} aria-hidden /> Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
