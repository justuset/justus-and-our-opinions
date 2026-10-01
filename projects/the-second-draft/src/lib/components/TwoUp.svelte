<!-- TwoUp: two images and one shared caption (prototype chunk 6).
     STATUS: markup and image loading are final. The 640px side-by-side layout and the 1250px cap land when chunk 6 passes;
     until then the images stack, which is already the correct phone layout. -->
<script>
  import { asset } from '$lib/assets.js';
  let { label, images, caption, credit } = $props();
</script>

<figure class="two-up bleed" aria-label={label}>
  <div class="two-up-grid">
    {#each images as img (img.src)}
      <img src={asset(img.src)} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" />
    {/each}
    <figcaption class="group-caption">{caption} <span class="credit">{credit}</span></figcaption>
  </div>
</figure>

<style>
  .two-up { margin: 40px 0; padding: 0 20px; }
  .two-up-grid { display: flex; flex-direction: column; gap: 12px; }
  img { width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; }
  .group-caption { font: 15px / 1.3 var(--font-body); color: var(--soft); padding-top: 9px; }
  .credit { color: var(--faint); }
</style>
