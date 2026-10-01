<!-- Section A: hard-cut slides (prototype chunk 9). ✅ Ported.
     Every frame is server-rendered (never built with innerHTML), so the no-JS version shows all six in order.
     Enhanced: the frames stack in one spot and the active one cuts in, with no transition. The card is sized to the
     viewport width (min(44.85vw, 250px)), and arrows are positioned through a custom-property API. -->
<script>
  import Scrolly from './Scrolly.svelte';
  import { asset } from '$lib/assets.js';
  let { label, steps } = $props();
</script>

<Scrolly {label} steps={steps.length} stepTexts={steps.map((s) => `${s.heading}: ${s.card}.`)}>
  {#snippet children({ step, enhanced })}
    <div class="frames" class:enhanced aria-hidden="true">
      {#each steps as s, i (i)}
        <div class="frame" class:is-active={i === step}>
          <p class="a-heading">{s.heading}</p>
          <div class="a-card">
            <img src={asset(s.image)} alt="" width="1000" height="1000" loading="lazy" decoding="async" />
            <p class="a-label">{s.card}</p>
            {#if i < steps.length - 1}
              <svg class="a-arrow" class:hide-portrait={i % 2} style:--arrow-length="min(18vw, 120px)">
                <line x1="8" y1="8" x2="100%" y2="8" />
              </svg>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/snippet}
</Scrolly>

<style>
  /* No JS: a readable stack. */
  .frame { width: var(--col); margin: 0 auto 40px; text-align: center; }
  .a-heading { margin: 0 0 12px; font: var(--headline-weight) clamp(22px, 3vw, 34px) / 1.1 var(--font-display); }
  .a-card { position: relative; width: min(44.85vw, 250px); aspect-ratio: 1; margin: 0 auto 48px; }
  .a-card img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .a-label {
    position: absolute;
    top: 100%;
    inset-inline: 0;
    margin: 12px 0 0;
    color: var(--soft);
    font: 600 15px / 1.3 var(--font-body);
  }
  .a-arrow { display: none; }

  /* Enhanced: frames stack in one spot; the active one shows. A hard cut, so no transition. */
  .enhanced .frame {
    position: absolute;
    inset: 0;
    width: auto;
    margin: 0;
    display: grid;
    place-items: center;
    opacity: 0;
    visibility: hidden;
  }
  .enhanced .frame.is-active { opacity: 1; visibility: visible; }
  .enhanced .a-heading { position: absolute; top: 10vh; inset-inline: 0; margin: 0; padding: 0 20px; }
  .enhanced .a-card { margin: 0; }
  /* The arrow's position is an API of custom properties: one arrow can be moved inline, with no new CSS. */
  .enhanced .a-arrow {
    display: block;
    position: absolute;
    top: var(--arrow-top, 50%);
    left: var(--arrow-left, 100%);
    width: var(--arrow-length, 80px);
    height: 16px;
    transform: translateY(-50%);
    overflow: visible;
  }
  .a-arrow line { stroke: var(--ink); stroke-width: var(--arrow-stroke, 2); }
  @media (orientation: portrait) {
    .a-arrow line { stroke-width: var(--arrow-mobile-stroke, 1.5); }
    .enhanced .a-arrow.hide-portrait { display: none; }
  }
</style>
