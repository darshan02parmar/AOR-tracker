"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  IconArrowRight,
  IconArrowUp,
  IconArrowDown,
  IconBolt,
  IconCalendar,
  IconChart,
  IconCheck,
  IconDashboard,
  IconEdit,
  IconGlobe,
  IconGraduation,
  IconMaple,
  IconStar,
  IconMountain,
  IconTrophy,
} from "@/components/marketing/landing-icons";
import { FaCheck, FaGithub, FaHeart, FaRegCalendarAlt } from "react-icons/fa";
import { GH } from "./constants";

type LandingHeroSectionProps = {
  profileCount: number | null;
};

const HERO_SCENES = 4;
const HERO_CARD_DURATION_MS = 4200;

const heroCardLabels: { num: string; name: string; sub: string }[] = [
  { num: "View 1 of 4", name: "Live Community Feed", sub: "Real-time PPR reports from applicants" },
  { num: "View 2 of 4", name: "Personal Dashboard", sub: "Your cohort rank, days in queue & PPR probability" },
  { num: "View 3 of 4", name: "Submit Your AOR", sub: "Free · No account · Instant cohort placement" },
  { num: "View 4 of 4", name: "PPR Window Estimator", sub: "Earliest, median & latest PPR date" },
];

const heroCardTabs = [
  { label: "Live Feed", Icon: IconChart },
  { label: "Dashboard", Icon: IconDashboard },
  { label: "Submit AOR", Icon: IconEdit },
  { label: "PPR Timeline", Icon: IconCalendar },
] as const;

const heroStreamOptions = [
  { name: "CEC", avg: "Avg 241 days", Icon: IconBolt, selected: true },
  { name: "FSW", avg: "Avg 267 days", Icon: IconGlobe, selected: false },
  { name: "FST", avg: "Avg 284 days", Icon: IconGraduation, selected: false },
  { name: "PNP", avg: "Avg 312 days", Icon: IconMountain, selected: false },
] as const;

function LandingHeroMovingCards() {
  const [scene, setScene] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const startProgress = useCallback(() => {
    const fill = fillRef.current;
    if (!fill) return;
    fill.style.transition = "none";
    fill.style.width = "0%";
    void fill.offsetWidth;
    fill.style.transition = `width ${HERO_CARD_DURATION_MS}ms linear`;
    fill.style.width = "100%";
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setScene((current) => (current >= HERO_SCENES ? 1 : current + 1));
    }, HERO_CARD_DURATION_MS);
  }, [clearTimer]);

  useEffect(() => {
    startProgress();
  }, [scene, startProgress]);

  useEffect(() => {
    startAuto();
    return () => clearTimer();
  }, [startAuto, clearTimer]);

  const onTab = (nextScene: number) => {
    clearTimer();
    setScene(nextScene);
    startAuto();
  };

  return (
    <div className="mkt-ha-card" aria-label="AORTrack product preview">
      <div className="mkt-ha-tabs">
        {heroCardTabs.map(({ label, Icon }, i) => (
          <button
            key={label}
            type="button"
            className={`mkt-ha-tab ${scene === i + 1 ? "active" : ""}`}
            onClick={() => onTab(i + 1)}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>
      <div className="mkt-ha-progress">
        <div ref={fillRef} />
      </div>
      <div className="mkt-ha-stage">
        <div className={`mkt-ha-scene mkt-ha-s1 ${scene === 1 ? "vis" : ""}`}>
          <div className="mkt-ha-s1-head">
            <span className="mkt-ha-s1-title">Express Entry   Live Tracker</span>
            <span className="mkt-ha-s1-live">
              <span className="mkt-ha-live-dot" />
              Updated 3 min ago
            </span>
          </div>
          <div className="mkt-ha-s1-stats">
            <div className="mkt-ha-s1-stat">
              <div className="mkt-ha-s1-val">14,847</div>
              <div className="mkt-ha-s1-lbl">Applicants</div>
            </div>
            <div className="mkt-ha-sep" />
            <div className="mkt-ha-s1-stat">
              <div className="mkt-ha-s1-val">247</div>
              <div className="mkt-ha-s1-lbl">Avg Days</div>
            </div>
            <div className="mkt-ha-sep" />
            <div className="mkt-ha-s1-stat">
              <div className="mkt-ha-s1-val">68%</div>
              <div className="mkt-ha-s1-lbl">PPR&apos;d</div>
            </div>
          </div>
          <div className="mkt-ha-s1-bar-wrap">
            <div className="mkt-ha-s1-bar-row">
              <span>Applicants who received PPR</span>
              <strong>39.2%</strong>
            </div>
            <div className="mkt-ha-track">
              <div className="mkt-ha-fill" />
            </div>
            <div className="mkt-ha-note">Based on verified data points · illustrative demo</div>
          </div>
          <div className="mkt-ha-feed">
            <div className="mkt-ha-row">
              <div className="mkt-ha-dot green" />
              <div className="mkt-ha-text">
                <strong>Ahmed R.</strong> received PPR   Day 198 · CEC
              </div>
              <span className="mkt-ha-badge">2 min ago</span>
            </div>
            <div className="mkt-ha-row">
              <div className="mkt-ha-dot blue" />
              <div className="mkt-ha-text">
                <strong>Priya S.</strong> submitted AOR   FSW
              </div>
              <span className="mkt-ha-badge">11 min ago</span>
            </div>
            <div className="mkt-ha-row">
              <div className="mkt-ha-dot amber" />
              <div className="mkt-ha-text">
                <strong>Wei C.</strong> medicals request   Day 143
              </div>
              <span className="mkt-ha-badge">24 min ago</span>
            </div>
          </div>
        </div>

        <div className={`mkt-ha-scene mkt-ha-s2 ${scene === 2 ? "vis" : ""}`}>
          <div className="mkt-ha-s2-nav">
            <div className="mkt-ha-logo">A</div>
            <span className="mkt-ha-brand">AORTrack</span>
            <div className="mkt-ha-s2-sep" />
            <span className="mkt-ha-page">My Dashboard</span>
            <div className="mkt-ha-pill">
              <span className="mkt-ha-live-dot" />
              Live
            </div>
          </div>
          <div className="mkt-ha-s2-body">
            <div className="mkt-ha-s2-top">
              <div className="mkt-ha-days-box">
                <div className="mkt-ha-days-n">247</div>
                <div className="mkt-ha-days-lbl">Days since AOR</div>
              </div>
              <div className="mkt-ha-mini-grid">
                <div className="mkt-ha-mini-card">
                  <div className="mkt-ha-mini-lbl">Stream</div>
                  <div className="mkt-ha-mini-val green">CEC</div>
                  <div className="mkt-ha-mini-sub">Canadian Exp. Class</div>
                </div>
                <div className="mkt-ha-mini-card">
                  <div className="mkt-ha-mini-lbl">Cohort Rank</div>
                  <div className="mkt-ha-mini-val amber">Top 28%</div>
                  <div className="mkt-ha-mini-sub">of Jan &apos;24 cohort</div>
                </div>
                <div className="mkt-ha-mini-card">
                  <div className="mkt-ha-mini-lbl">Avg PPR Day</div>
                  <div className="mkt-ha-mini-val">262</div>
                  <div className="mkt-ha-mini-sub">
                    <IconArrowUp size={9} /> 4 days this week
                  </div>
                </div>
              </div>
            </div>
            <div className="mkt-ha-cohort-card">
              <div className="mkt-ha-cohort-head">
                <span>Cohort Breakdown</span>
                <span>Jan 2024</span>
              </div>
              {[
                ["Got PPR", "5,812 / 14,847", "39", "green"],
                ["Medicals Requested", "3,204", "22", "blue"],
                ["Still Waiting", "5,831", "39", "amber"],
              ].map(([name, value, width, tone]) => (
                <div key={name} className="mkt-ha-cohort-row">
                  <div className="mkt-ha-cohort-line">
                    <span>{name}</span>
                    <span>{value}</span>
                  </div>
                  <div className="mkt-ha-cohort-track">
                    <div className={`mkt-ha-cohort-fill ${tone}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`mkt-ha-scene mkt-ha-s3 ${scene === 3 ? "vis" : ""}`}>
          <div className="mkt-ha-s3-head">
            <div className="mkt-ha-s3-icon">
              <IconMaple size={15} />
            </div>
            <div>
              <div className="mkt-ha-s3-title">Track My AOR</div>
              <div className="mkt-ha-s3-sub">Enter your details   see your position instantly</div>
            </div>
          </div>
          <div className="mkt-ha-s3-body">
            <div className="mkt-ha-steps">
              <div className="mkt-ha-step done">
                <IconCheck size={11} />
              </div>
              <div className="mkt-ha-step-line done" />
              <div className="mkt-ha-step active">2</div>
              <div className="mkt-ha-step-line" />
              <div className="mkt-ha-step">3</div>
            </div>
            <div>
              <div className="mkt-ha-field-label">Immigration Stream</div>
              <div className="mkt-ha-stream-grid">
                {heroStreamOptions.map(({ name, avg, Icon, selected }) => (
                  <div key={name} className={`mkt-ha-stream-opt ${selected ? "sel" : ""}`}>
                    <div className="mkt-ha-stream-icon">
                      <Icon />
                    </div>
                    <div className="mkt-ha-stream-name">{name}</div>
                    <div className="mkt-ha-stream-avg">{avg}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mkt-ha-form-row">
              <div className="mkt-ha-field">
                <label>AOR Date</label>
                <input value="2024-01-08" readOnly />
              </div>
              <div className="mkt-ha-field">
                <label>ITA Date</label>
                <input placeholder="YYYY-MM-DD" readOnly />
              </div>
            </div>
            <Link href="/track" className="mkt-ha-submit">
              Calculate My PPR Window <IconArrowRight />
            </Link>
          </div>
        </div>

        <div className={`mkt-ha-scene mkt-ha-s4 ${scene === 4 ? "vis" : ""}`}>
          <div className="mkt-ha-s4-head">
            <span>Your PPR Window   CEC · Jan 2024</span>
            <span>247 days in</span>
          </div>
          <div className="mkt-ha-ppr">
            <div className="mkt-ha-ppr-label">Estimated PPR window (based on your cohort)</div>
            <div className="mkt-ha-ppr-row">
              <div>
                <strong>Jun &apos;25</strong>
                <span>Earliest</span>
              </div>
              <div className="mid">
                <strong>Aug &apos;25</strong>
                <span>Most Likely</span>
              </div>
              <div>
                <strong>Nov &apos;25</strong>
                <span>Latest</span>
              </div>
            </div>
          </div>
          <div className="mkt-ha-timeline">
            {[
              ["done", "ITA Received", "Invitation to Apply · Express Entry pool", "Dec 14, 2023"],
              ["done", "AOR Received", "Application received by IRCC", "Jan 08, 2024"],
              ["now", "Medicals / Biometrics", "Background checks in progress", "In progress   Day 247"],
              ["wait", "PPR   Passport Request", "Final step before PR approval", "Pending"],
            ].map(([state, title, desc, date]) => (
              <div key={title} className="mkt-ha-tl-row">
                <div className={`mkt-ha-tl-dot ${state}`}>
                  {state === "wait" ? (
                    <IconTrophy size={12} />
                  ) : state === "now" ? (
                    <IconArrowRight size={12} />
                  ) : (
                    <IconCheck size={12} />
                  )}
                </div>
                <div>
                  <div className="mkt-ha-tl-name">{title}</div>
                  <div className="mkt-ha-tl-desc">{desc}</div>
                  <div className="mkt-ha-tl-date">{date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mkt-ha-label">
        {heroCardLabels.map((label, i) => (
          <div key={label.num} className={`mkt-ha-label-wrap ${scene === i + 1 ? "vis" : ""}`}>
            <span>{label.num}</span>
            <strong>{label.name}</strong>
            <small>{label.sub}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingHeroSection({ profileCount }: LandingHeroSectionProps) {
  const countStr =
    profileCount != null ? profileCount.toLocaleString() : "thousands of";
  const liveLabel =
    profileCount != null ? `${profileCount.toLocaleString()} Applicants Live` : "Live community data";

  return (
    <section className="mkt-landing-hero mkt-landing-hero--v2">
      <div className="mkt-hero-grid-bg" aria-hidden />
      <IconMaple className="mkt-hero-watermark" size={160} />
      <div className="hero-inner">
        <div className="mkt-hero-copy mkt-hero-col">
          <div className="mkt-hero-badges">
            <span className="mkt-hb mkt-hb-oss">
              <FaGithub size={10} aria-hidden />
              Open Source · MIT
            </span>
            <span className="mkt-hb mkt-hb-free">
              <FaHeart size={10} aria-hidden />
              Free Forever · No Ads
            </span>
            <span className="mkt-hb mkt-hb-live">
              <span className="mkt-hb-dot" aria-hidden />
              {liveLabel}
            </span>
          </div>

          <h1 className="hero-h1">
            Know exactly where
            <br />
            your <em>PR stands.</em>
          </h1>
          <p className="hero-sub">
            Real processing timelines from {countStr}{" "} Express Entry applicants   not IRCC&apos;s
            generic estimate. Community-powered, open-source, and free forever.
          </p>

          <div className="mkt-hero-os-strip">
            <a href={GH} target="_blank" rel="noopener noreferrer" className="mkt-hos-item mkt-hos-oss">
              <FaGithub size={11} aria-hidden />
              Open Source on GitHub
            </a>
            <span className="mkt-hos-item mkt-hos-free">
              <FaHeart size={11} aria-hidden />
              Free Forever
            </span>
            <span className="mkt-hos-item mkt-hos-nosig">
              <FaCheck size={11} aria-hidden />
              No Signup Required
            </span>
            <span className="mkt-hos-item">MIT Licensed</span>
          </div>

          <div className="hero-actions">
            <Link href="/track" className="btn-hero btn-red">
              Track My AOR   Free <IconArrowRight />
            </Link>
            <Link href="/#features" className="btn-hero btn-outline">
              See All Features <IconArrowDown size={14} />
            </Link>
            <a
              href={GH}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hero btn-outline mkt-btn-github-secondary mkt-btn-hero-gh"
            >
              <IconStar size={14} />
              Star on GitHub
            </a>
          </div>

          <div className="mkt-hero-trust">
            <span className="mkt-ht mkt-ht-oss">
              <FaGithub size={12} aria-hidden />
              Open Source (MIT)
            </span>
            <span className="mkt-ht mkt-ht-free">
              <FaHeart size={12} aria-hidden />
              Free Forever · No Ads
            </span>
            <span className="mkt-ht">
              <FaCheck size={12} aria-hidden />
              No signup required
            </span>
            <span className="mkt-ht">
              <IconChart size={12} aria-hidden />
              {profileCount != null
                ? `${profileCount.toLocaleString()} data points`
                : "Community data points"}
            </span>
            <span className="mkt-ht">
              <FaRegCalendarAlt size={12} aria-hidden />
              Updated daily
            </span>
          </div>
        </div>

        <div className="mkt-hero-col mkt-hero-col--card">
          <LandingHeroMovingCards />
        </div>
      </div>
    </section>
  );
}
