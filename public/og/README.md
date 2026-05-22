# Open Graph images

Add three **1200×630 PNG** files for social previews (Twitter, LinkedIn, Slack, etc.):

| File | Used on |
|------|---------|
| `home.png` | `/`, `/roadmap`, `/changelog` |
| `stream.png` | All `/streams/*` landing pages |
| `guide.png` | `/cohort`, `/aor-to-ppr`, `/vs-ircc`, `/dashboard/stats` |

Paths are wired in [`src/lib/marketing-metadata.ts`](../../src/lib/marketing-metadata.ts) and resolved via `metadataBase` in the root layout.

Until these files exist, link previews may show a broken image. Replace with on-brand artwork when ready.
