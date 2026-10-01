# Chunk 05: Svelte island, part 1: the Tally

**Goal:** First Svelte 5 component: a row of marks that fills in as the reader arrives (e.g. "42 car-free blocks
since 2019"). Then build the same island **by hand without Astro**, to see what Astro does for you.

**Reference:** diatour-nyt §VI.II (tally sketch in Svelte 5), §VI.VII.1 (tally template: edge cases, ArchieML
fields), §II.VI (Vue → Svelte runes mapping: `ref` → `$state`, `computed` → `$derived`, `watch` → `$effect`).

## Learn first
- [Svelte tutorial](https://svelte.dev/tutorial), the "Basic Svelte" section (runes, props, each blocks, bindings)
- [Svelte docs: `$state`, `$derived`, `$effect`, `$props`](https://svelte.dev/docs/svelte/what-are-runes)
- [Astro client directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

## Tasks
- [ ] `src/components/svelte/Tally.svelte` with props `total`, `label` and `span`.
  - [ ] The marks are `aria-hidden`. The count is **live text** in a `figcaption` (`42 car-free blocks since 2019`), so screen readers get the fact, not 42 spans.
  - [ ] Fill in when 50% visible (IntersectionObserver in `$effect`, with `disconnect` as cleanup).
  - [ ] Reduced motion: show the full count immediately.
  - [ ] Large counts (over 100) group into tens.
  - [ ] CSS grid plus a container query, so marks resize to the column.
  - [ ] Style with tokens only. Marks use `--ink` at low opacity, filled marks at full `--ink`.
- [ ] Map `tally` in `BlockRenderer.astro` → `<Tally client:visible {...block} />`.
- [ ] **No-JS fallback:** the server-rendered HTML already shows all marks filled. Animation is the enhancement. (Check: does `client:visible` server-render the component? Yes. Confirm in the page source.)
- [ ] **Under the hood exercise** (`experiments/manual-island/`): a plain Vite page that finds `<div data-island="tally" data-props='{"total":42}'>` and calls Svelte's `mount(Tally, { target, props })` when it's visible. Write 10 lines in the log comparing it with Astro's output.

## Done when
- The tally animates once, never replays on scroll back, and stops cleanly when you navigate away.
- With reduced motion on, it's full on first paint.
- The Svelte runtime downloads **only when** the tally nears the viewport (check the Network tab).

## Concepts to write about
- Runes vs Vue's composition API: the side-by-side table
- What "hydration" means, and what Astro's `<astro-island>` element is doing
- Why the count must be text, not just marks
