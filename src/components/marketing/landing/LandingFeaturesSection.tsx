import { FaHeart, FaLock, FaSearch, FaUsers } from "react-icons/fa";
import {
  IconCalendar,
  IconChart,
  IconDashboard,
  IconEdit,
  IconGlobe,
  IconMessage,
} from "@/components/marketing/landing-icons";

export function LandingFeaturesSection() {
  return (
    <section className="features-section section" id="features">
      <div className="inner">
        <p className="section-eye reveal">7 Powerful Features</p>
        <h2 className="section-h2 reveal">Everything you need to navigate your PR journey.</h2>
        <p className="section-sub reveal">
          From live community data to smart alerts   all free, all open source, no signup required.
        </p>

        <div className="feat-grid">
          <div className="feat-card featured reveal">
            <div className="fc-head">
              <div className="fc-icon ico-g">
                <IconChart size={20} aria-hidden />
              </div>
              <span className="fc-label lbl-core">Live</span>
            </div>
            <div className="fc-body">
              <div className="fc-title">Live Community Feed</div>
              <div className="fc-desc">
                Real-time stream of PPR receipts, milestone updates, and processing events from
                thousands of applicants   updated as the community logs new data.
              </div>
              <div className="fc-facts">
                <div className="fc-fact">Community-reported PPR receipts in real time</div>
                <div className="fc-fact">Biometrics, medicals, BGC events tracked</div>
                <div className="fc-fact">Filter by stream, cohort month, or milestone</div>
              </div>
            </div>
          </div>

          <div className="feat-card reveal">
            <div className="fc-head">
              <div className="fc-icon ico-n">
                <IconDashboard size={20} aria-hidden />
              </div>
              <span className="fc-label lbl-core">Core</span>
            </div>
            <div className="fc-body">
              <div className="fc-title">Personal Dashboard</div>
              <div className="fc-desc">
                Your own command centre   days since AOR, your cohort rank, PPR probability trend,
                and a live breakdown of where your cohort stands today.
              </div>
              <div className="fc-facts">
                <div className="fc-fact">Days elapsed counter with cohort benchmark</div>
                <div className="fc-fact">Real-time cohort progress: PPR&apos;d vs waiting</div>
                <div className="fc-fact">Stream rank vs your cohort month</div>
              </div>
            </div>
          </div>

          <div className="feat-card reveal">
            <div className="fc-head">
              <div className="fc-icon ico-b">
                <IconCalendar size={20} aria-hidden />
              </div>
              <span className="fc-label lbl-core">Core</span>
            </div>
            <div className="fc-body">
              <div className="fc-title">PPR Window Estimator</div>
              <div className="fc-desc">
                Stop guessing. Know your earliest, most likely, and latest PPR date   calculated from
                real cohort velocity, not IRCC&apos;s generic 6-month estimate.
              </div>
              <div className="fc-facts">
                <div className="fc-fact">Earliest / Median / Latest PPR dates</div>
                <div className="fc-fact">Full milestone timeline: ITA → AOR → Medicals → PPR</div>
                <div className="fc-fact">Recalculates as new community data arrives</div>
              </div>
            </div>
          </div>

          <div className="feat-card reveal">
            <div className="fc-head">
              <div className="fc-icon ico-g">
                <IconEdit size={20} aria-hidden />
              </div>
              <span className="fc-label lbl-free">Free · No Account</span>
            </div>
            <div className="fc-body">
              <div className="fc-title">Submit Your AOR</div>
              <div className="fc-desc">
                Enter your AOR date, pick your immigration stream, and get instant cohort placement
                  in under 60 seconds, zero friction, no account needed.
              </div>
              <div className="fc-facts">
                <div className="fc-fact">CEC, FSW, FST, PNP, and more streams</div>
                <div className="fc-fact">Instant cohort rank calculation on submit</div>
                <div className="fc-fact">Anonymous by design   no PII collected</div>
              </div>
            </div>
          </div>

          <div className="feat-card reveal">
            <div className="fc-head">
              <div className="fc-icon ico-a">
                <FaUsers size={20} aria-hidden />
              </div>
              <span className="fc-label lbl-new">Deep Dive</span>
            </div>
            <div className="fc-body">
              <div className="fc-title">Cohort Analytics</div>
              <div className="fc-desc">
                Full statistical breakdown of your cohort   processing day histogram, percentile rank
                bar, and stream-vs-stream comparison to put your wait time in context.
              </div>
              <div className="fc-facts">
                <div className="fc-fact">Processing day distribution histogram</div>
                <div className="fc-fact">Your percentile on a colour-coded rank bar</div>
                <div className="fc-fact">CEC vs FSW vs PNP vs FST comparison</div>
              </div>
            </div>
          </div>

          <div className="feat-card msg-card reveal">
            <div className="fc-head">
              <div className="fc-icon ico-b">
                <IconMessage size={20} aria-hidden />
              </div>
              <span className="fc-label lbl-new">New</span>
            </div>
            <div className="fc-body">
              <div className="fc-title">Smart Alerts &amp; Messaging</div>
              <div className="fc-desc">
                Get notified the moment your cohort hits a milestone, when processing times shift, or
                when your PPR window narrows. Delivered in-app, by email, or on Discord.
              </div>
              <div className="fc-facts">
                <div className="fc-fact">Cohort milestone alerts (25% / 50% / 75% PPR&apos;d)</div>
                <div className="fc-fact">PPR window update notifications</div>
                <div className="fc-fact">In-app · Email · Discord   your choice</div>
              </div>
            </div>
          </div>

          <div className="feat-card oss-card feat-card-span reveal">
            <div className="fc-head fc-head--oss">
              <div className="fc-head-oss-row">
                <div className="fc-icon ico-p">
                  <FaLock size={20} aria-hidden />
                </div>
                <div>
                  <div className="fc-title fc-title--inline">
                    Open Source · Free Forever · Built in Public
                  </div>
                  <div className="fc-oss-sub">
                    Every line of code on GitHub · MIT licensed · No ads · No subscriptions · No data
                    selling · Community contributors welcome
                  </div>
                </div>
              </div>
              <span className="fc-label lbl-oss">MIT License</span>
            </div>
            <div className="fc-body fc-body--oss-grid">
              <div className="fc-oss-tile">
                <FaLock className="fc-oss-tile-ic" size={18} aria-hidden />
                <div className="fc-oss-tile-title">Fully Open Source</div>
                <div className="fc-oss-tile-desc">Fork it, audit it, build on it. MIT licensed.</div>
              </div>
              <div className="fc-oss-tile">
                <FaHeart className="fc-oss-tile-ic" size={18} aria-hidden />
                <div className="fc-oss-tile-title">Free Forever</div>
                <div className="fc-oss-tile-desc">No paywalls. No ads. No subscriptions. Ever.</div>
              </div>
              <div className="fc-oss-tile">
                <FaSearch className="fc-oss-tile-ic" size={18} aria-hidden />
                <div className="fc-oss-tile-title">Built in Public</div>
                <div className="fc-oss-tile-desc">Roadmap, goals, and changelog are all public.</div>
              </div>
              <div className="fc-oss-tile">
                <span className="fc-oss-tile-ic">
                  <IconGlobe size={18} aria-hidden />
                </span>
                <div className="fc-oss-tile-title">Community Data</div>
                <div className="fc-oss-tile-desc">
                  Data belongs to the community. Transparent methodology.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
