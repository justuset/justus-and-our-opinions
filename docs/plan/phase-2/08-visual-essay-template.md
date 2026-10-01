# Phase 2 · Chunk 08: The visual-essay page template (Birdkit-style full page)

**Goal:** A second page type, the **visual essay**: a full-page interactive built entirely in the graphics app, the way
the Times graphics desk ships immersive pieces. It rebuilds every non-scrolly part of the reference template (header with twin art
and intro, prose column, two-up, connector diagram, credits) and composes them with the chunk 07 scenes, all driven by one
ArchieML file and styled with the diatour system.

**Reference (read first):** [`docs/reference/scrolly-template-breakdown.md`](../../reference/scrolly-template-breakdown.md)
§1–9 (anatomy, tokens, column math, bleed, twins, header, body, two-up, diagram), §17–18 (breakpoints, motion) and §20–21
(our mapping, the designer checklist). `docs/architecture.md`, "Two page types." `docs/layout-system.md` §1–2 (rem, clamp).
**Skills:** `svelte-runes`, `svelte-template-directives`, `svelte-styling`, `sveltekit-structure` (routes, prerender), `sveltekit-data-flow` (`load`).

## Learn first
- [SvelteKit: `load` and prerendering](https://svelte.dev/docs/kit/load), [page options](https://svelte.dev/docs/kit/page-options)
- [ai2html: artboards](http://ai2html.org/#artboards) (the design source for "visibility twins")
- [MDN: `document.fonts.ready`](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/ready)

## Tasks

### Route and content
- [ ] `apps/graphics/src/routes/essays/[slug]/+page.server.ts`: read `content/visual-essays/<slug>.aml` with `@opinion/archie`, `prerender = true`.
- [ ] ArchieML front matter: `headline`, `dek`, `byline`, `date`, `theme: dark|light`, `headlineStyle: stacked-caps|display`, `bodyFace: sans|serif`, `[+body]` blocks.
- [ ] Block types: `text`, `header-art`, `two-up`, `process`, `scrolly` (chunk 07), `credits`. Add them to the `@opinion/archie` union with validation.
- [ ] `VisualEssayRenderer.svelte` maps block types to components (the Svelte version of the React `BlockRenderer`).

### Components (`apps/graphics/src/lib/essay/`)
- [ ] **Column system:** add `--gutter: clamp(0.625rem, 12.5vw, 3.0625rem)`, `--w-body: 37.5rem`, `--col: min(100% − 2·gutter, var(--w-body))` to the design system.
  Check the column widths against breakdown §3 (240 / 281 / 600px at 320 / 375 / 800).
- [ ] **`Prose.svelte`:** `.g-text` paragraphs at `width: var(--col); margin: 0 auto`. Diatour `--step-body` by default. With `bodyFace: serif`, use
  `clamp(1.125rem, …, 1.25rem)` and `line-height: 1.5` to match the reference's 18/27 → 20/30.
- [ ] **`.bleed` utility** (`margin-inline: calc(50% − 50vw)` plus `html { overflow-x: clip }`). No transform, so fixed descendants are safe.
- [ ] **`Twin.svelte`:** `{@render mobile()}` / `{@render desktop()}` snippets, switching at **64em (1024px)**. The twin utilities live in `@layer utilities`
  declared **last** (fixes breakdown #3). Raster art uses `ArtImage.svelte` (`<picture>` with `<source media>`, so only one file downloads).
- [ ] **`VisualHeader.svelte`:**
  - [ ] Fixed `42.1875rem` (675px) height with a `90px`-equivalent top margin. `67vh` below 22.5em. **Explicit** `position: relative` (fixes #11).
  - [ ] Copy positioned absolutely: `top: 12%` on phones, vertically centered at ≥64em.
  - [ ] `stacked-caps` headline: uppercase, `max-width: 6ch` on phones and `12ch` at ≥64em, `clamp(4.5rem, 1.2rem + 5.5vw, 6rem)` (a rem version of the measured 72→96px).
  - [ ] Height-driven art crop (`svg { block-size: 100%; inline-size: auto }`) through `Twin`.
  - [ ] Intro: add `is-ready` after `document.fonts.ready`, inside an `{@attach}`. 0.8s `--ease-intro`, dek +0.2s. The server render is **already visible**, and the intro hides-then-reveals only once JS is running (no invisible headline when JS fails).
- [ ] **`TwoUp.svelte`:** valid markup (`<figure class="two-up">` holding two images and one `<figcaption>`). Column → row at 40em. Shared caption on its own row. Capped at 90em with 4rem padding at ≥78.125em.
- [ ] **`ProcessDiagram.svelte`:** an `<ol>` of nodes (fixes #8). One column on phones. At ≥64em, a `repeat(4, 1fr)` stage capped at 75rem.
  Connectors drawn from live geometry in an `{@attach}` ResizeObserver: quadratic curves with alternating ±40 lift and an arrowhead (breakdown §9). `aria-hidden` SVG.
- [ ] **`Byline.svelte`, `Credits.svelte`:** diatour byline pattern. Credits in `--faint`.
- [ ] Diatour mapping (breakdown §20): `--paper`/`--ink` replace `#fff`/`#313036`, `--soft`/`--faint` for captions, `--font-display` for the headline.

### Demo and parity
- [ ] `content/visual-essays/scrolly-demo.aml`: the reference template's structure and placeholder copy, labeled as a demo.
- [ ] A **parity check** script (Playwright): load the reference HTML and our `/essays/scrolly-demo` at 320, 375, 800, 1024, 1280 and 1440, and
  compare column width, header height, headline size, two-up direction, diagram width and runway heights against breakdown §2–10. Record the table in the log.
- [ ] *Bridge:* from the React essay, link to the visual essay, and embed one scene in the React essay to prove the two page types share components.

## Done when
- The parity table matches the reference within ±1px (font-metric differences excepted) at all six widths, or each difference is explained.
- Twins: exactly **one** header art visible at 375 and at 1280 (the reference shows two).
- No-JS and failed-JS runs show the headline, every paragraph, both two-up images, the diagram as a list, and every scrolly step.
- Lighthouse: accessibility 100, CLS < 0.05, and no layout shift from the header intro.

## Concepts to write about
- Two page types at a news org: the template article vs the bespoke interactive, and who builds each
- Visibility twins vs one responsive asset: when re-composition beats reflow
- Converting measured px values into a rem/clamp system without losing fidelity
