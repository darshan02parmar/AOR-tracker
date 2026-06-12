import type {
  ChangeDot,
  ChangeItem,
  ChangeSection,
  ChangeType,
  ChangelogData,
  Unreleased,
  Version,
} from "@/components/changelog/data";
import { markdownToPlainText } from "@/lib/github-roadmap";

const GITHUB_API = "https://api.github.com";
const REVALIDATE_SECONDS = 3600;

const DEFAULT_ORG = "Get-North-Path";
const DEFAULT_REPO = "AOR-tracker";

// ─── GitHub response shapes ─────────────────────────────────────────────────

type RestRelease = {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  published_at: string | null;
  draft: boolean;
  prerelease: boolean;
};

type RestIssue = {
  number: number;
  title: string;
  pull_request?: unknown;
};

// ─── Config / HTTP ──────────────────────────────────────────────────────────

function getConfig() {
  return {
    token: process.env.GITHUB_TOKEN?.trim() ?? "",
    org: process.env.GITHUB_ORG?.trim() || DEFAULT_ORG,
    repo: process.env.GITHUB_REPO?.trim() || DEFAULT_REPO,
  };
}

async function githubRest<T>(path: string): Promise<T | null> {
  const { token } = getConfig();
  if (!token) return null;

  try {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error(`[github-changelog] REST ${path} failed: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[github-changelog] REST ${path} error:`, err);
    return null;
  }
}

// ─── Parsing (exported for tests) ───────────────────────────────────────────

const SECTION_HEADING_MAP: Record<string, ChangeType> = {
  added: "added",
  fixed: "fixed",
  changed: "changed",
  removed: "removed",
  security: "security",
  performance: "performance",
};

const DOT_BY_TYPE: Record<ChangeType, ChangeDot> = {
  added: "g",
  fixed: "r",
  changed: "b",
  removed: "m",
  security: "a",
  performance: "t",
};

const TRAILING_REF_RE =
  /\s*(?:\(\[?#(\d+)\]?\([^)]+\)\)|\(#(\d+)\))\s*$/;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Converts a single changelog bullet line to safe HTML. */
export function markdownLineToHtml(line: string): string {
  let html = escapeHtml(line.trim());
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  return html;
}

function parseBulletLine(
  rawLine: string,
  org: string,
  repo: string,
  type: ChangeType,
): ChangeItem | null {
  const line = rawLine.trim().replace(/^[-*+]\s+/, "");
  if (!line || line.startsWith("**Release PR:**")) return null;

  const refMatch = line.match(TRAILING_REF_RE);
  let htmlSource = line;
  let issue: ChangeItem["issue"];

  if (refMatch) {
    const num = Number(refMatch[1] ?? refMatch[2]);
    htmlSource = line.replace(TRAILING_REF_RE, "").trim();
    const linkMatch = line.match(/\[#(\d+)\]\(([^)]+)\)/);
    issue = {
      number: num,
      url:
        linkMatch?.[2] ??
        `https://github.com/${org}/${repo}/issues/${num}`,
    };
  }

  const html = markdownLineToHtml(htmlSource);
  if (!html) return null;

  return { html, dot: DOT_BY_TYPE[type], issue };
}

/**
 * Parses a GitHub release body (Keep a Changelog style) into sections.
 */
export function parseReleaseBodyToSections(
  body: string | null | undefined,
  org = DEFAULT_ORG,
  repo = DEFAULT_REPO,
): ChangeSection[] {
  if (!body?.trim()) return [];

  const sections: ChangeSection[] = [];
  const chunks = body.split(/^###\s+/gm);

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    const newline = chunk.indexOf("\n");
    const headingRaw =
      newline === -1 ? chunk.trim() : chunk.slice(0, newline).trim();
    const headingKey = headingRaw.toLowerCase();
    const type = SECTION_HEADING_MAP[headingKey];
    if (!type) continue;

    const content = newline === -1 ? "" : chunk.slice(newline + 1);
    const items: ChangeItem[] = [];

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("-") && !trimmed.startsWith("*")) continue;
      const item = parseBulletLine(trimmed, org, repo, type);
      if (item) items.push(item);
    }

    if (items.length > 0) {
      sections.push({ type, items });
    }
  }

  return sections;
}

function stripIntroAndSections(body: string): string {
  const firstSection = body.search(/^###\s+/m);
  const intro = firstSection === -1 ? body : body.slice(0, firstSection);
  return intro
    .split("\n")
    .filter((line) => !line.trim().startsWith("**Release PR:**"))
    .join("\n")
    .trim();
}

function extractVersionTitle(
  release: RestRelease,
  intro: string,
): string {
  const tag = release.tag_name;
  const name = release.name?.trim();
  if (name && name.toLowerCase() !== tag.toLowerCase()) {
    return name;
  }

  const firstLine = intro.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  const dashSplit = firstLine.split(/\s+[—–-]\s+/);
  if (dashSplit.length >= 2 && dashSplit[0]?.toLowerCase().includes(tag.toLowerCase())) {
    const tail = dashSplit.slice(1).join(" — ").trim();
    if (tail && !/^\w{3}\s+\d{1,2},?\s+\d{4}$/.test(tail)) {
      return tail;
    }
  }

  const plain = markdownToPlainText(intro);
  if (plain && !plain.toLowerCase().startsWith(tag.toLowerCase())) {
    return plain.length > 80 ? `${plain.slice(0, 77)}…` : plain;
  }

  return `Release ${tag}`;
}

function formatReleaseDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function versionIdFromTag(tag: string): string {
  return tag.startsWith("v") ? `v${tag.slice(1).replace(/\./g, "")}` : tag.replace(/\./g, "");
}

export function mapReleaseToVersion(
  release: RestRelease,
  options: { isLatest?: boolean; org?: string; repo?: string } = {},
): Version {
  const { org = DEFAULT_ORG, repo = DEFAULT_REPO } = options;
  const tag = release.tag_name;
  const body = release.body ?? "";
  const intro = stripIntroAndSections(body);
  const description = markdownToPlainText(intro);
  const shortDesc =
    description.length > 200 ? `${description.slice(0, 197)}…` : description;

  return {
    id: versionIdFromTag(tag),
    version: tag.startsWith("v") ? tag : `v${tag}`,
    date: release.published_at
      ? formatReleaseDate(release.published_at)
      : "—",
    title: extractVersionTitle(release, intro),
    description: shortDesc || `Changes in ${tag}.`,
    releaseUrl: `https://github.com/${org}/${repo}/releases/tag/${encodeURIComponent(tag)}`,
    isLatest: options.isLatest,
    sections: parseReleaseBodyToSections(body, org, repo),
  };
}

function nextVersionTag(latest: string): string {
  const normalized = latest.startsWith("v") ? latest.slice(1) : latest;
  const parts = normalized.split(".").map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return `v${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
  return "next";
}

function buildUnreleased(
  latestTag: string,
  openIssues: RestIssue[],
): Unreleased {
  const nextTag = nextVersionTag(latestTag);
  const items =
    openIssues.length > 0
      ? openIssues
          .slice(0, 6)
          .map((issue) => `${issue.title} (#${issue.number})`)
      : ["No open issues tracked yet — see the roadmap for planned work."];

  return {
    badge: `Unreleased — ${nextTag}`,
    title: "In Progress",
    items,
    noteHtml:
      'Track delivery on the <a href="/roadmap">Public Roadmap</a> · Push a <code>v*</code> tag to open a draft release on GitHub; publish when ready.',
  };
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

async function fetchAllReleases(): Promise<RestRelease[]> {
  const { org, repo } = getConfig();
  const all: RestRelease[] = [];
  let page = 1;

  for (;;) {
    const batch = await githubRest<RestRelease[]>(
      `/repos/${org}/${repo}/releases?per_page=100&page=${page}`,
    );
    if (!batch?.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return all;
}

async function fetchOpenIssues(): Promise<RestIssue[]> {
  const { org, repo } = getConfig();
  const issues = await githubRest<RestIssue[]>(
    `/repos/${org}/${repo}/issues?state=open&per_page=30&sort=updated`,
  );
  return (issues ?? []).filter((issue) => !issue.pull_request);
}

// ─── Public loader ──────────────────────────────────────────────────────────

export type LiveChangelogSlice = Pick<
  ChangelogData,
  "hero" | "unreleased" | "versions"
>;

/**
 * Fetch live changelog data from GitHub Releases. Returns `null` when the
 * token is missing or releases cannot be loaded.
 */
export async function loadLiveChangelogSlice(): Promise<LiveChangelogSlice | null> {
  const { token, org, repo } = getConfig();
  if (!token) {
    console.warn("[github-changelog] GITHUB_TOKEN not set — no release data");
    return null;
  }

  const [releases, openIssues] = await Promise.all([
    fetchAllReleases(),
    fetchOpenIssues(),
  ]);

  const published = releases
    .filter((r) => !r.draft && !r.prerelease && r.published_at)
    .sort(
      (a, b) =>
        new Date(b.published_at!).getTime() -
        new Date(a.published_at!).getTime(),
    );

  if (published.length === 0) {
    console.error("[github-changelog] No published releases found");
    return null;
  }

  const latest = published[0]!;
  const versions = published.map((release, idx) =>
    mapReleaseToVersion(release, {
      isLatest: idx === 0,
      org,
      repo,
    }),
  );

  return {
    hero: {
      latest: latest.tag_name.startsWith("v")
        ? latest.tag_name
        : `v${latest.tag_name}`,
      releasedAt: formatReleaseDate(latest.published_at!),
      license: "MIT",
      releaseCount: published.length,
    },
    unreleased: buildUnreleased(latest.tag_name, openIssues),
    versions,
  };
}
