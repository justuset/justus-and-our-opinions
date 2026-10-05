<!-- Diptych: two photos side by side (measured: 2 × 465px with a 15px gap inside 945px), stacked on phones.
     Flat props from content/doc.json: url1, alt1, width1, height1, url2, … (see $kit/doc.js), plus one shared credit. -->
<script>
  import { photo } from '$lib/media.js';
  import { series } from '$kit/doc.js';
  let { credit, ...props } = $props();
  const images = $derived(series(props, ['url', 'alt', 'width', 'height']).slice(0, 2));
</script>

<figure class="diptych">
  <div class="pair">
    {#each images as img (img.url)}
      <img
        {...photo(img.url, img.width)}
        sizes="(min-width: 945px) 465px, (min-width: 740px) 50vw, 100vw"
        alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" />
    {/each}
  </div>
  {#if credit}<figcaption><span class="visually-hidden">Credit:</span> {credit}</figcaption>{/if}
</figure>

<style>
  .diptych { width: var(--col-large); margin: var(--gap-photo) auto; }
  .pair { display: flex; flex-direction: column; gap: 10px; }
  img { width: 100%; }
  figcaption { padding: 9px var(--gutter) 0; font-size: var(--credit-size); line-height: var(--credit-leading); color: var(--faint); }
  @media (min-width: 740px) {
    .pair { flex-direction: row; gap: var(--diptych-gap); }
    img { flex: 1 1 0; min-width: 0; }
    figcaption { padding-inline: 0; }
  }
</style>
