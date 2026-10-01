# Chunk 7: The connector diagram

**One new idea:** **layer CSS layout with SVG drawing.** CSS grid positions the boxes, and JavaScript reads where they
ended up and draws arrows between them. A `ResizeObserver` keeps the drawing in sync.

**Reference:** breakdown §9.

## Build
- [ ] Markup: nodes as an **ordered list** (the reference uses `div`s), plus an SVG overlay:
  ```html
  <section class="diagram" data-block="diagram" aria-label="How a piece gets made">
    <ol class="diagram-inner"><li class="node">Idea</li><li class="node">Draft</li><li class="node">Revise</li><li class="node">Ship</li></ol>
    <svg class="connectors" aria-hidden="true"></svg>
  </section>
  ```
- [ ] Phones: `.diagram { position: relative; width: var(--col); margin: 2.3125rem auto; }`, `.diagram-inner { display: grid; gap: 18px; list-style: none; padding: 0; }`.
      Nodes: `padding: 12px 14px; border: 1.5px solid var(--ink); background: var(--paper); position: relative; z-index: 3;`. Connectors `display: none`.
- [ ] `≥ 1024px`: the diagram breaks out (`width: 100vw; max-width: 1200px; left: 50%; transform: translateX(-50%); padding: 6rem clamp(10px, 6vw, 72px) 9.25rem`),
      the grid becomes `repeat(4, 1fr)` with a `6%` gap, and connectors `display: block` (absolute, `inset: 0`, `overflow: visible`).
- [ ] JS `drawConnectors()`:
  - [ ] Return early if the SVG is `display: none`.
  - [ ] Read the SVG's rect and every node's rect. **Read everything first, then write once.**
  - [ ] For each neighboring pair, a quadratic curve from the right edge of A to the left edge of B: `M x1,y1 Q mid,(y1 ± 40) x2,y2`, alternating the lift by index.
  - [ ] An arrowhead `M x2−7,y2−5 L x2,y2 L x2−7,y2+5`, with stroke `var(--ink)` (use `currentColor` on the SVG).
  - [ ] `svg.innerHTML = paths`. The values are numbers we computed, so there's no user text here.
- [ ] `new ResizeObserver(drawConnectors).observe(document.querySelector('.diagram-inner'))`.

## Learn
- `getBoundingClientRect()` returns viewport coordinates. Subtract the SVG's own `left` and `top` to get coordinates inside it.
- Why `ResizeObserver` and not `window.resize`: it fires when **the element** changes size, including font loading and zoom, not just window resizes.
- Read-then-write: if you mix reads and writes in a loop, the browser recalculates layout on each read ("layout thrashing").

## Checkpoint
- [ ] **< 1024:** a clean stacked list with no arrows. The screen reader announces "list, 4 items."
- [ ] **≥ 1024:** four boxes in a row with waving arrows between them.
- [ ] **Resize** 1024 ↔ 1600 and zoom the page (⌘+): **the arrows stay attached** to the box edges.
- [ ] Elements → Layout → grid overlay on `.diagram-inner` lines up with the boxes.
