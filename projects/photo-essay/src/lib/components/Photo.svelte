<!-- Photo: one photograph between text runs. size "large" (default) is 945px wide and full width on phones;
     "medium" sits in the 600px text column. Caption and credit below, measured 9px gap. -->
<script>
  import { photo } from '$lib/media.js';
  let { url, alt, width, height, caption, credit, size = 'large' } = $props();
  // The slot's width, so the browser picks the smallest sharp-enough file from srcset
  const sizes = $derived(size === 'medium' ? '(min-width: 640px) 600px, calc(100vw - 40px)' : '(min-width: 945px) 945px, 100vw');
</script>

<figure class="photo size-{size}">
  <img {...photo(url, width)} {sizes} {alt} {width} {height} loading="lazy" decoding="async" />
  {#if caption || credit}
    <figcaption>
      {#if caption}{caption}{/if}
      {#if credit}<span class="credit"><span class="visually-hidden">Credit:</span> {credit}</span>{/if}
    </figcaption>
  {/if}
</figure>

<style>
  .photo { margin: var(--gap-photo) auto; }
  .size-large { width: var(--col-large); }
  .size-medium { width: var(--col); }
  img { width: 100%; }
  figcaption { padding-top: 9px; font: var(--type-caption); color: var(--color-content-secondary); }
  .credit { display: block; font: var(--type-credit); color: var(--color-content-secondary-dim); }
  @media (max-width: 739.98px) {
    .size-large figcaption { padding-inline: var(--gutter); }
  }
</style>
