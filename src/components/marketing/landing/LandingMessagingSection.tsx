import {
  FaBell,
  FaBolt,
  FaChartLine,
  FaEnvelope,
  FaInbox,
  FaRegCalendarAlt,
  FaSlidersH,
} from "react-icons/fa";
import { IconMessage } from "@/components/marketing/landing-icons";

export function LandingMessagingSection() {
  return (
    <section className="msg-section" id="messaging">
      <div className="msg-inner">
        <div className="msg-card reveal">
          <div className="msg-hd">
            <span className="msg-hd-title">Smart Alerts &amp; Messaging</span>
            <span className="msg-new">4 new</span>
          </div>
          <div className="msg-channels">
            <div className="msg-ch active">
              <FaInbox size={12} aria-hidden /> In-App
            </div>
            <div className="msg-ch">
              <FaEnvelope size={12} aria-hidden /> Email
            </div>
            <div className="msg-ch">
              <IconMessage size={12} aria-hidden /> Discord
            </div>
          </div>
          <div className="msg-alerts">
            <div className="msg-alert">
              <div className="ma-icon ma-g">
                <FaBell size={14} aria-hidden />
              </div>
              <div className="ma-body">
                <div className="ma-title">
                  Your cohort just hit 40% PPR&apos;d   you&apos;re entering the next wave
                </div>
                <div className="ma-sub">
                  CEC Jan 2024 accelerating. Window narrows to Aug–Sep 2025 based on cohort velocity.
                </div>
                <div className="ma-time">12 min ago</div>
              </div>
              <div className="ma-dot dot-unread" />
            </div>
            <div className="msg-alert">
              <div className="ma-icon ma-b">
                <FaChartLine size={14} aria-hidden />
              </div>
              <div className="ma-body">
                <div className="ma-title">CEC processing times dropped 8 days this week</div>
                <div className="ma-sub">
                  New data: median dropped 249 → 241 days. Your estimated PPR window updated.
                </div>
                <div className="ma-time">3 hrs ago</div>
              </div>
              <div className="ma-dot dot-unread" />
            </div>
            <div className="msg-alert">
              <div className="ma-icon ma-a">
                <FaBolt size={14} aria-hidden />
              </div>
              <div className="ma-body">
                <div className="ma-title">3 people from your exact cohort got PPR today</div>
                <div className="ma-sub">
                  Day 244, 247, 251   all CEC Jan 2024. You&apos;re in the same window.
                </div>
                <div className="ma-time">Yesterday</div>
              </div>
              <div className="ma-dot dot-unread" />
            </div>
            <div className="msg-alert">
              <div className="ma-icon ma-p">
                <FaRegCalendarAlt size={14} aria-hidden />
              </div>
              <div className="ma-body">
                <div className="ma-title">Your estimated PPR window updated: Sep → Aug 2025</div>
                <div className="ma-sub">Recalculated from 312 new community data points this week.</div>
                <div className="ma-time">2 days ago</div>
              </div>
              <div className="ma-dot dot-read" />
            </div>
          </div>
          <div className="msg-prefs">
            <div className="mp-head">Notification preferences</div>
            <div className="mp-toggles">
              <div className="mp-toggle">
                <div>
                  <div className="mp-label">Cohort milestone alerts</div>
                  <div className="mp-sub">When your cohort hits 25%, 50%, 75% PPR&apos;d</div>
                </div>
                <div className="mp-pill on" />
              </div>
              <div className="mp-toggle">
                <div>
                  <div className="mp-label">PPR window updates</div>
                  <div className="mp-sub">When estimated dates shift by 7+ days</div>
                </div>
                <div className="mp-pill on" />
              </div>
              <div className="mp-toggle">
                <div>
                  <div className="mp-label">Weekly digest</div>
                  <div className="mp-sub">Processing trends every Monday</div>
                </div>
                <div className="mp-pill off" />
              </div>
            </div>
          </div>
        </div>

        <div className="msg-text">
          <p className="section-eye reveal">Smart Alerts &amp; Messaging</p>
          <h2 className="section-h2 reveal">
            Know the moment
            <br />
            something changes.
          </h2>
          <p className="section-sub reveal">
            The PR process is opaque. AORTrack makes it transparent   by telling you in real time when
            your cohort accelerates, when processing times shift, and when your PPR window narrows.
          </p>
          <div className="msg-points reveal">
            <div className="mp-point">
              <div className="mpp-icon">
                <FaBell size={16} aria-hidden />
              </div>
              <div>
                <div className="mpp-title">Cohort milestone alerts</div>
                <div className="mpp-desc">
                  Get notified when your cohort hits 25%, 50%, or 75% PPR&apos;d   so you know when the
                  wave is coming before it arrives.
                </div>
              </div>
            </div>
            <div className="mp-point">
              <div className="mpp-icon">
                <FaRegCalendarAlt size={16} aria-hidden />
              </div>
              <div>
                <div className="mpp-title">PPR window updates</div>
                <div className="mpp-desc">
                  When new community data shifts your estimated PPR window by 7+ days, you&apos;ll know
                  immediately   not when you remember to check.
                </div>
              </div>
            </div>
            <div className="mp-point">
              <div className="mpp-icon">
                <FaBolt size={16} aria-hidden />
              </div>
              <div>
                <div className="mpp-title">Real-time cohort signals</div>
                <div className="mpp-desc">
                  See when people in your exact cohort   same stream, same month   are getting PPR.
                  Understand where the momentum is building.
                </div>
              </div>
            </div>
            <div className="mp-point">
              <div className="mpp-icon">
                <FaSlidersH size={16} aria-hidden />
              </div>
              <div>
                <div className="mpp-title">Your channel, your choice</div>
                <div className="mpp-desc">
                  Receive alerts where you actually read them   in-app notification, email digest, or a
                  ping in our Discord community.
                </div>
              </div>
            </div>
          </div>
          <div className="msg-channels-promo reveal">
            <span className="mcp">
              <FaInbox size={13} aria-hidden /> In-App
            </span>
            <span className="mcp">
              <FaEnvelope size={13} aria-hidden /> Email
            </span>
            <span className="mcp">
              <IconMessage size={13} aria-hidden /> Discord
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
