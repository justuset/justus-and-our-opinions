# Learning log 03: Layout guide, Svelte skills, and switching to a Times-shaped stack

**Date:** 2026-10-01  **Chunk:** pre-00  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

Three requests came in together:

1. Use the **NYT layout and fluid-CSS study guide** as a reference for front-end principles.
2. Add the **Svelte skills** from [spences10/svelte-skills-kit](https://github.com/spences10/svelte-skills-kit).
3. **Use the established diatour design system, and stay as close as possible to how NYT Opinion is built.**

## What I did

### 1. The layout guide → `docs/layout-system.md`
- Saved the guide unchanged in `docs/reference/nyt-layout-and-fluid-css-guide.md`.
- Wrote `docs/layout-system.md` as a buildable spec:
  - **rem/em everywhere**, `clamp()` with a rem base (pure `vw` type fails browser zoom, WCAG 1.4.4).
  - A **derivation formula** for `clamp()` slope and intercept, worked through on the diatour headline
    (`clamp(42px, 4.4vw + 22px, 76px)` → `clamp(2.625rem, 1.375rem + 4.4vw, 4.75rem)`).
  - The guide's **three-track asymmetric grid** with its four tiers (≥1200 / 960–1199 / 768–959 / <768), written as
    em media queries, with HTML in single-column reading order.
  - **Defensive layout** (CLS, containment, logical properties) and the **Figma → Style Dictionary → rem** handoff.
- Two judgment calls are recorded in the spec:
  - The guide's grid is treated as a **model to verify** on a live page, not a measured fact.
  - The author strip goes after the dek, not above the headline as the guide suggests.

### 2. Svelte skills → `.claude/skills/`
- Cloned the repo at commit `2a9d883`. Read every `SKILL.md`, and grepped the references for anything unsafe (nothing found).
- License: the repo has **no LICENSE file**, but its manifest declares **MIT**. I vendored the files unchanged, with the MIT
  notice and provenance in `.claude/skills/README.md`.
- Vendored nine skills. Skipped `ecosystem-guide`, which is about the author's other tools.
- Wrote `CLAUDE.md` so Claude Code applies the skills with project rules on top: `{@attach}` for DOM work, tokens only, SSR-safe code.

### 3. Changing the architecture
The first plan (log 02) used **Astro with Svelte and React islands**. It's light and elegant, but **no Times page is
built that way**. Following the diatour-nyt analysis, the Times has:

| The Times | So we now have |
|-----------|----------------|
| The article page is React, server-rendered on Node and hydrated | `apps/story`: React 19 + React Router 7 framework mode, `ssr: true` |
| Graphics are built by a separate desk in Svelte/SvelteKit with ArchieML and ai2html | `apps/graphics`: SvelteKit + Svelte 5 |
| Graphics are embedded in the article | An **embed contract**: the server calls `render(props)` → HTML inlined in React. The client calls `hydrate(el, props)` |

This also made the **SvelteKit skills** relevant (preview routes, prerendering, `<svelte:boundary>`), where under
Astro they would have been dead weight. The diatour design system becomes a shared package, `packages/design-system`,
that both apps import.

I rewrote chunks 00–08 for the new stack, adjusted 09–11, and added an optional chunk 12 (an AI alt-text tool with a
person approving every draft, from guide §1 and diatour §IX).

## Concepts learned
- **Fidelity has a cost.** The Times shape means two apps, SSR and an embed seam. That's more work than Astro, but each
  seam is something a Times front-end developer actually deals with.
- **Interfaces over implementations.** We can't copy the Times's private GraphQL or graphics framework. We keep the *shape*
  (typed blocks in, server HTML out, hydrate on the client) and substitute files and scripts.
- **License hygiene.** "MIT in a manifest" is enough to vendor, but record exactly what you copied and from where.

## Next
[Chunk 00: Monorepo foundation](../plan/phase-2/00-foundation.md).
