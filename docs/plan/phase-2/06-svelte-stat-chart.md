# Phase 2 · Chunk 06: Graphic: Stat-to-chart with a table fallback

**Goal:** A graphics-desk component that turns two to six numbers from the ArchieML doc into an accessible SVG bar or
slope chart **plus the same numbers as a table**, all from one data object, and embeds it through the chunk 05 pipeline.

**Reference:** diatour-nyt §VI.III (SVG `title`/`desc`, `<details>` table, 320px first), §VI.VII.2 (only two or three
types, D3 scales for the math only, required `source`, 3:1 contrast), §III.II and §VII.VII (ai2html).
**Skills:** `svelte-runes`, `svelte-template-directives`, `svelte-styling`; `svelte-layerchart` for the comparison task.

## Learn first
- [d3-scale](https://d3js.org/d3-scale), and only `scaleLinear` and `scaleBand`
- [W3C: Complex images](https://www.w3.org/WAI/tutorials/images/complex/), [Chartability](https://chartability.fizz.studio/)
- [ai2html docs](http://ai2html.org/) (read even if you skip the stretch)

## Tasks
- [ ] ArchieML: `{.graphic} graphic: stat-chart` with props `type: bar|slope`, `title`, `description`, `unit`, `source`, and `[.data]`.
- [ ] `StatChart.svelte`:
  - [ ] Width from `bind:clientWidth`. Design at 320px first. Scales come from `$derived`.
  - [ ] `<svg role="img" aria-labelledby>` with `<title>` and `<desc>` generated from the data.
  - [ ] Labels on the bars, values as text, marks at ≥3:1 contrast in both diatour themes.
  - [ ] `<details><summary>View as a table</summary>` with a table built from the same object (`<caption>`, `<th scope>`).
  - [ ] Source in the `figcaption`. One motion idea (bars grow) that is off under reduced motion.
- [ ] Embed entries (`stat-chart.server.ts`, `stat-chart.client.ts`) and a preview route.
- [ ] **Comparison:** rebuild one chart with LayerChart (`svelte-layerchart` skill). Compare bytes, accessibility and control in a table in the log. Keep whichever wins.
- [ ] *Stretch, the Times's Illustrator path:* make a three-artboard chart in Illustrator, export with ai2html, and embed the HTML fragment through a `graphic: ai2html` block.

## Done when
- A screen reader reads the title, description and table. Lighthouse accessibility is 100.
- The chart is legible at 320px and holds at 1440px, in the text column and at `bleed` width.

## Concepts to write about
- Scales: domain → range
- One data object → SVG, description and table
- Hand-rolled D3 vs LayerChart vs ai2html: when each fits
