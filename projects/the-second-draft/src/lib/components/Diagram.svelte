<!-- Diagram: a process drawn as boxes joined by curved arrows (prototype chunk 7).
     STATUS: the ordered list is final (it's the no-JS and screen-reader version). The 4-column desktop stage and the
     SVG connectors drawn from live geometry ({@attach} + ResizeObserver) land when chunk 7 passes. -->
<script>
  let { label, nodes } = $props();
</script>

<section class="diagram" aria-label={label}>
  <ol class="diagram-inner">
    {#each nodes as node (node)}
      <li class="node">{node}</li>
    {/each}
  </ol>
</section>

<style>
  .diagram { width: var(--col); margin: 2.3125rem auto; }
  .diagram-inner { list-style: none; padding: 0; margin: 0; display: grid; gap: 18px; }
  .node { padding: 12px 14px; border: 1.5px solid var(--ink); font: 600 15px / 1.3 var(--font-body); background: var(--paper); }
</style>
