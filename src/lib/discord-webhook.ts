import { humanizeCohortKey } from "@/lib/cohort";
import { MILESTONE_DEFS } from "@/lib/constants";
import type { MilestoneKey } from "@/lib/types";

/** Allow headroom on serverless (cold start + Discord latency). */
const WEBHOOK_TIMEOUT_MS = 10_000;

const COLOR_PROFILE = 0x5865f2;
const COLOR_COHORT_OPS = 0xfee75c;

/** Community milestone tag → embed accent (site palette). */
const COMMUNITY_MS_COLOR: Record<string, number> = {
  ecopr: 0x22c55e,
  p1: 0x8b5cf6,
  p2: 0x7c3aed,
  bil: 0x3b82f6,
  bg: 0x1e5f8c,
  med: 0x0d9488,
};
const COLOR_COMMUNITY_REPLY = 0x5865f2;

export type DiscordEmbedPayload = {
  title: string;
  description?: string;
  color: number;
  timestamp?: string;
  url?: string;
  footer?: { text: string };
  author?: { name: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
};

function communityPageUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return `${explicit.replace(/\/$/, "")}/community`;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}/community`;
  return "https://aortrack.ca/community";
}

function truncateForDiscord(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

async function postDiscordEmbedsTo(
  url: string,
  embeds: DiscordEmbedPayload[],
): Promise<void> {
  const body = JSON.stringify({
    embeds: embeds.map((e) => ({
      title: e.title,
      ...(e.description ? { description: e.description } : {}),
      color: e.color,
      timestamp: e.timestamp ?? new Date().toISOString(),
      ...(e.url ? { url: e.url } : {}),
      ...(e.footer ? { footer: e.footer } : {}),
      ...(e.author ? { author: e.author } : {}),
      ...(e.fields?.length ? { fields: e.fields } : {}),
    })),
  });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(
        "[discord-webhook] non-OK response",
        res.status,
        res.statusText,
        text.slice(0, 500),
      );
    }
  } catch (e) {
    console.warn("[discord-webhook] request failed", e);
  } finally {
    clearTimeout(timer);
  }
}

async function postDiscordEmbeds(
  embeds: DiscordEmbedPayload[],
): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!url) return;
  await postDiscordEmbedsTo(url, embeds);
}

function getCommunityDiscordWebhookUrl(): string | null {
  return process.env.COMMUNITY_DISCORD_WEBHOOK_URL?.trim() || null;
}

function shouldSkipDiscordForEmail(emailNorm: string): boolean {
  if (emailNorm === "demo@aortrack.ca") return true;
  if (emailNorm.startsWith("aortracker.demo.")) return true;
  return false;
}

export function milestoneLabelForKey(key: string): string {
  return MILESTONE_DEFS.find((d) => d.key === key)?.label ?? key;
}

export type DiscordProfileMeta = {
  seededData?: boolean;
  caseNo?: string;
  username?: string;
};

export type DiscordNotifyPayload =
  | ({
      kind: "profile_saved";
      email: string;
      cohortKey: string;
      stream: string;
      type: string;
      province: string;
      aorDate: string;
    } & DiscordProfileMeta)
  | ({
      kind: "milestone";
      email: string;
      cohortKey: string;
      stream: string;
      type: string;
      province: string;
      milestoneKey: MilestoneKey;
      milestoneLabel: string;
      date: string | null;
    } & DiscordProfileMeta);

function baseDescriptionLines(payload: {
  email: string;
  stream: string;
  type: string;
  province: string;
  cohortKey: string;
  seededData?: boolean;
  caseNo?: string;
  username?: string;
}): string[] {
  const human = humanizeCohortKey(payload.cohortKey);
  const lines = [
    `**Seeded:** ${payload.seededData === true ? "Yes" : payload.seededData === false ? "No" : " "}`,
    `**Email:** ${payload.email}`,
  ];
  if (payload.caseNo?.trim()) lines.push(`**Case #:** ${payload.caseNo.trim()}`);
  if (payload.username?.trim()) lines.push(`**Username:** ${payload.username.trim()}`);
  lines.push(
    `**Stream:** ${payload.stream}`,
    `**Type:** ${payload.type}`,
    `**Province:** ${payload.province}`,
    `**Cohort key:** \`${payload.cohortKey}\``,
    `**Cohort:** ${human}`,
  );
  return lines;
}

function embedTitle(payload: DiscordNotifyPayload): string {
  switch (payload.kind) {
    case "profile_saved":
      return "Profile saved (onboarding / update)";
    case "milestone":
      return "Milestone updated";
  }
}

function embedDescription(payload: DiscordNotifyPayload): string {
  const lines = baseDescriptionLines(payload);
  if (payload.kind === "profile_saved") {
    const aor = payload.aorDate?.trim();
    lines.push(`**AOR date:** ${aor || " "}`);
  }
  if (payload.kind === "milestone") {
    const dateLine = payload.date?.trim() ? payload.date : "cleared";
    lines.push(
      `**Milestone:** ${payload.milestoneLabel} (\`${payload.milestoneKey}\`)`,
    );
    lines.push(`**Date:** ${dateLine}`);
  }
  return lines.join("\n");
}

export async function notifyDiscordProfileEvent(
  payload: DiscordNotifyPayload,
): Promise<void> {
  if (shouldSkipDiscordForEmail(payload.email)) return;
  await postDiscordEmbeds([
    {
      title: embedTitle(payload),
      description: embedDescription(payload),
      color: COLOR_PROFILE,
    },
  ]);
}

export type DiscordNewCohortPayload = {
  cohortKey: string;
  triggerEmail: string;
  stream: string;
  type: string;
  province: string;
  aorDate: string;
  seededData?: boolean;
  caseNo?: string;
  username?: string;
};

export type DiscordCecSeedSummaryPayload = {
  excelPath: string;
  rowsRead: number;
  upserted: number;
  modified: number;
  skipped: number;
  errorCount: number;
  cohortKeysTouched: string[];
  cohortsUpserted?: number;
  calibrationMedian?: number;
  discordEach: boolean;
};

export async function notifyDiscordCecSeedSummary(
  p: DiscordCecSeedSummaryPayload,
): Promise<void> {
  const cohortList =
    p.cohortKeysTouched.length <= 12
      ? p.cohortKeysTouched.map((k) => `\`${k}\``).join(", ")
      : `${p.cohortKeysTouched.slice(0, 12).map((k) => `\`${k}\``).join(", ")} … (+${p.cohortKeysTouched.length - 12} more)`;

  const description = [
    "**CEC Excel import finished** (`seededData: true`   team tracking label).",
    "",
    `**File:** \`${p.excelPath}\``,
    `**Rows read:** ${p.rowsRead}`,
    `**Upserted:** ${p.upserted} · **Modified:** ${p.modified} · **Skipped:** ${p.skipped}`,
    p.errorCount > 0 ? `**Parse errors:** ${p.errorCount} (see API response)` : "",
    p.cohortsUpserted != null
      ? `**Cohort stats upserted:** ${p.cohortsUpserted}`
      : "",
    p.calibrationMedian != null
      ? `**Calibration median (days):** ${Math.round(p.calibrationMedian)}`
      : "",
    "",
    `**Cohort keys:** ${cohortList || " "}`,
    p.discordEach
      ? "_Per-row profile webhooks were also sent (`discord=each`)._"
      : "_Per-row webhooks omitted (default). Use `?cec=1&discord=each` only for small tests._",
  ]
    .filter(Boolean)
    .join("\n");

  await postDiscordEmbeds([
    {
      title: "CEC seed complete",
      description,
      color: COLOR_COHORT_OPS,
    },
  ]);
}

/** Ops alert: first profile tied to a cohort key that had no `cohort_stats` row yet. */
export async function notifyDiscordNewCohortPlaceholder(
  p: DiscordNewCohortPayload,
): Promise<void> {
  if (shouldSkipDiscordForEmail(p.triggerEmail)) return;

  const human = humanizeCohortKey(p.cohortKey);
  const description = [
    "A **placeholder** `cohort_stats` document was inserted because this cohort key did not exist yet.",
    "",
    `**Seeded:** ${p.seededData === true ? "Yes" : p.seededData === false ? "No" : " "}`,
    `**Cohort key:** \`${p.cohortKey}\``,
    `**Cohort:** ${human}`,
    `**Profile (trigger):** ${p.triggerEmail}`,
    p.caseNo?.trim() ? `**Case #:** ${p.caseNo.trim()}` : "",
    p.username?.trim() ? `**Username:** ${p.username.trim()}` : "",
    `**Stream / type / province:** ${p.stream} · ${p.type} · ${p.province}`,
    `**AOR date:** ${p.aorDate?.trim() || " "}`,
    "",
    "**Next step:** run the cohort stats sync / aggregation job so medians, `n_verified`, and charts reflect real profiles.",
  ].join("\n");

  await postDiscordEmbeds([
    {
      title: "New cohort   placeholder stats row",
      description,
      color: COLOR_COHORT_OPS,
    },
  ]);
}

export type DiscordCommunityPostPayload = {
  kind: "milestone" | "reply";
  authorEmail: string;
  authorName: string;
  authorInitials: string;
  meta: string;
  ms: string;
  msLabel: string;
  body: string;
  stream: string;
  type: string;
  province: string;
  caseNo?: string;
  username?: string;
  replyTo?: { name: string; snippet: string };
};

/** Public community feed   separate webhook (`COMMUNITY_DISCORD_WEBHOOK_URL`). */
export async function notifyDiscordCommunityPost(
  payload: DiscordCommunityPostPayload,
): Promise<void> {
  const url = getCommunityDiscordWebhookUrl();
  if (!url) return;
  if (shouldSkipDiscordForEmail(payload.authorEmail)) return;

  const isReply = payload.kind === "reply";
  const msColor =
    COMMUNITY_MS_COLOR[payload.ms] ?? (isReply ? COLOR_COMMUNITY_REPLY : 0x2d6a4f);
  const color = isReply ? COLOR_COMMUNITY_REPLY : msColor;

  const message = truncateForDiscord(payload.body, 900);
  const fields: NonNullable<DiscordEmbedPayload["fields"]> = [
    {
      name: "📧 Email",
      value: payload.authorEmail,
      inline: false,
    },
    {
      name: isReply ? "💬 Reply tag" : "🏷️ Milestone",
      value: `**${payload.msLabel}**`,
      inline: true,
    },
    {
      name: "📋 Cohort meta",
      value: truncateForDiscord(payload.meta || " ", 256),
      inline: true,
    },
  ];

  if (payload.caseNo?.trim()) {
    fields.push({
      name: "🔖 Case #",
      value: payload.caseNo.trim(),
      inline: true,
    });
  }
  if (payload.username?.trim()) {
    fields.push({
      name: "👤 Username",
      value: payload.username.trim(),
      inline: true,
    });
  }

  fields.push(
    {
      name: "🌊 Stream · Type · Province",
      value: `${payload.stream} · ${payload.type} · ${payload.province}`,
      inline: false,
    },
    {
      name: "✉️ Message",
      value: message ? `\`\`\`\n${message}\n\`\`\`` : "_ _",
      inline: false,
    },
  );

  if (payload.replyTo) {
    fields.push({
      name: "↩️ In reply to",
      value: `**${truncateForDiscord(payload.replyTo.name, 80)}**\n> ${truncateForDiscord(payload.replyTo.snippet, 200)}`,
      inline: false,
    });
  }

  const title = isReply
    ? "New community reply"
    : "New milestone update";

  const description = isReply
    ? "Someone replied on the **AORTrack Community** feed."
    : "Someone shared a milestone on the **AORTrack Community** feed.";

  await postDiscordEmbedsTo(url, [
    {
      title,
      description,
      color,
      url: communityPageUrl(),
      author: {
        name: `${payload.authorInitials} · ${payload.authorName}`,
      },
      fields,
      footer: { text: "AORTrack Community · Open the feed →" },
    },
  ]);
}
