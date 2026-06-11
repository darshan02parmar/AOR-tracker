import type {
  RoadmapAvatarTone,
  RoadmapCard,
  RoadmapCategory,
  RoadmapData,
  RoadmapHeroPill,
  RoadmapMilestone,
  RoadmapMilestoneState,
  RoadmapPriority,
  RoadmapStatCell,
  RoadmapStatus,
} from "@/components/marketing/roadmap/data";

const GITHUB_API = "https://api.github.com";
const REVALIDATE_SECONDS = 600;

const DEFAULT_ORG = "Get-North-Path";
const DEFAULT_REPO = "AOR-tracker";
const DEFAULT_PROJECT_NUMBER = 3;

const REPO_URL = `https://github.com/${DEFAULT_ORG}/${DEFAULT_REPO}`;
const ISSUES_URL = `${REPO_URL}/issues`;

// ─── GitHub response shapes ─────────────────────────────────────────────────

type GraphqlIssue = {
  number: number;
  title: string;
  body: string | null;
  labels: { nodes: Array<{ name: string }> };
  reactions: { totalCount: number };
  assignees: { nodes: Array<{ login: string }> };
};

type GraphqlProjectItem = {
  fieldValues: {
    nodes: Array<{
      name?: string;
      field?: { name?: string };
    }>;
  };
  content: GraphqlIssue | null;
};

type GraphqlProjectV2 = {
  title: string;
  items: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: GraphqlProjectItem[];
  };
};

type GraphqlProjectPage = {
  organization: {
    projectV2: GraphqlProjectV2 | null;
  } | null;
};

type RestRepo = {
  stargazers_count: number;
  open_issues_count: number;
};

type RestRelease = {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  published_at: string | null;
  draft: boolean;
  prerelease: boolean;
};

type RestMilestone = {
  title: string;
  description: string | null;
  due_on: string | null;
  state: "open" | "closed";
};

type RestContributor = {
  login: string;
};

// ─── Config ─────────────────────────────────────────────────────────────────

function getConfig() {
  return {
    token: process.env.GITHUB_TOKEN?.trim() ?? "",
    org: process.env.GITHUB_ORG?.trim() || DEFAULT_ORG,
    repo: process.env.GITHUB_REPO?.trim() || DEFAULT_REPO,
    projectNumber: Number(process.env.GITHUB_PROJECT_NUMBER) || DEFAULT_PROJECT_NUMBER,
  };
}

// ─── HTTP clients ───────────────────────────────────────────────────────────

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
      console.error(`[github-roadmap] REST ${path} failed: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[github-roadmap] REST ${path} error:`, err);
    return null;
  }
}

async function githubGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  const { token } = getConfig();
  if (!token) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error(`[github-roadmap] GraphQL failed: ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { data?: T; errors?: unknown[] };
    if (json.errors?.length) {
      console.error("[github-roadmap] GraphQL errors:", json.errors);
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.error("[github-roadmap] GraphQL error:", err);
    return null;
  }
}

// ─── Mappers (exported for tests) ───────────────────────────────────────────

export function mapProjectStatus(statusName: string): RoadmapStatus {
  const s = statusName.trim().toLowerCase();
  if (
    s.includes("progress") ||
    s.includes("review") ||
    s === "building"
  ) {
    return "in-progress";
  }
  if (s === "done" || s === "shipped" || s === "closed") {
    return "done";
  }
  return "planned";
}

const LABEL_CATEGORY_MAP: Record<string, RoadmapCategory> = {
  enhancement: "feat",
  feature: "feat",
  bug: "bug",
  data: "data",
  seo: "seo",
  security: "sec",
  performance: "perf",
  ux: "ux",
};

export function mapLabelsToCategories(
  labels: string[],
): RoadmapCategory[] {
  const cats = new Set<RoadmapCategory>();
  for (const label of labels) {
    const key = label.trim().toLowerCase();
    const mapped = LABEL_CATEGORY_MAP[key];
    if (mapped) cats.add(mapped);
  }
  return [...cats];
}

export function mapPriorityFromLabels(labels: string[]): RoadmapPriority {
  for (const label of labels) {
    const l = label.trim().toLowerCase();
    if (l.includes("priority: high") || l === "high priority" || l === "p0") {
      return "high";
    }
    if (l.includes("priority: low") || l === "low priority" || l === "p2") {
      return "low";
    }
    if (l.includes("priority: medium") || l === "medium priority" || l === "p1") {
      return "medium";
    }
  }
  return "medium";
}

export function buildStatsFromCards(cards: RoadmapCard[]): RoadmapStatCell[] {
  const planned = cards.filter((c) => c.status === "planned").length;
  const inProgress = cards.filter((c) => c.status === "in-progress").length;
  const done = cards.filter((c) => c.status === "done").length;
  const votes = cards
    .filter((c) => c.status !== "done")
    .reduce((sum, c) => sum + c.votes, 0);

  return [
    { value: planned, label: "Planned features" },
    { value: inProgress, label: "In progress", tone: "blue" },
    { value: done, label: "Shipped this cycle", tone: "green" },
    { value: votes, label: "Community votes", tone: "red" },
  ];
}

export function mapMilestoneState(
  state: "open" | "closed",
  isFirstOpen: boolean,
): { state: RoadmapMilestoneState; status: string } {
  if (state === "closed") {
    return { state: "reached", status: "Reached" };
  }
  if (isFirstOpen) {
    return { state: "current", status: "In Progress" };
  }
  return { state: "planned", status: "Planned" };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/**
 * Converts GitHub issue/release Markdown (and embedded HTML) to plain text
 * suitable for card descriptions.
 */
export function markdownToPlainText(raw: string | null | undefined): string {
  if (!raw) return "";

  let text = raw.replace(/\r\n/g, "\n");

  text = text.replace(/<!--[\s\S]*?-->/g, "");
  text = text.replace(/<\/(p|div|li|h[1-6]|blockquote|tr|td|th)>/gi, " ");
  text = text.replace(/<br\s*\/?>/gi, " ");
  text = text.replace(/<[^>]+>/g, "");

  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    text = text.replaceAll(entity, char);
  }
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16)),
  );
  text = text.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCodePoint(Number(dec)),
  );

  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1");
  text = text.replace(/(?<!_)_([^_]+)_(?!_)/g, "$1");
  text = text.replace(/^[\s]*[-*+]\s+/gm, "");
  text = text.replace(/^[\s]*\d+\.\s+/gm, "");
  text = text.replace(/^>\s+/gm, "");
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");

  return text.replace(/\s+/g, " ").trim();
}

function truncate(text: string, max = 200): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/** Strips MD/HTML then truncates. Optionally limits to the first paragraph. */
export function formatDescription(
  text: string | null | undefined,
  max = 200,
  firstParagraphOnly = false,
): string {
  if (!text) return "";
  const source = firstParagraphOnly
    ? (text.split(/\n\n+/)[0] ?? text)
    : text;
  return truncate(markdownToPlainText(source), max);
}

function extractStatusFromItem(item: GraphqlProjectItem): string {
  for (const fv of item.fieldValues.nodes) {
    if (fv.field?.name?.toLowerCase() === "status" && fv.name) {
      return fv.name;
    }
  }
  return "Planned";
}

const AVATAR_TONES: RoadmapAvatarTone[] = [
  "blue",
  "green",
  "amber",
  "purple",
  "red",
  "navy",
];

function mapAssignee(login: string): RoadmapCard["assignee"] {
  const initials = login.slice(0, 2).toLowerCase();
  const tone = AVATAR_TONES[login.charCodeAt(0) % AVATAR_TONES.length];
  return { initials, handle: `@${login}`, tone };
}

function formatMilestoneDate(iso: string | null): string {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function extractVersion(title: string): string {
  const match = title.match(/v?\d+\.\d+(?:\.\d+)?/i);
  return match ? (match[0].startsWith("v") ? match[0] : `v${match[0]}`) : title;
}

function parseMilestoneChips(description: string | null): string[] {
  if (!description) return [];
  const bullets = description
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 0 && l.length < 40);
  if (bullets.length > 0) return bullets.slice(0, 6);
  return description
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function relativeSyncLabel(syncedAt: Date): string {
  const diffMs = Date.now() - syncedAt.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

const PROJECT_ITEMS_QUERY = `
  query ProjectItems($org: String!, $number: Int!, $cursor: String) {
    organization(login: $org) {
      projectV2(number: $number) {
        title
        items(first: 100, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
            content {
              ... on Issue {
                number
                title
                body
                labels(first: 20) {
                  nodes { name }
                }
                reactions {
                  totalCount
                }
                assignees(first: 2) {
                  nodes { login }
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchProjectCards(): Promise<RoadmapCard[] | null> {
  const { org, projectNumber } = getConfig();
  const cards: RoadmapCard[] = [];
  let cursor: string | null = null;
  let hasProject = false;

  for (;;) {
    const data: GraphqlProjectPage | null = await githubGraphql<GraphqlProjectPage>(
      PROJECT_ITEMS_QUERY,
      {
        org,
        number: projectNumber,
        cursor,
      },
    );

    const project: GraphqlProjectV2 | null | undefined =
      data?.organization?.projectV2;
    if (!project) {
      return hasProject ? cards : null;
    }
    hasProject = true;

    for (const item of project.items.nodes) {
      const issue = item.content;
      if (!issue?.number) continue;

      const labelNames = issue.labels.nodes.map((l) => l.name);
      const status = mapProjectStatus(extractStatusFromItem(item));
      const assigneeNode = issue.assignees.nodes[0];

      cards.push({
        issue: issue.number,
        title: issue.title,
        description: formatDescription(issue.body),
        status,
        priority: mapPriorityFromLabels(labelNames),
        categories: mapLabelsToCategories(labelNames),
        votes: issue.reactions.totalCount,
        assignee: assigneeNode ? mapAssignee(assigneeNode.login) : undefined,
      });
    }

    if (!project.items.pageInfo.hasNextPage) break;
    cursor = project.items.pageInfo.endCursor;
    if (!cursor) break;
  }

  return cards;
}

async function fetchReleases(): Promise<RestRelease[]> {
  const { org, repo } = getConfig();
  const releases = await githubRest<RestRelease[]>(
    `/repos/${org}/${repo}/releases?per_page=20`,
  );
  return releases ?? [];
}

async function fetchMilestones(): Promise<RestMilestone[]> {
  const { org, repo } = getConfig();
  const milestones = await githubRest<RestMilestone[]>(
    `/repos/${org}/${repo}/milestones?state=all&per_page=20`,
  );
  return milestones ?? [];
}

function mapMilestonesFromGitHub(
  milestones: RestMilestone[],
): RoadmapMilestone[] {
  let firstOpenSeen = false;
  return milestones.map((m) => {
    const isFirstOpen = m.state === "open" && !firstOpenSeen;
    if (isFirstOpen) firstOpenSeen = true;
    const { state, status } = mapMilestoneState(m.state, isFirstOpen);
    return {
      version: extractVersion(m.title),
      date: formatMilestoneDate(m.due_on),
      status,
      state,
      title: m.title,
      description: formatDescription(m.description, 300, true),
      chips: parseMilestoneChips(m.description),
    };
  });
}

function mapMilestonesFromReleases(releases: RestRelease[]): RoadmapMilestone[] {
  return releases
    .filter((r) => !r.draft && !r.prerelease && r.published_at)
    .slice(0, 5)
    .map((r) => ({
      version: extractVersion(r.tag_name),
      date: formatMilestoneDate(r.published_at),
      status: "Reached",
      state: "reached" as const,
      title: r.name || r.tag_name,
      description: formatDescription(r.body, 300, true),
      chips: [],
    }));
}

async function fetchRepoMeta(): Promise<{
  stars: number;
  openIssues: number;
  contributors: number;
} | null> {
  const { org, repo } = getConfig();
  const [repoData, contributors] = await Promise.all([
    githubRest<RestRepo>(`/repos/${org}/${repo}`),
    githubRest<RestContributor[]>(
      `/repos/${org}/${repo}/contributors?per_page=100`,
    ),
  ]);

  if (!repoData) return null;

  return {
    stars: repoData.stargazers_count,
    openIssues: repoData.open_issues_count,
    contributors: contributors?.length ?? 0,
  };
}

function buildHeroPills(
  meta: { stars: number; openIssues: number; contributors: number },
  syncedAt: Date,
): RoadmapHeroPill[] {
  return [
    { label: "Last synced", value: relativeSyncLabel(syncedAt) },
    { label: "Open issues", value: String(meta.openIssues) },
    { label: "Contributors", value: String(meta.contributors) },
    { label: "GitHub stars", value: String(meta.stars) },
  ];
}

// ─── Public loader ──────────────────────────────────────────────────────────

export type LiveRoadmapSlice = Pick<
  RoadmapData,
  "cards" | "stats" | "milestones"
> & {
  heroPills: RoadmapHeroPill[];
};

/**
 * Fetch live roadmap data from GitHub. Returns `null` when the token is
 * missing or the project board cannot be reached. An empty project board
 * returns zero cards, not null.
 */
export async function loadLiveRoadmapSlice(): Promise<LiveRoadmapSlice | null> {
  const { token } = getConfig();
  if (!token) {
    console.warn("[github-roadmap] GITHUB_TOKEN not set — no roadmap data");
    return null;
  }

  const syncedAt = new Date();

  const [projectCards, releases, milestones, meta] = await Promise.all([
    fetchProjectCards(),
    fetchReleases(),
    fetchMilestones(),
    fetchRepoMeta(),
  ]);

  if (projectCards === null) {
    console.error("[github-roadmap] Failed to load project board");
    return null;
  }

  const cards = projectCards;
  const stats = buildStatsFromCards(cards);

  const milestoneList =
    milestones.length > 0
      ? mapMilestonesFromGitHub(milestones)
      : mapMilestonesFromReleases(releases);

  const heroPills = meta
    ? buildHeroPills(meta, syncedAt)
    : [
        { label: "Last synced", value: relativeSyncLabel(syncedAt) },
        { label: "Open issues", value: "—" },
        { label: "Contributors", value: "—" },
        { label: "GitHub stars", value: "—" },
      ];

  return { cards, stats, milestones: milestoneList, heroPills };
}

export { REPO_URL, ISSUES_URL };
