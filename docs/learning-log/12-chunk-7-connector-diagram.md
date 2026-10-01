# Learning log 12: Phase 1, chunk 7: The connector diagram

**Date:** 2026-10-01  **Chunk:** Phase 1 · 7  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **layer CSS layout with SVG drawing.** CSS grid positions the boxes, and JavaScript reads where they ended up and draws arrows between them. A `ResizeObserver` keeps the drawing in sync.

## What I did (prototype)

- **Markup:** `<section class="diagram">` with an **`<ol>`** of four `<li class="node">` (the reference used `div`s), plus an `aria-hidden` SVG holding two empty `<path>`s, one for the curves and one for the arrowheads.
- **CSS:** on phones, a stacked list in the text column with the SVG hidden. At **≥1024px**, the section breaks out to `min(100vw, 1200px)` with the reference's padding (`6rem clamp(10px, 6vw, 72px) 9.25rem`), the list becomes `repeat(4, 1fr)` with a 6% column gap, and the SVG shows. Boxes sit above the SVG (`z-index: 3`) on a `--paper` fill.
- **JS, `drawConnectors()`:** reads the SVG's rect and every box's rect *first*, computes one quadratic curve per pair (from box *i*'s right edge to 6px before box *i+1*'s left edge, with the control point lifted ±40px, alternating) plus a small arrowhead, then **writes two `d` attributes once**.
- **`new ResizeObserver(draw).observe(.diagram-inner)`:** fires on window resize, zoom, font loading and text wrapping.

## A change from the reference

The reference rebuilt the SVG with `innerHTML` on every redraw. Here the two `<path>` elements are in the markup and only their `d` attribute changes. That means no HTML parsing, no element churn, and nothing for an XSS review to flag.

## Checkpoint results (prototype, and the built project, which gave identical numbers)

| Width | Arrows | Curves | Worst endpoint offset | Layout |
|------:|:------:|:------:|----------------------:|--------|
| 375 | hidden | 0 | — | list in a 281px column |
| 1023 | hidden | 0 | — | list in a 600px column |
| 1024 | shown | 3 | **0px** | 4 columns, 1024px stage |
| 1280 / 1600 | shown | 3 | **0px** | 4 columns, **1200px** stage |
| 1100, then back to 1024 | shown | 3 | **0px** | redrawn on each resize |
| 1024 with a box's text wrapped to three lines | shown | 3 | **0px** | the taller box re-centers, arrows follow |

- Accessibility tree at 375: `region "The four stages of an essay"` → `list` → 4 `listitem`s.
- No horizontal scroll at any width. Nu HTML Checker: no errors.

## Port

`Diagram.svelte`: the same rules, scoped, with `drawConnectors` inside an **`{@attach}`** that creates the ResizeObserver and returns `() => ro.disconnect()` as its cleanup. The tokens went into `app.css`. ✅

## Concepts learned

- **`getBoundingClientRect()` is viewport-relative.** Subtracting the SVG's own `left`/`top` turns it into coordinates inside the SVG.
- **Read, then write.** Reading a rect after changing an attribute forces a fresh layout ("layout thrashing"). All reads happen before the two writes.
- **Why ResizeObserver beats `window.resize`:** the boxes can change size without the window changing (fonts arriving, zoom, a longer label). The observer watches the element itself.
- **Attachments clean up after themselves.** Returning `ro.disconnect` means no observer outlives its component.

## Next

[Chunk 8: the scroll engine](../plan/phase-1/08-scroll-engine.md).
