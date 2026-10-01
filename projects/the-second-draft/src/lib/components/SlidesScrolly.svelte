<!-- Section A: hard-cut slides (prototype chunk 9).
     STATUS: every frame is server-rendered (never built with innerHTML), so the no-JS version shows all six in order.
     Hard cuts, the vw-sized card and the CSS-variable arrow API land when chunk 9 passes. -->
<script>
  import Scrolly from './Scrolly.svelte';
  import { asset } from '$lib/assets.js';
  let { label, steps } = $props();
</script>

<Scrolly {label} steps={steps.length} stepTexts={steps.map((s) => `${s.heading}: ${s.card}`)}>
  {#snippet children({ step })}
    {#each steps as s, i (i)}
      <div class="frame" class:is-active={i === step} aria-hidden="true">
        <h3 class="a-heading">{s.heading}</h3>
        <img class="a-card" src={asset(s.image)} alt="" width="1000" height="1000" loading="lazy" decoding="async" />
        <p class="a-label">{s.card}</p>
      </div>
    {/each}
  {/snippet}
</Scrolly>

<style>
  .frame { width: var(--col); margin: 0 auto 40px; text-align: center; }
  .a-heading { font: var(--headline-weight) 26px / 1.1 var(--font-display); margin: 0 0 12px; }
  .a-card { width: min(44.85vw, 250px); aspect-ratio: 1; margin: 0 auto; }
  .a-label { color: var(--soft); font: 600 15px / 1.3 var(--font-body); }
</style>
