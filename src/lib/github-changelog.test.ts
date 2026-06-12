import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapReleaseToVersion,
  markdownLineToHtml,
  parseReleaseBodyToSections,
} from "@/lib/github-changelog";

const SAMPLE_BODY = `v0.1.7 — Jun 11, 2026

Shipped community moderation and queue improvements.

### Added
- Community feed at \`/community\` ([#22](https://github.com/Get-North-Path/AOR-tracker/pull/22))
- BullMQ queue with rate limiting

### Fixed
- JSON repair prompt retry on malformed API response ([#65](https://github.com/Get-North-Path/AOR-tracker/issues/65))

**Release PR:** [#70](https://github.com/Get-North-Path/AOR-tracker/pull/70)
`;

describe("parseReleaseBodyToSections", () => {
  it("parses Added and Fixed headings into sections", () => {
    const sections = parseReleaseBodyToSections(SAMPLE_BODY);
    assert.equal(sections.length, 2);
    assert.equal(sections[0]?.type, "added");
    assert.equal(sections[1]?.type, "fixed");
    assert.equal(sections[0]?.items.length, 2);
    assert.equal(sections[1]?.items.length, 1);
  });

  it("extracts issue refs and converts inline code", () => {
    const sections = parseReleaseBodyToSections(SAMPLE_BODY);
    const first = sections[0]?.items[0];
    assert.match(first?.html ?? "", /<code>\/community<\/code>/);
    assert.equal(first?.issue?.number, 22);
    assert.equal(first?.dot, "g");
  });

  it("assigns red dot to fixed items", () => {
    const sections = parseReleaseBodyToSections(SAMPLE_BODY);
    assert.equal(sections[1]?.items[0]?.dot, "r");
    assert.equal(sections[1]?.items[0]?.issue?.number, 65);
  });

  it("returns empty array for blank body", () => {
    assert.deepEqual(parseReleaseBodyToSections(""), []);
    assert.deepEqual(parseReleaseBodyToSections(null), []);
  });
});

describe("markdownLineToHtml", () => {
  it("escapes HTML and applies emphasis", () => {
    const html = markdownLineToHtml('Fix <script> & **bold** `code`');
    assert.equal(
      html,
      "Fix &lt;script&gt; &amp; <strong>bold</strong> <code>code</code>",
    );
  });
});

describe("mapReleaseToVersion", () => {
  it("maps a GitHub release into the Version shape", () => {
    const version = mapReleaseToVersion(
      {
        id: 1,
        tag_name: "v0.1.7",
        name: "v0.1.7",
        body: SAMPLE_BODY,
        published_at: "2026-06-11T12:00:00Z",
        draft: false,
        prerelease: false,
      },
      { isLatest: true },
    );

    assert.equal(version.id, "v017");
    assert.equal(version.version, "v0.1.7");
    assert.equal(version.isLatest, true);
    assert.equal(version.date, "Jun 11, 2026");
    assert.equal(version.sections.length, 2);
    assert.match(version.releaseUrl, /releases\/tag\/v0\.1\.7/);
  });
});
