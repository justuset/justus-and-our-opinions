# Build plan: the interactive Opinion article template

Twelve chunks, each sized for **one or two focused sessions**, plus one optional chunk. Every chunk ends with something that
works and can be committed, plus a learning-log entry. Do them in order.

The stack mirrors the Times (see [`../architecture.md`](../architecture.md)): a **React story page** with
server rendering, **SvelteKit graphics** embedded into it, **ArchieML** copy, and the **diatour design system** shared by both.

| # | Chunk | Main skill | Where | Ships |
|---|-------|-----------|-------|-------|
| 00 | [Monorepo foundation](00-foundation.md) | Workspaces, tooling, Git | root | Story app + graphics app + shared packages, lint, CI |
| 01 | [Design system package](01-tokens-and-base-css.md) | CSS architecture, fluid type | `packages/design-system` | diatour tokens (rem, fluid), themes, styleguide route |
| 02 | [Server-rendered essay](02-static-essay.md) | Semantic HTML, React SSR, grid | `apps/story` | The full article with the three-rail layout, readable without JS |
| 03 | [Content model with ArchieML](03-content-model.md) | Data modeling | `packages/archie` | `.aml` → typed blocks → `BlockRenderer` |
| 04 | [Hydration and page behaviors](04-vanilla-enhancements.md) | React hydration, Web APIs | `apps/story` | Progress, contents, share, footnotes |
| 05 | [Graphics desk and the embed pipeline: Tally](05-svelte-tally.md) | SvelteKit, Svelte 5, SSR/hydrate | `apps/graphics` | First graphic, embedded in the React page |
| 06 | [Graphic: Stat chart](06-svelte-stat-chart.md) | SVG, d3-scale, accessible charts | `apps/graphics` | Bar/slope chart + table fallback (+ optional ai2html) |
| 07 | [Graphic: Scrollytelling](07-svelte-scrolly.md) | IntersectionObserver, sticky | `apps/graphics` | Sticky graphic + step engine |
| 08 | [Product formats: Quiz and Roundtable](08-react-quiz-roundtable.md) | React 19 state, forms | `apps/story` | Accessible quiz and roundtable |
| 09 | [Media: art, video, audio](09-media.md) | Responsive media, budgets | both | `<picture>`, safe video, Listen player, preflight |
| 10 | [QA, performance, accessibility](10-qa-perf-a11y.md) | Testing, CI | root | Breakpoint matrix, axe, JS budgets in CI |
| 11 | [Package the template](11-package-template.md) | Docs, systems thinking | root | "New story in 10 minutes," deploy, retro |
| 12* | [Optional: an AI-assisted newsroom tool](12-optional-ai-tool.md) | Server routes, streaming, human review | `apps/story` | Alt-text draft reviewer |

## Milestones

| Milestone | After chunk | You can show… |
|-----------|-------------|---------------|
| **M1: It looks right** | 02 | A server-rendered essay in the diatour look, correct at all four layout tiers |
| **M2: It's a template** | 03 | Two stories from two `.aml` files, one React template |
| **M3: Times-shaped** | 08 | A SvelteKit graphic embedded and hydrating inside the React page, next to a React quiz |
| **M4: It's shippable** | 11 | Green CI, a preview URL, docs a designer can follow |

## How to work each chunk

1. **Branch:** `git switch -c chunk-NN-short-name` from `main` (in this cloud session, everything lands on `claude/wonderful-knuth-w43l2c`).
2. **Read** the "Learn first" links, and load the listed Claude **skills** (see `.claude/skills/README.md`).
3. **Build** through the checklist. Commit after each checked box (`feat(tokens): add color tokens`).
4. **Verify** against "Done when."
5. **Log** a `docs/learning-log/NN-*.md` entry.
6. **PR** with a clear title. The Times builds release notes from PR titles (diatour §VII.IV).

## Sources of truth

| Question | Answer lives in |
|----------|-----------------|
| What does it look like? | `docs/design-system.md` (diatour wins any visual conflict) |
| How does the layout flow and scale? | `docs/layout-system.md` (from the NYT layout and fluid-CSS guide) |
| How is it built? | `docs/architecture.md` |
| Why the Times does it this way | `docs/reference/` |

## Demo content

One demo story, **"Three Writers, One Question: Should cities ban cars downtown?"**. It's invented and labeled as a demo.
