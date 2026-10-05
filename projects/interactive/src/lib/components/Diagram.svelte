<!-- Diagram: a process drawn as boxes joined by curved arrows (prototype chunk 7). ✅ Ported.
     Two layers: CSS grid positions the boxes; an SVG on top draws arrows between wherever the boxes ended up.
     Phones: a plain ordered list in the text column (no arrows). ≥740px (the tablet tier): a 4-column stage up to 1200px wide.
     The arrows are redrawn by a ResizeObserver, so they stay attached through resizes, zoom and text reflow. -->
<script>
  import { series } from '$kit/doc.js';
  // Flat props from content/doc.json: `label` names the section; label1, label2, … are the boxes in order.
  let { label, ...props } = $props();
  const nodes = $derived(series(props, ['label']).map((n) => n.label));

  /** Attachment: runs in the browser once the element exists; the returned function cleans up. */
  function connectors(diagram) {
    const inner = diagram.querySelector('.diagram-inner');
    const svg = diagram.querySelector('.connectors');
    const curvesPath = svg.querySelector('.connector-curves');
    const headsPath = svg.querySelector('.connector-heads');

    function draw() {
      if (getComputedStyle(svg).display === 'none') return; // phones: no arrows
      // read everything first…
      const box = svg.getBoundingClientRect();
      const rects = [...diagram.querySelectorAll('.node')].map((n) => n.getBoundingClientRect());
      const lift = parseFloat(getComputedStyle(diagram).getPropertyValue('--connector-lift')) || 40;
      // …compute…
      let curves = '';
      let heads = '';
      for (let i = 0; i < rects.length - 1; i++) {
        const a = rects[i];
        const b = rects[i + 1];
        const x1 = a.right - box.left;
        const y1 = a.top + a.height / 2 - box.top;
        const x2 = b.left - box.left - 6;
        const y2 = b.top + b.height / 2 - box.top;
        const mid = (x1 + x2) / 2;
        const dy = lift * (i % 2 ? 1 : -1);
        curves += `M${x1},${y1} Q${mid},${y1 + dy} ${x2},${y2} `;
        heads += `M${x2 - 7},${y2 - 5} L${x2},${y2} L${x2 - 7},${y2 + 5} `;
      }
      // …then write once.
      curvesPath.setAttribute('d', curves.trim());
      headsPath.setAttribute('d', heads.trim());
    }

    const ro = new ResizeObserver(draw);
    ro.observe(inner);
    return () => ro.disconnect();
  }
</script>

<section class="diagram" aria-label={label} {@attach connectors}>
  <ol class="diagram-inner">
    {#each nodes as node (node)}
      <li class="node">{node}</li>
    {/each}
  </ol>
  <svg class="connectors" aria-hidden="true" focusable="false">
    <path class="connector-curves" d="" />
    <path class="connector-heads" d="" />
  </svg>
</section>

<style>
  .diagram { position: relative; width: var(--col); margin: var(--diagram-margin) auto; }
  .diagram-inner { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--diagram-gap); }
  .node {
    position: relative;
    z-index: 3;
    padding: 12px 14px;
    border: var(--node-border) solid var(--ink);
    background: var(--paper);
    font: 600 0.9375rem / 1.3 var(--font-body);
  }
  .connectors {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    overflow: visible;
    z-index: 2;
    display: none;
    color: var(--ink);
    pointer-events: none;
  }
  .connectors path { fill: none; stroke: currentColor; stroke-width: var(--node-border); }

  @media (min-width: 740px) {
    .diagram {
      width: 100vw;
      max-width: var(--diagram-stage);
      left: 50%;
      transform: translateX(-50%);
      padding: var(--diagram-pad);
    }
    .diagram-inner { grid-template-columns: repeat(4, 1fr); column-gap: 6%; align-items: center; }
    .connectors { display: block; }
  }
</style>
