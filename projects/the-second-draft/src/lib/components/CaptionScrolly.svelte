<!-- Section B: an image band with fading captions (prototype chunk 9). ✅ Ported.
     No JS: each page and its caption, stacked. Enhanced: captions sit on top of each other and fade (0.4s);
     images hard-cut. Phones get a 30vh caption area on top; ≥768px gets a centered band 65vh tall. -->
<script>
  import Scrolly from './Scrolly.svelte';
  import { asset } from '$lib/assets.js';
  import { srcset } from '$lib/media.js';
  import { series } from '$lib/doc.js';
  // Flat props from content/doc.json: image1, srcset1, alt1, caption1, image2, … (one numbered set per page)
  let { label, sizes, ...props } = $props();
  const steps = $derived(series(props, ['image', 'srcset', 'alt', 'caption']));
</script>

<Scrolly {label} steps={steps.length} stepTexts={steps.map((s) => s.caption)}>
  {#snippet children({ step, enhanced })}
    <div class="b-panel" class:enhanced aria-hidden="true">
      <div class="b-wrapper">
        <div class="b-text-overlay">
          {#each steps as s, i (i)}
            <p class="b-text" class:is-visible={i === step} style:order={i * 2}>{s.caption}</p>
          {/each}
        </div>
        <div class="b-content">
          {#each steps as s, i (i)}
            <div class="frame" class:is-active={i === step} style:order={i * 2 + 1}>
              <img src={asset(s.image)} srcset={srcset(s.srcset)} {sizes} alt="" width="1200" height="900" loading="lazy" decoding="async" />
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/snippet}
</Scrolly>

<style>
  /* No JS: caption, then page, for each step. `display: contents` removes the two list wrappers from layout, so
     every caption and frame becomes a flex item of .b-wrapper, and the inline `order` interleaves them
     (caption i = 2i, page i = 2i + 1). Once enhanced, the wrappers are blocks again and `order` does nothing. */
  .b-wrapper { width: var(--col); margin: 0 auto; display: flex; flex-direction: column; }
  .b-text-overlay, .b-content { display: contents; }
  .b-text { margin: 0 0 10px; font: 20px / 1.3 var(--font-display); text-align: center; }
  .frame { margin-bottom: 40px; }
  img { display: block; width: 100%; height: auto; }

  /* Enhanced */
  .enhanced { height: 100%; padding: 0 16px; }
  .enhanced .b-wrapper { width: auto; height: 100%; margin: 0; }
  .enhanced .b-text-overlay { display: block; position: relative; min-height: 30vh; }
  .enhanced .b-content { display: block; position: relative; flex: 1; }
  .enhanced .b-text {
    position: absolute; /* every caption in the same spot, so different lengths never shift the layout */
    inset-inline: 0;
    bottom: 0;
    width: 90%;
    margin: 0 auto 16px;
    opacity: 0;
    transition: opacity 0.4s var(--ease-fade);
  }
  .enhanced .b-text.is-visible { opacity: 1; }
  .enhanced .frame { position: absolute; inset: 0; margin: 0; opacity: 0; visibility: hidden; }
  .enhanced .frame.is-active { opacity: 1; visibility: visible; }
  /* Pinned to the frame: a % height alone has nothing definite to resolve against here. */
  .enhanced img { position: absolute; inset: 0; height: 100%; object-fit: contain; }

  @media (min-width: 768px) {
    .enhanced { padding: 0 40px; }
    .enhanced .b-wrapper { position: absolute; top: 17.5vh; bottom: 17.5vh; left: 40px; right: 40px; height: auto; }
    .enhanced .b-text-overlay { min-height: min(20vh, 80px); }
    .enhanced .b-content { flex: none; height: calc(100% - min(20vh, 80px)); }
    .enhanced .b-text { top: 0; bottom: auto; width: min(545px, 90%); margin: 0 auto; font-size: 1.5rem; line-height: 1.25; }
  }
  @media (prefers-reduced-motion: reduce) {
    .enhanced .b-text { transition: none; }
  }
</style>
