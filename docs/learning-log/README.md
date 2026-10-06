# Learning log

One entry per meaningful step. Each entry covers what was planned, what actually happened, what broke, and the
concepts it taught.

**Entries are a record, not a manual.** Each one describes the project as it was that day. When a later step replaces
something an entry describes, the entry gets a **"Later changes"** note at the top pointing to what replaced it, rather
than being rewritten. For how things work *now*, see [`docs/project-structure.md`](../project-structure.md). To set up a
GitHub repo yourself, see the manual walkthrough [`docs/guides/github-repo-from-scratch.md`](../guides/github-repo-from-scratch.md).

**Read it as one page:** `npm run log:page` (from the repo root) builds every entry plus the setup guide into
`tools/learning-log-page/dist/learning-log.html`, in the diatour-nyt-frontend layout. The published copy is the
[Our Opinions Learning Log](https://claude.ai/artifact/Tr7wUETfCzxzzhmcgtJVD7) artifact. See [`tools/learning-log-page/`](../../tools/learning-log-page/README.md).

| # | Entry | Date |
|---|-------|------|
| 01 | [Repo setup, first commit and README](01-repo-setup.md) | 2026-10-01 |
| 02 | [Researching the reference and writing the plan](02-research-and-plan.md) | 2026-10-01 |
| 03 | [Layout guide, Svelte skills, and switching to a Times-shaped stack](03-times-shaped-stack.md) | 2026-10-01 |
| 04 | [The scrolly template breakdown and the two-phase plan](04-scrolly-breakdown-and-two-phase-plan.md) | 2026-10-01 |
| 05 | [Phase 1, chunk 1: skeleton and content model](05-chunk-1-skeleton.md) | 2026-10-01 |
| 06 | [Phase 1, chunk 2: tokens and the text column](06-chunk-2-tokens-and-column.md) | 2026-10-01 |
| 07 | [Phase 1, chunk 3: full-bleed breakout](07-chunk-3-full-bleed.md) | 2026-10-01 |
| 08 | [Phase 1, chunk 4: the header](08-chunk-4-header.md) | 2026-10-01 |
| 09 | [Phase 1, chunk 5: intro motion](09-chunk-5-intro-motion.md) | 2026-10-01 |
| 10 | [The Birdkit-style story project](10-birdkit-story-project.md) | 2026-10-01 |
| 11 | [Phase 1, chunk 6: two-up images and twins](11-chunk-6-two-up-and-twins.md) | 2026-10-01 |
| 12 | [Phase 1, chunk 7: the connector diagram](12-chunk-7-connector-diagram.md) | 2026-10-01 |
| 13 | [Phase 1, chunk 8: the scroll engine](13-chunk-8-scroll-engine.md) | 2026-10-01 |
| 14 | [Phase 1, chunk 9: the three scroll sections](14-chunk-9-three-scroll-sections.md) | 2026-10-01 |
| 15 | [Phase 1, chunk 10: scrubbed Lottie and hardening](15-chunk-10-scrub-and-hardening.md) | 2026-10-01 |
| 16 | [Phase 1, chunk 11: finishing the port and proving parity](16-chunk-11-port-and-parity.md) | 2026-10-01 |
| 17 | [Phase 1 retro](17-phase-1-retro.md) | 2026-10-01 |
| 18 | [Phase 2, chunk 00: the monorepo foundation](18-phase-2-chunk-00-foundation.md) | 2026-10-02 |
| 19 | [Checking the build against the NYT sandbox blueprint](19-nyt-sandbox-blueprint-review.md) | 2026-10-02 |
| 20 | [NYT sandbox S1: the `body` document](20-s1-body-document.md) | 2026-10-02 |
| 21 | [NYT sandbox S2: the platform shell](21-s2-platform-shell.md) | 2026-10-02 |
| 22 | [The first pull request, and making `main` the default](22-first-pr-and-default-branch.md) | 2026-10-02 |
| 23 | [NYT sandbox S3: breakpoints and themes](23-s3-breakpoints-and-themes.md) | 2026-10-02 |
| 24 | [NYT sandbox S4: `StickyScroller` on ScrollTrigger](24-s4-sticky-scroller-on-scrolltrigger.md) | 2026-10-02 |
| 25 | [NYT sandbox S4b: the measured page shell](25-s4b-measured-page-shell.md) | 2026-10-02 |
| 26 | [`projects/the-second-draft` → `projects/interactive`](26-rename-to-interactive.md) | 2026-10-02 |
| 27 | [The page shell in diatour dark](27-shell-in-diatour-dark.md) | 2026-10-02 |
| 28 | [A photo essay template](28-photo-essay-template.md) | 2026-10-02 |
| 29 | [`npm run photos`: WebP renditions](29-photo-renditions.md) | 2026-10-02 |
| 30 | [Shared code in `projects/birdkit-kit/`](30-birdkit-kit.md) | 2026-10-02 |
| 31 | [Photo essay colors and type from token files](31-photo-essay-tokens.md) | 2026-10-05 |
| 32 | [The essay header from Figma](32-figma-essay-header.md) | 2026-10-05 |
| 33 | [G1, color roles with `light-dark()`](33-g1-color-roles.md) | 2026-10-05 |
| 34 | [G2, the size scales and rules](34-g2-scales.md) | 2026-10-05 |
| 35 | [G3, typography roles](35-g3-type-roles.md) | 2026-10-05 |
| 36 | [The photo essay in the reference page's React components](36-react-photo-essay.md) | 2026-10-05 |
| 37 | [Svelte for interactives, React for the photo essay](37-svelte-interactive-react-photo-essay.md) | 2026-10-05 |
| 38 | [The React app on the tpl.css color roles](38-react-on-tpl-color-roles.md) | 2026-10-05 |
| 40 | [Aligning the React photo essay with the reference article's structure](40-align-with-reference-article.md) | 2026-10-05 |

## Entry template

```markdown
# Learning log NN: <title>

**Date:**  **Chunk:**  **Branch / PR:**

## Goal
## What I did (commands, files)
## What broke and how I fixed it
## Concepts learned
## What I'd do differently
## Next
```
