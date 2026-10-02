<!-- Photo: one photograph between text runs. size "large" (default) is 945px wide and full width on phones;
     "medium" sits in the 600px text column. Caption and credit below, measured 9px gap. -->
<script>
  import { asset } from '$lib/assets.js';
  let { url, alt, width, height, caption, credit, size = 'large' } = $props();
</script>

<figure class="photo size-{size}">
  <img src={asset(url)} {alt} {width} {height} loading="lazy" decoding="async" />
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
  figcaption { padding-top: 9px; font: var(--caption-size) / 1.4 var(--font-text); color: var(--soft); }
  .credit { display: block; font-size: var(--credit-size); color: var(--faint); }
  @media (max-width: 739.98px) {
    .size-large figcaption { padding-inline: var(--gutter); }
  }
</style>
