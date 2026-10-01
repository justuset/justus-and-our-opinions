<!-- TwoUp: two images and one shared caption, full bleed (prototype chunk 6). ✅ Ported.
     Mobile-first: the base rules are the phone layout (stacked). At 640px the figure wraps into a row: both images
     take exactly half (flex: 1 1 0) and the caption's 100% basis forces it onto its own row. At 1250px the padding
     grows and the block caps at 1440px. The <figure> itself is the flex container, because <figcaption> must be a
     direct child of <figure>. -->
<script>
  import { asset } from '$lib/assets.js';
  let { images, caption, credit } = $props();
</script>

<figure class="two-up bleed">
  {#each images as img (img.src)}
    <img src={asset(img.src)} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" />
  {/each}
  <figcaption class="group-caption">{caption} <span class="credit">{credit}</span></figcaption>
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
    font: var(--caption-size) / var(--caption-leading) var(--font-body);
    color: var(--soft);
  }
  .credit { color: var(--faint); }

  @media (min-width: 640px) {
    .two-up { flex-flow: row wrap; }
    img { flex: 1 1 0; min-width: 0; }
    .group-caption { flex: 0 0 100%; margin-top: 4px; padding-top: 0; }
  }
</style>
