<!-- PhotoScrolly: photos swap behind text cards as you scroll (measured from the reference):
     - a sticky stage one screen tall (100svh), photos stacked, the active one fades in over 0.35s;
     - cards one screen apart (first pulled up 33svh, last padded 66svh), 28/32 type, 24/30 on phones;
     - a card crossing the middle of the viewport makes its photo active: an IntersectionObserver with
       rootMargin -50% 0 -50% 0 (a one-pixel line). No scroll library, like the reference.
     No JS: the base CSS is the readable layout, every photo in flow followed by the cards as plain paragraphs.
     The attachment adds data-enhanced, and only then do the sticky stage and the overlay apply.
     Flat props: url1, alt1, width1, height1, card1, url2, … (see $kit/doc.js), plus one credit. -->
<script>
  import { photo } from '$lib/media.js';
  import { series } from '$kit/doc.js';
  import { inlineHtml } from '$kit/inline-html.js';

  let { credit, ...props } = $props();
  const steps = $derived(series(props, ['url', 'alt', 'width', 'height', 'card']));

  let active = $state(0);
  let enhanced = $state(false);

  /** @param {HTMLElement} node */
  function scrolly(node) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) active = Number(/** @type {HTMLElement} */ (e.target).dataset.step);
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    node.querySelectorAll('.card').forEach((card) => io.observe(card));
    enhanced = true;
    return () => io.disconnect();
  }
</script>

<section class="photo-scrolly" data-enhanced={enhanced || undefined} data-active={active} {@attach scrolly}>
  <div class="stage">
    {#each steps as step, i (i)}
      <img
        class:is-active={i === active}
        {...photo(step.url, step.width)}
        sizes="100vw"
        alt={step.alt}
        width={step.width}
        height={step.height}
        loading={i === 0 ? 'eager' : 'lazy'}
        decoding="async"
      />
    {/each}
  </div>
  {#each steps as step, i (i)}
    <p class="card" data-step={i}>{@html inlineHtml(step.card)}</p>
  {/each}
</section>
{#if credit}<p class="credit"><span class="visually-hidden">Credit:</span> {credit}</p>{/if}

<style>
  .photo-scrolly { position: relative; z-index: 0; margin-block: var(--gap-scrolly) 0; }

  /* No-JS layout: photos in a column, credit, then the cards as text. */
  .stage { width: var(--col-large); margin: 0 auto var(--gap-photo); display: grid; gap: 10px; }
  img { width: 100%; }
  .credit { margin: 9px 0; padding-inline: var(--gutter); font: var(--type-credit); color: var(--color-content-secondary-dim); }
  .card {
    width: var(--col);
    margin: 0 auto var(--gap-para);
    font: var(--type-card);
  }

  /* Enhanced: one sticky screen, photos stacked, cards scroll over it. */
  [data-enhanced] .stage {
    position: sticky;
    top: var(--masthead-h);
    width: 100%;
    height: 100vh;
    height: 100svh;
    margin: 0;
    display: block;
    overflow: hidden;
  }
  [data-enhanced] img {
    position: absolute;
    inset: 0;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity var(--fade);
  }
  [data-enhanced] img.is-active { opacity: 1; }
  [data-enhanced] .card {
    position: relative;
    z-index: 1;
    width: min(var(--w-body), 100%);
    margin: 0 auto 100svh;
    padding-inline: 40px;
    box-sizing: content-box;
    color: var(--on-photo);
    text-shadow: var(--photo-shadow);
  }
  [data-enhanced] .card:first-of-type { margin-top: -33svh; }
  [data-enhanced] .card:last-of-type { margin-bottom: 0; padding-bottom: 66svh; }
  @media (max-width: 739.98px) {
    [data-enhanced] .card { width: calc(100% - 80px); }
  }
</style>
