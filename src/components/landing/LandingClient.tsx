"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  FaArrowRight,
  FaExclamationTriangle,
  FaCanadianMapleLeaf,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import {
  getProfileAction,
  ensureDemoProfileAction,
} from "@/app/actions/profile";
import { getLandingHomeAction } from "@/app/actions/landing";
import { isValidEmail } from "@/lib/profile";
import { writeSessionEmail } from "@/lib/session-client";
import { useToast } from "@/components/ToastContext";
import { WebsiteLogo } from "@/components/WebsiteLogo";

function fmtCompactK(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  const s = k >= 10 ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "");
  return `${s}k`;
}

export function LandingClient() {
  const router = useRouter();
  const toast = useToast();
  const [resumeEmail, setResumeEmail] = useState("");
  const [resumeErr, setResumeErr] = useState(false);
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const [medianSample, setMedianSample] = useState<number | null>(null);
  const [ticker, setTicker] = useState<
    Awaited<ReturnType<typeof getLandingHomeAction>>["ticker"]
  >([]);

  useEffect(() => {
    void getLandingHomeAction().then((d) => {
      setProfileCount(d.profileCount);
      setMedianSample(d.medianSample);
      setTicker(d.ticker);
    });
  }, []);

  const goDashboard = useCallback(
    (email: string) => {
      writeSessionEmail(email);
      router.push("/dashboard");
    },
    [router],
  );

  const onResume = async () => {
    setResumeErr(false);
    if (!isValidEmail(resumeEmail)) {
      setResumeErr(true);
      return;
    }
    const res = await getProfileAction(resumeEmail);
    if (!res.ok) {
      setResumeErr(true);
      return;
    }
    goDashboard(resumeEmail);
    toast.show(`Welcome back, ${resumeEmail.split("@")[0]}!`);
  };

  const onDemo = async () => {
    const profile = await ensureDemoProfileAction();
    goDashboard(profile.email);
    toast.show("Demo profile loaded   saved to MongoDB for demo@aortrack.ca");
  };

  return (
    <div className="screen active flex min-h-screen flex-col">
      <div className="topbar">
        <WebsiteLogo href="/" className="logo" aria-label="AORTrack   home" />
        <span className="hidden items-center gap-1 text-[12px] text-(--t3) md:inline-flex">
          <span className="dlive" />
          {profileCount != null
            ? `${profileCount.toLocaleString()} timelines live`
            : "…"}
        </span>
        <div className="tr">
          <button type="button" className="bg" onClick={onDemo}>
            Try demo
          </button>
          <Link href="/track" className="br inline-flex no-underline">
            Track my application <FaArrowRight aria-hidden />
          </Link>
        </div>
      </div>

      <div className="hero">
        <div className="eyebrow">
          <FaCanadianMapleLeaf aria-hidden /> Free · No signup · Community
          powered
        </div>
        <h1 className="ht">
          Know exactly where you stand in your{" "}
          <span className="ac">PR journey</span>
        </h1>
        <p className="hs">
          AORTrack uses crowd-sourced data from{" "}
          {profileCount != null ? profileCount.toLocaleString() : "…"}{" "}
          applicants to show real processing timelines   not IRCC&apos;s generic
          6–8 month estimate.
        </p>
        <div className="hcta">
          <Link href="/track" className="bh no-underline">
            Track my AOR <FaArrowRight aria-hidden />
          </Link>
          <button type="button" className="bhs" onClick={onDemo}>
            See a sample dashboard
          </button>
        </div>
        <div className="hstats">
          <div>
            <div className="hsv">
              {profileCount != null ? fmtCompactK(profileCount) : " "}
            </div>
            <div className="hsl">Active timelines</div>
          </div>
          <div>
            <div className="hsv">
              {medianSample != null ? `${Math.round(medianSample)}d` : " "}
            </div>
            <div className="hsl">Avg. CEC</div>
          </div>
          <div>
            <div className="hsv">96%</div>
            <div className="hsl">Within estimate</div>
          </div>
        </div>
      </div>

      <div className="rstrip">
        <div className="rlbl">Already tracking? Resume with your email</div>
        <div className="rrow">
          <input
            className="ri"
            type="email"
            placeholder="you@email.com"
            value={resumeEmail}
            onChange={(e) => setResumeEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void onResume()}
          />
          <button type="button" className="rb" onClick={() => void onResume()}>
            Load my timeline <FaArrowRight aria-hidden />
          </button>
        </div>
        <div className={`rerr ${resumeErr ? "is-visible" : ""}`}>
          No profile found for that email.{" "}
          <Link href="/track" className="text-(--red)">
            Start tracking <FaArrowRight aria-hidden className="inline-block" />
          </Link>
        </div>
      </div>

      <div className="fg">
        <div className="fc">
          <div className="fi">
            <FaMapMarkerAlt aria-hidden />
          </div>
          <div className="ft">See your real position</div>
          <div className="fd">
            Know exactly how far you are in your cohort&apos;s queue   not a
            generic government estimate.
          </div>
        </div>
        <div className="fc">
          <div className="fi">
            <FaUsers aria-hidden />
          </div>
          <div className="ft">Cohort comparisons</div>
          <div className="fd">
            Compare milestones with applicants sharing your AOR date, stream,
            and category.
          </div>
        </div>
        <div className="fc">
          <div className="fi">
            <FaExclamationTriangle aria-hidden />
          </div>
          <div className="ft">Live issue alerts</div>
          <div className="fd">
            WES delays, IRCC tracker bugs, and anomalies reported by the
            community in real time.
          </div>
        </div>
      </div>

      <div className="tw">
        <div className="tlbl">
          <span className="dlive" />
          Live community reports
        </div>
        <div>
          {ticker.map((t) => (
            <div key={t.id} className="ti">
              <span className="ttime">{t.time}</span>
              <span className={`tbg ${t.type}`}>{t.label}</span>
              <span className="ttxt">{t.text}</span>
              <span className="tstream">{t.stream}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
