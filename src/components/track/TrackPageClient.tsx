"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDraftProfileAction,
  getProfileAction,
  saveProfileAction,
} from "@/app/actions/profile";
import { getCohortStatsForProfileAction } from "@/app/actions/cohort";
import { emptyMilestones, isValidEmail } from "@/lib/profile";
import type { CohortStats } from "@/lib/types";
import { writeSessionEmail } from "@/lib/session-client";
import type { MilestoneEntry, MilestoneKey, UserProfile } from "@/lib/types";
import { useToast } from "@/components/ToastContext";
import type { AppType, StreamId } from "./data";
import { TrackGate } from "./TrackGate";
import { TrackHeroPanel } from "./TrackHeroPanel";
import { TrackNav } from "./TrackNav";
import { TrackStep1Application } from "./TrackStep1Application";
import { TrackStep2Milestones } from "./TrackStep2Milestones";
import { TrackStep3Review } from "./TrackStep3Review";
import { TrackStepsNav } from "./TrackStepsNav";
import { TrackSuccess } from "./TrackSuccess";

type PostAorKey = Exclude<MilestoneKey, "aor">;
type Phase = "gate" | "onboarding" | "success";

const POST_AOR_KEYS: PostAorKey[] = [
  "bil",
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
];

function blankChecked(): Record<PostAorKey, boolean> {
  return {
    bil: false,
    biometrics: false,
    background: false,
    medical: false,
    p1: false,
    p2: false,
    ecopr: false,
  };
}
function blankDates(): Record<PostAorKey, string> {
  return {
    bil: "",
    biometrics: "",
    background: "",
    medical: "",
    p1: "",
    p2: "",
    ecopr: "",
  };
}

/**
 * Top-level client for `/track`.
 *
 * Three phases:
 *   1. `gate` — `TrackGate` asks for the user's email, checks if a profile
 *      already exists via `getProfileAction`. Found → CTA to `/dashboard`.
 *      Not found → drops the user into the onboarding flow.
 *   2. `onboarding` — the 3-step form (Application → Milestones → Review).
 *      Step 3's email field is pre-populated with the email the user
 *      entered in the gate (still editable).
 *   3. `success` — `TrackSuccess` after `saveProfileAction` lands.
 *
 * After a successful save we call `writeSessionEmail` so the dashboard can
 * hydrate from the same email without re-asking. We no longer auto-hydrate
 * the form on mount from `sessionStorage` — the gate is the canonical entry
 * point. We also dropped the previous anonymous / cookie-only save path:
 * every profile is now backed by an email in MongoDB.
 */
export function TrackPageClient() {
  const router = useRouter();
  const toast = useToast();

  // ── Phase ────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("gate");

  // ── Step state (only used while phase === "onboarding") ─────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Step 1 ───────────────────────────────────────────────────────────────
  const [aorDate, setAorDate] = useState("");
  const [stream, setStream] = useState<StreamId | null>(null);
  const [appType, setAppType] = useState<AppType | null>(null);
  const [province, setProvince] = useState("");
  const [step1Errors, setStep1Errors] = useState<{
    aor?: boolean;
    stream?: boolean;
    type?: boolean;
    province?: boolean;
  }>({});

  // ── Step 2 ───────────────────────────────────────────────────────────────
  const [checked, setChecked] = useState<Record<PostAorKey, boolean>>(
    blankChecked,
  );
  const [dates, setDates] = useState<Record<PostAorKey, string>>(blankDates);

  // ── Step 3 / Gate shared email ──────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /** Step 3: same cohort document as dashboard for PPR window copy. */
  const [reviewCohort, setReviewCohort] = useState<CohortStats | null>(null);
  const [reviewCohortLoading, setReviewCohortLoading] = useState(false);

  // ── Live counter (cosmetic, matches sample) ──────────────────────────────
  const [liveCount, setLiveCount] = useState(14_827);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (Math.random() > 0.7) {
        setLiveCount((c) => c + Math.floor(Math.random() * 3) + 1);
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, []);
  const liveCountLabel = useMemo(
    () => `${liveCount.toLocaleString("en-US")} timelines live`,
    [liveCount],
  );

  useEffect(() => {
    if (step !== 3 || phase !== "onboarding") {
      return;
    }
    if (!aorDate || !stream || !appType) return;

    const prov = stream === "PNP" ? province || "Other" : province || "Ontario";
    let cancelled = false;
    const tid = window.setTimeout(() => {
      if (cancelled) return;
      setReviewCohortLoading(true);
    }, 0);
    void getCohortStatsForProfileAction({
      aorDate,
      stream,
      type: appType,
      province: prov,
    })
      .then((c) => {
        if (!cancelled) setReviewCohort(c);
      })
      .catch(() => {
        if (!cancelled) setReviewCohort(null);
      })
      .finally(() => {
        if (!cancelled) setReviewCohortLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(tid);
      window.setTimeout(() => {
        setReviewCohort(null);
        setReviewCohortLoading(false);
      }, 0);
    };
  }, [step, phase, aorDate, stream, appType, province]);

  // ── Step transitions ─────────────────────────────────────────────────────
  const goToStep = (n: 1 | 2 | 3) => {
    setStep(n);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onContinueStep1 = () => {
    const today = new Date().toISOString().split("T")[0];
    const errs: typeof step1Errors = {};
    if (!aorDate || aorDate > today) errs.aor = true;
    if (!stream) errs.stream = true;
    if (!appType) errs.type = true;
    if (stream === "PNP" && !province) errs.province = true;
    setStep1Errors(errs);
    if (Object.keys(errs).length === 0) goToStep(2);
  };

  const toggleMilestone = (key: PostAorKey) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) {
        setDates((d) => ({ ...d, [key]: "" }));
      }
      return next;
    });
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const buildProfile = (forEmail: string): UserProfile => {
    const now = new Date().toISOString();
    const milestones = emptyMilestones();
    milestones.aor = { date: aorDate, updatedAt: now };
    for (const k of POST_AOR_KEYS) {
      if (checked[k] && dates[k]) {
        milestones[k] = { date: dates[k], updatedAt: now } as MilestoneEntry;
      }
    }
    return {
      email: forEmail,
      createdAt: now,
      updatedAt: now,
      aorDate,
      stream: stream ?? "CEC General",
      type: appType ?? "Inland",
      province: province || "Ontario",
      milestones,
    };
  };

  const onSubmit = async () => {
    let valid = true;
    if (!consent) {
      setConsentError(true);
      valid = false;
    } else {
      setConsentError(false);
    }

    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }
    if (!valid) return;

    setSubmitting(true);

    try {
      const draft = await createDraftProfileAction(trimmed, {
        aorDate,
        stream: stream ?? "CEC General",
        type: appType ?? "Inland",
        province: province || "Ontario",
      });
      if (!draft.ok) {
        toast.show("Couldn't create your profile — please try again.");
        setSubmitting(false);
        return;
      }
      const profile = buildProfile(trimmed);
      const existing = await getProfileAction(trimmed);
      if (existing.ok) {
        profile.createdAt = existing.profile.createdAt;
      }
      const res = await saveProfileAction(profile);
      if (!res.ok) {
        toast.show(res.error ?? "Failed to save your profile.");
        setSubmitting(false);
        return;
      }
      writeSessionEmail(trimmed);

      setPhase("success");
      toast.show("Profile saved! Welcome to AORTrack");
    } catch (err) {
      console.error(err);
      toast.show("Something went wrong — please try again.");
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mkt-track-page flex min-h-0 flex-1 flex-col">
      <TrackNav />
      <div className="tk-page">
        <TrackHeroPanel liveCount={liveCountLabel} />

        <div className="tk-right">
          {phase === "gate" ? (
            <TrackGate
              email={email}
              onEmail={setEmail}
              onStartOnboarding={() => {
                setPhase("onboarding");
                setStep(1);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />
          ) : null}

          {phase === "onboarding" ? (
            <>
              <TrackStepsNav current={step} />

              {step === 1 ? (
                <TrackStep1Application
                  aorDate={aorDate}
                  onAorDate={setAorDate}
                  stream={stream}
                  onStream={(id) => {
                    setStream(id);
                    if (id !== "PNP") setProvince("");
                  }}
                  appType={appType}
                  onAppType={setAppType}
                  province={province}
                  onProvince={setProvince}
                  errors={step1Errors}
                  onContinue={onContinueStep1}
                />
              ) : null}

              {step === 2 ? (
                <TrackStep2Milestones
                  checked={checked}
                  dates={dates}
                  onToggle={toggleMilestone}
                  onDate={(k, v) => setDates((d) => ({ ...d, [k]: v }))}
                  onBack={() => goToStep(1)}
                  onContinue={() => goToStep(3)}
                  onSkip={() => {
                    setChecked(blankChecked());
                    setDates(blankDates());
                    goToStep(3);
                  }}
                />
              ) : null}

              {step === 3 && stream && appType ? (
                <TrackStep3Review
                  aorDate={aorDate}
                  stream={stream}
                  appType={appType}
                  province={province}
                  checked={checked}
                  dates={dates}
                  email={email}
                  emailError={emailError}
                  onEmail={(v) => {
                    setEmail(v);
                    if (emailError) setEmailError(false);
                  }}
                  consent={consent}
                  consentError={consentError}
                  onConsent={() => {
                    setConsent((c) => !c);
                    setConsentError(false);
                  }}
                  submitting={submitting}
                  onBack={() => goToStep(2)}
                  onSubmit={() => void onSubmit()}
                  cohortStats={reviewCohort}
                  cohortStatsLoading={reviewCohortLoading}
                />
              ) : null}
            </>
          ) : null}

          {phase === "success" ? <TrackSuccess /> : null}

          {phase === "success" ? (
            <button
              type="button"
              className="tk-btn-secondary"
              onClick={() => router.push("/dashboard")}
              style={{ marginTop: "1rem" }}
            >
              Go to dashboard now
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
