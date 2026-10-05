<!-- TwoUp: two images and one shared caption, full bleed (prototype chunk 6). ✅ Ported.
     Mobile-first: the base rules are the phone layout (stacked). At the tablet tier (740px) the figure wraps into a row: both images
     take exactly half (flex: 1 1 0) and the caption's 100% basis forces it onto its own row. At the desktop tier (1150px) the padding
     grows and the block caps at 1440px. The <figure> itself is the flex container, because <figcaption> must be a
     direct child of <figure>. -->
<script>
  import { asset } from '$lib/assets.js';
  import { srcset } from '$lib/media.js';
  import { series } from '$kit/doc.js';
  // Flat props from content/doc.json: url1, alt1, width1, height1, srcset1, url2, … (see $kit/doc.js)
  let { groupCaption, credit, sizes, ...props } = $props();
  const images = $derived(series(props, ['url', 'alt', 'width', 'height', 'srcset']));
</script>

<figure class="two-up bleed">
  {#each images as img (img.url)}
    <img src={asset(img.url)} srcset={srcset(img.srcset)} {sizes} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" />
  {/each}
  <figcaption class="group-caption">{groupCaption} <span class="credit">{credit}</span></figcaption>
</figure>

<style>
  .two-up {
    display: flex;
    flex-direction: column;
    gap: var(--two-up-gap);
    margin-block: var(--two-up-margin);
    margin-inline: 0;                 /* figure's default side margin off; .bleed does the positioning */
    padding-inline: var(--two-up-pad);
    max-width: var(--two-up-max);
  }
  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 5;
    object-fit: cover;
  }
  .group-caption {
    padding-top: 9px;
    font: var(--type-caption);
    color: var(--color-content-secondary);
  }
  .credit { color: var(--color-content-secondary-dim); }

  @media (min-width: 740px) {
    .two-up { flex-flow: row wrap; }
    img { flex: 1 1 0; min-width: 0; }
    .group-caption { flex: 0 0 100%; margin-top: 4px; padding-top: 0; }
  }
</style>
