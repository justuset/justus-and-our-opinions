# Phase 2: Port to the Times-shaped stack

**Start only after Phase 1 is done** (the plain HTML/CSS/JS prototype in `prototype/index.html` passes all ten
checkpoints). Phase 2 rebuilds what you made as the production-shaped system the Times uses. See
[`../../architecture.md`](../../architecture.md):

- a **React story page** with server rendering and hydration (`apps/story`)
- **SvelteKit graphics** embedded into it (`apps/graphics`), alongside the full-page **visual essay** projects (`projects/<slug>/`)
- **ArchieML** copy, and the **diatour design system** as a shared package

The bridge already exists: `projects/the-second-draft/` is the Birdkit-style visual-essay project that Phase 1 ports into, chunk by chunk
(see [`../../project-structure.md`](../../project-structure.md)). Phase 2 chunks 07–08 generalize it.

| # | Chunk | Main skill | Where | Ships |
|---|-------|-----------|-------|-------|
| 00 | [Monorepo foundation](00-foundation.md) | Workspaces, tooling, Git | root | Story app, graphics app, shared packages, lint, CI |
| 01 | [Design system package](01-tokens-and-base-css.md) | CSS architecture, fluid type | `packages/design-system` | Diatour tokens (rem, fluid), themes, styleguide |
| 02 | [Server-rendered essay](02-static-essay.md) | React SSR, grid | `apps/story` | Article with the three-rail layout, readable without JS |
| 03 | [Content model with ArchieML](03-content-model.md) | Data modeling | `packages/archie` | `.aml` → typed blocks → `BlockRenderer` |
| 04 | [Hydration and page behaviors](04-vanilla-enhancements.md) | React hydration, Web APIs | `apps/story` | Progress, contents, share, footnotes |
| 05 | [Graphics desk and the embed pipeline: Tally](05-svelte-tally.md) | SvelteKit, SSR/hydrate | `apps/graphics` | First graphic embedded in the React page |
| 06 | [Graphic: Stat chart](06-svelte-stat-chart.md) | SVG, d3-scale | `apps/graphics` | Accessible chart + table (+ ai2html) |
| 07 | [The scroll engine and four scene types](07-svelte-scrolly.md) | Runway model in Svelte | `apps/graphics` | Slides, band, arrange, scrub (Phase 1 chunks 8–10, productionized) |
| 08 | [The visual-essay page template](08-visual-essay-template.md) | Birdkit-style full page | `apps/graphics` | Phase 1's page from ArchieML, with a parity check |
| 09 | [Product formats: Quiz and Roundtable](09-react-quiz-roundtable.md) | React 19 | `apps/story` | Accessible quiz and roundtable |
| 10 | [Media: art, video, audio](10-media.md) | Responsive media, budgets | both | `<picture>`, safe video, Listen player, preflight |
| 11 | [QA, performance, accessibility](11-qa-perf-a11y.md) | Testing, CI | root | Breakpoint matrix, axe, JS budgets |
| 12 | [Package the template](12-package-template.md) | Docs | root | "New story in 10 minutes," deploy, retro |
| 13* | [Optional: an AI-assisted newsroom tool](13-optional-ai-tool.md) | Server routes, streaming | `apps/story` | Alt-text draft reviewer |

## Milestones

| Milestone | After chunk | You can show… |
|-----------|-------------|---------------|
| **M1: It looks right** | 02 | A server-rendered essay in the diatour look, at all four layout tiers |
| **M2: It's a template** | 03 | Two stories from two `.aml` files |
| **M3: Times-shaped** | 09 | A SvelteKit graphic hydrating inside the React page next to a React quiz, plus the visual essay at parity with Phase 1 |
| **M4: It's shippable** | 12 | Green CI, a preview URL, docs a designer can follow |

Phase 2 follows the stricter rules in `/CLAUDE.md` (rem units, logical properties, enhance-after-hydrate). Where Phase 1
used measured px values, Phase 2 converts them (see `docs/layout-system.md` §1–2).
