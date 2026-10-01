# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo.

## What this is

A **learning project**: an interactive Opinion-style article template, built **as close as possible to how New York
Times Opinion pages are built** and styled with the **diatour design system**. `apps/story` is React 19 + React
Router 7 with Node SSR (the article template and product formats). `apps/graphics` is SvelteKit + Svelte 5 (the
graphics desk), and its graphics are embedded into the story as server-rendered fragments that hydrate. Explain
decisions as you go, and add a `docs/learning-log/NN-*.md` entry for each meaningful step.

Read first: `docs/plan/README.md` (current phase and chunk), `docs/reference/scrolly-template-breakdown.md`, `docs/architecture.md`,
`docs/design-system.md` (diatour wins visual conflicts) and `docs/layout-system.md`.

## Phase 1: the hand-built prototype (current)

- Everything lives in **one file**, `prototype/index.html` (inline `<style>` and `<script>`, assets in `prototype/assets/`). Plain HTML, CSS and JS, no frameworks, no build step.
- **One new idea per chunk**, and the chunk's browser **checkpoint must pass before the next chunk starts**. When helping, stay inside the current chunk's scope.
- Use the reference's **measured px values** (600px column, 675px header, 135svh steps) for fidelity. The rem/token conversion is Phase 2's job.
- Avoid the reference's known bugs (breakdown §19): frames written in HTML (not `innerHTML`), twin utilities that only hide, the `.js` failsafe and `.scrolly-ready` gating.
- The Phase 2 rules below apply from Phase 1 chunk 11 (Svelte port) onward.

## Phase 2 and Svelte skills

Vendored in `.claude/skills/` (see its README for provenance and license). For any `.svelte` work, load
`svelte-runes`, `svelte-template-directives` and `svelte-styling`.

Project-specific overrides:

- **Graphics are embeds.** Each graphic in `apps/graphics/src/lib/graphics/` needs a preview route and the two embed
  entries (`render` via `svelte/server`, `hydrate` via `svelte`). Follow the embed contract in `docs/architecture.md`.
  The story app only ever sees `{ graphic, props }`.
- **SvelteKit is for the desk's preview pages and builds** (prerendered, `adapter-static`). No remote functions, no server-only data.
- **SSR-safe:** everything renders on the server first. Never touch `window`, `document` or `matchMedia` at the top
  level of a component. Do it inside `$effect` or an `{@attach}` function.
- **DOM work goes in `{@attach}`** (IntersectionObserver, ResizeObserver, D3), not `$effect` with `bind:this`.
- **Style with tokens:** use `var(--token)` only, and pass values in with `style:--x={…}`. No hard-coded colors or px font sizes.
- **Every animation** checks `prefers-reduced-motion` (`src/lib/motion.ts`) and has a no-JS end state.

## Non-negotiables

- Text content must render with JavaScript disabled.
- Phase 2: rem/em units, logical properties, `clamp()` with a rem base (never pure `vw` type). Phase 1 may use measured px.
- Semantic HTML first. ARIA only when no native element exists.
- React: derived state over stored state, effects only to sync with outside systems, `ErrorBoundary` around every block and embed.
- No Times branding, logos or proprietary fonts. No committed commercial font files. The masthead is "Our Opinions."
- Demo content is invented and labeled as a demo.
- AI may assist tooling (alt-text drafts, QA). It never writes or edits the argument, and a person approves every output.

## Conventions

- Conventional Commits (`feat(tally): …`). One chunk ≈ one PR.
- Scripts (once chunk 00 lands): `npm run dev | build | check | lint | format | test | test:e2e | preflight`.
