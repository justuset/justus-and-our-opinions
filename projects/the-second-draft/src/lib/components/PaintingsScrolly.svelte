<!-- Section C: items re-arrange on each step (prototype chunk 9). ✅ Ported.
     Each step has a layout: per item, top / left|right / width as % of the stage, rotation, opacity and stacking order.
     No JS: the items in a row, with every step's caption. Enhanced: an absolute stage where each step's layout is
     written as inline styles and CSS transitions settle them over 0.95s. Portrait screens get 1.6× wider items. -->
<script>
  import Scrolly from './Scrolly.svelte';
  import { asset } from '$lib/assets.js';
  let { label, items, steps, portraitScale = 1.6 } = $props();

  let portrait = $state(false);
  /** Attachment: follow the screen's orientation (matchMedia is browser-only, so it lives here, not at the top level). */
  function orientation() {
    const mq = matchMedia('(orientation: portrait)');
    const sync = () => (portrait = mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }
  const pct = (n) => (n == null ? 'auto' : `${n}%`);
</script>

<Scrolly {label} steps={steps.length} stepTexts={steps.map((s) => s.caption)}>
  {#snippet children({ step, enhanced })}
    <div class="c-scene" class:enhanced aria-hidden="true" {@attach orientation}>
      <p class="c-caption">{steps[step].caption}</p>
      <div class="c-stage">
        {#each items as item, i (item.image)}
          {@const L = steps[step].layout[i]}
          <!-- Layout styles are only written once enhanced; before that the items sit in a plain row. -->
          <div
            class="c-painting"
            style:top={enhanced ? pct(L.top) : null}
            style:left={enhanced ? pct(L.left) : null}
            style:right={enhanced ? pct(L.right) : null}
            style:width={enhanced ? `${Math.min(L.width * (portrait ? portraitScale : 1), 70)}%` : null}
            style:z-index={enhanced ? L.z : null}
            style:opacity={enhanced ? L.op : null}
            style:transform={enhanced ? `rotate(${L.rot}deg)` : null}
          >
            <img src={asset(item.image)} alt="" width="600" height="800" loading="lazy" decoding="async" />
          </div>
        {/each}
      </div>
    </div>
  {/snippet}
</Scrolly>

<style>
  /* No JS: a row of three, with the first caption above it (the hidden list carries every step for screen readers). */
  .c-caption { width: var(--col); margin: 0 auto 14px; text-align: center; font: 600 15px / 1.3 var(--font-body); }
  .c-stage { width: var(--col); margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  img { display: block; width: 100%; height: auto; aspect-ratio: 3 / 4; object-fit: cover; }

  /* Enhanced */
  .enhanced { height: 100%; }
  .enhanced .c-caption { position: absolute; top: 6vh; inset-inline: 0; z-index: 5; width: auto; margin: 0; padding: 0 20px; }
  .enhanced .c-stage { position: absolute; inset: 0; width: auto; margin: 0; display: block; }
  .enhanced .c-painting {
    position: absolute;
    transition: opacity 0.95s var(--ease-settle), transform 0.95s var(--ease-settle), top 0.95s var(--ease-settle),
      left 0.95s var(--ease-settle), right 0.95s var(--ease-settle), width 0.95s var(--ease-settle);
  }
  .enhanced img { box-shadow: 0 6px 24px rgb(0 0 0 / 0.35); }
  @media (prefers-reduced-motion: reduce) {
    .enhanced .c-painting { transition: none; }
  }
</style>
