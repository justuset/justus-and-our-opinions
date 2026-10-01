<!-- Section B: a 65vh image band with fading captions (prototype chunk 9).
     STATUS: images and captions are server-rendered as a readable stack. The vh band (17.5vh insets at ≥768px),
     stacked captions with a 0.4s fade, and hard-cut images land when chunk 9 passes. -->
<script>
  import Scrolly from './Scrolly.svelte';
  import { asset } from '$lib/assets.js';
  let { label, steps } = $props();
</script>

<Scrolly {label} steps={steps.length}>
  {#snippet children({ step })}
    {#each steps as s, i (i)}
      <figure class="frame" class:is-active={i === step}>
        <img src={asset(s.image)} alt={s.alt} width="1200" height="900" loading="lazy" decoding="async" />
        <figcaption class="b-text">{s.caption}</figcaption>
      </figure>
    {/each}
  {/snippet}
</Scrolly>

<style>
  .frame { width: var(--col); margin: 0 auto 40px; }
  img { width: 100%; height: auto; }
  .b-text { margin-top: 10px; font: 20px / 1.3 var(--font-display); text-align: center; }
</style>
