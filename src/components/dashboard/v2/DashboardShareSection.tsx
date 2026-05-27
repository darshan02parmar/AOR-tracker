"use client";

import { DN_SHARE, type DnShare } from "./data";
import { useDashboardV2Ui } from "./DashboardV2Context";
import { IconCopy, IconGithub, IconWhatsapp } from "./dashboard-icons";

/**
 * On-page Share card (Section `share-sec`).
 *
 * Sample reference: <div id="share-sec"> in `aortrack-dashboard.html`.
 *
 * `share` defaults to the seed `DN_SHARE`; the live `/dashboard` passes the
 * `shareUrl` returned by `ensureShareTokenForEmailAction`. When a fetch
 * error is supplied via `error`, the share buttons are disabled and the
 * error text is shown in place of the URL.
 */
export function DashboardShareSection({
  share = DN_SHARE,
  error,
}: {
  share?: DnShare;
  error?: string | null;
} = {}) {
  const { showToast } = useDashboardV2Ui();
  const disabled = !!error || !share.shareUrl;

  const onCopy = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(share.shareUrl);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Could not copy   please copy manually");
    }
  };

  const onWhatsapp = () => {
    if (disabled) return;
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Tracking my PR journey on AORTrack: ${share.shareUrl}`,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onGithub = () => {
    window.open(share.githubUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="share-sec">
      <div className="sec-head">
        <div>
          <div className="sec-title">Share My Journey</div>
          <div className="sec-sub">
            Read-only link   no personal data exposed
          </div>
        </div>
      </div>
      <div className="share-card">
        <div className="share-card-label">
          {error ? "Couldn't load your shareable link:" : "Your shareable profile link:"}
        </div>
        <div className="share-url">
          {error ?? (share.shareUrlDisplay || "Preparing your public link…")}
        </div>
        <div className="share-btns">
          <button
            type="button"
            className="sh-btn copy"
            onClick={onCopy}
            disabled={disabled}
          >
            <IconCopy aria-hidden />
            Copy Link
          </button>
          <button
            type="button"
            className="sh-btn wa"
            onClick={onWhatsapp}
            disabled={disabled}
          >
            <IconWhatsapp aria-hidden />
            WhatsApp
          </button>
          <button type="button" className="sh-btn gh" onClick={onGithub}>
            <IconGithub aria-hidden />
            Star on GitHub
          </button>
        </div>
      </div>
    </section>
  );
}
