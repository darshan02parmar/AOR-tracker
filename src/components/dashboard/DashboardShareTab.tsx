"use client";

import {
  FaImage,
  FaCanadianMapleLeaf,
  FaRedditAlien,
  FaWhatsapp,
} from "react-icons/fa";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/ToastContext";
import { fmtDate } from "@/lib/format";

export function DashboardShareTab() {
  const toast = useToast();
  const { email, profile, days, median, pct, ppr, shareUrl, shareLinkError } =
    useDashboard();

  return (
    <>
      <div className="mb-3.5 text-lg font-bold text-[var(--w)]">
        Share your timeline
      </div>
      <div className="sharewrap">
        <div className="sprev">
          <div className="spflag">
            <FaCanadianMapleLeaf aria-hidden />
          </div>
          <div className="sptit">{email.split("@")[0]}&apos;s PR Timeline</div>
          <div className="spsub">
            {profile.stream} · {profile.province} ·{" "}
            {fmtDate(profile.aorDate) || "—"} AOR · Day {days}
            {median > 0 ? ` of ~${median}` : ""}
          </div>
          <div className="spstats">
            <div>
              <div className="spsv">{days}</div>
              <div className="spsl">Days elapsed</div>
            </div>
            <div>
              <div className="spsv red">{ppr?.p50Approx ?? "—"}</div>
              <div className="spsl">Est. PPR</div>
            </div>
            <div>
              <div className="spsv">{pct}%</div>
              <div className="spsl">Journey done</div>
            </div>
          </div>
        </div>
        <div className="urlbox">
          <input
            className="urltxt"
            readOnly
            value={
              shareLinkError
                ? shareLinkError
                : shareUrl || "Preparing your public link…"
            }
            aria-label="Public share URL"
          />
          <button
            type="button"
            className="urlcopy"
            disabled={!shareUrl || !!shareLinkError}
            onClick={() => {
              void navigator.clipboard.writeText(shareUrl);
              toast.show("Link copied to clipboard!");
            }}
          >
            Copy link
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-[var(--t3)]">
          Anyone with the link can view this read-only snapshot — no sign-in
          required.
        </p>
        <div className="shopts">
          <button
            type="button"
            className="shopt"
            onClick={() => toast.show("WhatsApp deep link (placeholder)")}
          >
            <FaWhatsapp aria-hidden /> WhatsApp
          </button>
          <button
            type="button"
            className="shopt"
            onClick={() => toast.show("Reddit format (placeholder)")}
          >
            <FaRedditAlien aria-hidden /> Reddit
          </button>
          <button
            type="button"
            className="shopt"
            onClick={() => toast.show("PNG export (placeholder)")}
          >
            <FaImage aria-hidden /> Save image
          </button>
        </div>
      </div>
    </>
  );
}
