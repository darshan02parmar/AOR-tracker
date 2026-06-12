import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RoadmapCard } from "@/components/marketing/roadmap/data";
import {
  buildStatsFromCards,
  formatDescription,
  mapLabelsToCategories,
  mapMilestoneState,
  mapPriorityFromLabels,
  mapProjectStatus,
  markdownToPlainText,
} from "@/lib/github-roadmap";

describe("mapProjectStatus", () => {
  it("maps planned column names", () => {
    assert.equal(mapProjectStatus("Todo"), "planned");
    assert.equal(mapProjectStatus("Backlog"), "planned");
    assert.equal(mapProjectStatus("Planned"), "planned");
    assert.equal(mapProjectStatus("Up Next"), "planned");
  });

  it("maps in-progress column names", () => {
    assert.equal(mapProjectStatus("In Progress"), "in-progress");
    assert.equal(mapProjectStatus("In Review"), "in-progress");
    assert.equal(mapProjectStatus("Building"), "in-progress");
  });

  it("maps done column names", () => {
    assert.equal(mapProjectStatus("Done"), "done");
    assert.equal(mapProjectStatus("Shipped"), "done");
    assert.equal(mapProjectStatus("Closed"), "done");
  });

  it("defaults unknown statuses to planned", () => {
    assert.equal(mapProjectStatus("Icebox"), "planned");
  });
});

describe("mapLabelsToCategories", () => {
  it("maps known labels to categories", () => {
    const cats = mapLabelsToCategories(["enhancement", "bug", "unknown"]);
    assert.deepEqual(cats, ["feat", "bug"]);
  });

  it("deduplicates categories", () => {
    const cats = mapLabelsToCategories(["feature", "enhancement"]);
    assert.deepEqual(cats, ["feat"]);
  });
});

describe("mapPriorityFromLabels", () => {
  it("detects high priority", () => {
    assert.equal(mapPriorityFromLabels(["priority: high"]), "high");
    assert.equal(mapPriorityFromLabels(["P0"]), "high");
  });

  it("detects low priority", () => {
    assert.equal(mapPriorityFromLabels(["priority: low"]), "low");
  });

  it("defaults to medium", () => {
    assert.equal(mapPriorityFromLabels(["enhancement"]), "medium");
  });
});

describe("buildStatsFromCards", () => {
  const cards: RoadmapCard[] = [
    {
      issue: 1,
      title: "A",
      description: "",
      status: "planned",
      priority: "high",
      categories: ["feat"],
      votes: 10,
    },
    {
      issue: 2,
      title: "B",
      description: "",
      status: "in-progress",
      priority: "medium",
      categories: ["bug"],
      votes: 5,
    },
    {
      issue: 3,
      title: "C",
      description: "",
      status: "done",
      priority: "low",
      categories: [],
      votes: 0,
    },
  ];

  it("counts cards by status and sums votes on non-done", () => {
    const stats = buildStatsFromCards(cards);
    assert.equal(stats[0].value, 1);
    assert.equal(stats[0].label, "Planned features");
    assert.equal(stats[1].value, 1);
    assert.equal(stats[1].tone, "blue");
    assert.equal(stats[2].value, 1);
    assert.equal(stats[2].tone, "green");
    assert.equal(stats[3].value, 15);
    assert.equal(stats[3].tone, "red");
  });
});

describe("markdownToPlainText", () => {
  it("strips markdown bold and user-story formatting", () => {
    const raw =
      "**As a** community member, **I want** a roadmap, **So that** I can vote.";
    assert.equal(
      markdownToPlainText(raw),
      "As a community member, I want a roadmap, So that I can vote.",
    );
  });

  it("strips HTML from GitHub issue bodies", () => {
    const raw =
      '<p class="isSelectedEnd"><span>As an applicant</span></p><p><span>I want access</span></p>';
    assert.equal(
      markdownToPlainText(raw),
      "As an applicant I want access",
    );
  });

  it("converts links and inline code to readable text", () => {
    const raw = "See [docs](https://example.com) and use `fetch()` here.";
    assert.equal(
      markdownToPlainText(raw),
      "See docs and use fetch() here.",
    );
  });
});

describe("formatDescription", () => {
  it("truncates after stripping markdown", () => {
    const raw = "**Hello** " + "world ".repeat(50);
    const result = formatDescription(raw, 40);
    assert.ok(result.length <= 40);
    assert.ok(result.startsWith("Hello"));
    assert.ok(!result.includes("**"));
  });

  it("uses only the first paragraph when requested", () => {
    const raw = "**First** paragraph.\n\nSecond paragraph.";
    assert.equal(
      formatDescription(raw, 200, true),
      "First paragraph.",
    );
  });
});

describe("mapMilestoneState", () => {
  it("maps closed milestones to reached", () => {
    const r = mapMilestoneState("closed", false);
    assert.equal(r.state, "reached");
    assert.equal(r.status, "Reached");
  });

  it("maps first open milestone to current", () => {
    const r = mapMilestoneState("open", true);
    assert.equal(r.state, "current");
    assert.equal(r.status, "In Progress");
  });

  it("maps subsequent open milestones to planned", () => {
    const r = mapMilestoneState("open", false);
    assert.equal(r.state, "planned");
    assert.equal(r.status, "Planned");
  });
});
