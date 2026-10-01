# Chunk 06: Svelte island, part 2: Stat-to-chart with a table fallback

**Goal:** A small chart component that turns two to six numbers in the ArchieML doc into an accessible SVG bar or
slope chart, **plus the same numbers as a real table**, all from one data object so they can't drift apart.

**Reference:** diatour-nyt §VI.III (SVG with `title`/`desc`, `<details>` table, 320px first), §VI.VII.2
(two or three chart types only, D3 scales for the math only, required `source` field, 3:1 contrast),
§II "D3 is mostly two scales".

## Learn first
- [d3-scale](https://d3js.org/d3-scale) (`scaleLinear`, `scaleBand`), and only that module
- [W3C: Complex images](https://www.w3.org/WAI/tutorials/images/complex/), [MDN: SVG `<desc>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/desc)
- [LayerCake](https://layercake.graphics/) (read it, decide whether you need it, and write why in the log)
- [Chartability](https://chartability.fizz.studio/) heuristics

## Tasks
- [ ] ArchieML block: `{.chart}` with `type: bar|slope`, `title`, `description`, `unit`, `source`, and a `[.data]` list of `label` / `value` (and `then` / `now` for slope).
- [ ] `src/components/svelte/StatChart.svelte`:
  - [ ] `npm i d3-scale`. Import **only** `scaleLinear` and `scaleBand`.
  - [ ] Width from `bind:clientWidth` on a wrapper (Svelte's built-in ResizeObserver), designed at 320px first.
  - [ ] `<svg role="img" aria-labelledby="t d">` with `<title>` and `<desc>` generated from the data.
  - [ ] Labels **on** the bars (no legend). Values as text. Marks at 3:1 contrast or better against `--paper` in both themes.
  - [ ] `<details><summary>View as a table</summary><table>` built from the same object, with `<caption>` and `<th scope>`.
  - [ ] `<figcaption>` with the source. **No source = the build fails** (chunk 03 validation).
  - [ ] One motion idea: bars grow from 0 on first view, disabled under reduced motion.
- [ ] Render the chart in the demo story.

## Done when
- VoiceOver/NVDA reads the title, description and the table.
- Charts are legible at 320px and don't overflow at 1440px.
- Lighthouse accessibility for the page stays at 100.

## Concepts to write about
- Scales: domain → range, and why that's 80% of D3
- One data object → SVG, description and table: "single source of truth"
- When a chart should be cut (the "honest test" from §VI.IV)
