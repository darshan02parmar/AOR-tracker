"use client";

import Link from "next/link";
import { useState } from "react";
import { getProfileAction } from "@/app/actions/profile";
import { isValidEmail } from "@/lib/profile";
import { writeSessionEmail } from "@/lib/session-client";
import {
  IconArrowRight,
  IconCheck,
  IconMaple,
  IconWarn,
} from "./track-icons";

type Phase = "idle" | "found" | "new";

type Props = {
  email: string;
  onEmail: (v: string) => void;
  /**
   * Called when the gate concludes "this email is new   start onboarding".
   * The orchestrator switches to the 3-step flow with the email pre-filled.
   */
  onStartOnboarding: () => void;
};

/**
 * Pre-onboarding gate shown above the 3-step flow on `/track`.
 *
 * Asks for the user's email and checks if a profile already exists:
 *   - found → "Welcome back" card with a CTA to `/dashboard`. We also call
 *     `writeSessionEmail` proactively so the dashboard can hydrate from
 *     this email without re-asking.
 *   - not found → "This email isn't registered yet" card with a CTA that
 *     drops the user into Step 1 of the onboarding flow (email carried
 *     forward to Step 3).
 *
 * The lookup is performed by `getProfileAction`   same server action the
 * dashboard uses, so the answer here matches what `/dashboard` will see.
 */
export function TrackGate({ email, onEmail, onStartOnboarding }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = email.trim();

  async function handleCheck() {
    setError(null);
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setChecking(true);
    try {
      const res = await getProfileAction(trimmed);
      if (res.ok) {
        writeSessionEmail(trimmed);
        setPhase("found");
      } else {
        setPhase("new");
      }
    } catch {
      setError("Couldn't check that email   please try again.");
    } finally {
      setChecking(false);
    }
  }

  function handleStartFresh() {
    setPhase("new");
    setError(null);
  }

  return (
    <div
      className="tk-panel active"
      role="tabpanel"
      aria-label="Track gate   sign in or start a new profile"
    >
      <div className="tk-step-head">
        <div className="tk-step-num">Welcome</div>
        <div className="tk-step-title">Already tracking with AORTrack?</div>
        <div className="tk-step-desc">
          Enter your email to pick up where you left off. If you&apos;re new,
          we&apos;ll start a fresh profile in just a few steps.
        </div>
      </div>

      {/* ── Email lookup ─────────────────────────────────────────── */}
      {phase === "idle" ? (
        <>
          <div className="tk-field">
            <label className="tk-field-label" htmlFor="tk-gate-email">
              Your email
            </label>
            <input
              id="tk-gate-email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                onEmail(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCheck();
                }
              }}
              className={error ? "tk-error" : undefined}
              aria-invalid={!!error}
              disabled={checking}
            />
            <div className="tk-field-note">
              We only use your email to find your existing profile or save a
              new one. No password, no spam.
            </div>
            <div className={`tk-field-error${error ? " show" : ""}`}>
              {error ?? "\u00a0"}
            </div>
          </div>

          <div className="tk-row">
            <button
              type="button"
              className="tk-btn-secondary"
              onClick={handleStartFresh}
              disabled={checking}
            >
              I&apos;m new   start fresh
            </button>
            <button
              type="button"
              className="tk-btn tk-btn-submit"
              onClick={() => void handleCheck()}
              disabled={checking || trimmed.length === 0}
            >
              {checking ? (
                <>
                  <span className="tk-spinner" aria-hidden="true" />
                  Checking…
                </>
              ) : (
                <>
                  Continue
                  <IconArrowRight aria-hidden />
                </>
              )}
            </button>
          </div>
        </>
      ) : null}

      {/* ── Email already registered ────────────────────────────── */}
      {phase === "found" ? (
        <div
          className="tk-summary"
          role="status"
          aria-live="polite"
          style={{ marginBottom: "1.4rem" }}
        >
          <div className="tk-summary-top">
            <div>
              <div className="tk-summary-stream">
                <IconCheck aria-hidden /> Welcome back!
              </div>
              <div className="tk-summary-type">
                We found an existing profile for{" "}
                <strong>{trimmed}</strong>.
              </div>
            </div>
            <div className="tk-success-icon" aria-hidden>
              <IconMaple aria-hidden />
            </div>
          </div>
          <p className="tk-summary-body" style={{ margin: "1rem 0 0" }}>
            Head to your dashboard to see your timeline, cohort position and
            milestone updates. Or sign in with a different email below.
          </p>

          <div className="tk-row" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="tk-btn-secondary"
              onClick={() => {
                setPhase("idle");
                onEmail("");
              }}
            >
              Use a different email
            </button>
            <Link href="/dashboard" className="tk-btn tk-btn-submit">
              Go to my dashboard
              <IconArrowRight aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}

      {/* ── Email not registered   invite to start onboarding ───── */}
      {phase === "new" ? (
        <div
          className="tk-field-note warn"
          role="status"
          aria-live="polite"
          style={{ marginBottom: "1.4rem" }}
        >
          <IconWarn aria-hidden />
          <div>
            <strong>
              {trimmed
                ? "We couldn’t find a profile for that email."
                : "Starting a new profile"}
            </strong>
            <div style={{ marginTop: 4 }}>
              Let&apos;s create one   it only takes a few steps. We&apos;ll
              carry {trimmed ? "this email" : "your email"}{" "} forward to the
              last step so you don&apos;t have to retype it.
            </div>
          </div>
        </div>
      ) : null}

      {phase === "new" ? (
        <div className="tk-row">
          <button
            type="button"
            className="tk-btn-secondary"
            onClick={() => setPhase("idle")}
          >
            Back
          </button>
          <button
            type="button"
            className="tk-btn tk-btn-submit"
            onClick={onStartOnboarding}
          >
            Start onboarding
            <IconArrowRight aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
