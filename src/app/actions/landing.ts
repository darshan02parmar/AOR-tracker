"use server";

import { getDb } from "@/lib/db";

export type LandingTickerItem = {
  id: string;
  time: string;
  type: "ecopr" | "p1" | "p2" | "bil" | "bg" | "med";
  label: string;
  text: string;
  stream: string;
};

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function relativeTime(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function msToTickerType(ms: string): LandingTickerItem["type"] {
  if (ms === "ecopr") return "ecopr";
  if (ms === "p1") return "p1";
  if (ms === "p2") return "p2";
  if (ms === "bil") return "bil";
  if (ms === "med") return "med";
  return "bg";
}

function msToLabel(ms: string): string {
  if (ms === "ecopr") return "eCOPR";
  if (ms === "p1") return "P1";
  if (ms === "p2") return "P2";
  if (ms === "bil") return "BIL";
  if (ms === "med") return "Med";
  return "BGC";
}

export async function getLandingHomeAction(): Promise<{
  profileCount: number;
  medianSample: number;
  ticker: LandingTickerItem[];
}> {
  const db = await getDb();

  const profileCount = await db.collection("profiles").countDocuments();

  const cohortDoc =
    (await db
      .collection("cohort_stats")
      .findOne({ cohortKey: "CEC:2:2025:inland" })) ??
    (await db.collection("cohort_stats").findOne({}));

  const medianSample =
    typeof cohortDoc?.median_days_to_ppr === "number"
      ? cohortDoc.median_days_to_ppr
      : 184;

  const posts = await db
    .collection("community_posts")
    .find({ approved: true, replyToId: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(8)
    .toArray();

  const ticker: LandingTickerItem[] = posts.map((doc) => {
    const ms = (doc.ms as string) ?? "bg";
    const body = String(doc.body ?? "");
    const bodyIsHtml = doc.bodyIsHtml !== false;
    const textRaw = bodyIsHtml ? stripHtml(body) : body.trim();
    const text =
      textRaw.length > 110 ? `${textRaw.slice(0, 107)}…` : textRaw || String(doc.msl ?? "");
    const meta = String(doc.meta ?? "");
    const stream = meta.split("·")[0]?.trim() || "—";
    const createdAt =
      doc.createdAt instanceof Date ? doc.createdAt : new Date(String(doc.createdAt));

    return {
      id: String(doc._id),
      time: relativeTime(createdAt),
      type: msToTickerType(ms),
      label: msToLabel(ms),
      text,
      stream,
    };
  });

  return { profileCount, medianSample, ticker };
}
