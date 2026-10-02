<!-- Section C: items re-arrange on each step (prototype chunk 9). ✅ Ported.
     Each step has a layout: per item, top / left|right / width as % of the stage, rotation, opacity and stacking order.
     No JS: every step's caption, then the items in a row. Enhanced: an absolute stage where each step's layout is
     written as inline styles and CSS transitions settle them over 0.95s. Portrait screens get 1.6× wider items. -->
<script>
  import StickyScroller from './StickyScroller.svelte';
  import { asset } from '$lib/assets.js';
  import { series } from '$lib/doc.js';
  // Flat props from content/doc.json: image1/alt1… are the cards, caption1… the steps. `layouts` (one array per step,
  // one object per card) has no flat form yet; it moves to the doc's `sheets` data slot in chunk S6.
  let { label, height, layouts, portraitScale = 1.6, ...props } = $props();
  const items = $derived(series(props, ['image', 'alt']));
  const steps = $derived(series(props, ['caption']).map((s, i) => ({ caption: s.caption, layout: layouts[i] })));

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

<StickyScroller {label} {height} steps={steps.length} stepTexts={steps.map((s) => s.caption)}>
  {#snippet children({ step, enhanced })}
    <div class="c-scene" class:enhanced aria-hidden="true" {@attach orientation}>
      {#if enhanced}
        <p class="c-caption">{steps[step].caption}</p>
      {:else}
        <!-- The stack has one set of cards, so it lists all three captions (StickyScroller's hidden list is for screen readers). -->
        <ol class="c-steps">
          {#each steps as s, i (i)}<li>{s.caption}</li>{/each}
        </ol>
      {/if}
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
</StickyScroller>

<style>
  /* No JS: every caption as a list, then a row of three cards. */
  .c-steps { width: var(--col); margin: 0 auto 14px; padding-inline-start: 1.25em; color: var(--soft); font: 15px / 1.4 var(--font-body); }
  .c-caption { margin: 0; text-align: center; font: 600 15px / 1.3 var(--font-body); }
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
