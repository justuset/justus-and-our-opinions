<!-- Section C: items re-arrange on each step (prototype chunk 9).
     Each step has a layout: per item, top / left|right / width as % of the stage, rotation, opacity and stacking order.
     STATUS: the no-JS version shows the items and every step's caption. The absolute stage, the per-step layouts with
     a 0.95s --ease-settle transition and the 1.6× portrait scale land when chunk 9 passes. -->
<script>
  import Scrolly from './Scrolly.svelte';
  import { asset } from '$lib/assets.js';
  let { label, items, steps } = $props();
</script>

<Scrolly {label} steps={steps.length} stepTexts={steps.map((s) => s.caption)}>
  {#snippet children()}
    <div class="c-stage">
      {#each items as item (item.image)}
        <img class="c-painting" src={asset(item.image)} alt={item.alt} width="600" height="800" loading="lazy" decoding="async" />
      {/each}
    </div>
    <ol class="c-captions" aria-hidden="true">
      {#each steps as s, i (i)}<li>{s.caption}</li>{/each}
    </ol>
  {/snippet}
</Scrolly>

<style>
  .c-stage { width: var(--col); margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .c-painting { width: 100%; height: auto; }
  .c-captions { width: var(--col); margin: 14px auto 0; color: var(--soft); font: 15px / 1.4 var(--font-body); }
</style>
