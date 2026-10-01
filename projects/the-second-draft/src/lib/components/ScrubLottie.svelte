<!-- Section D: a scroll-scrubbed Lottie with desktop and mobile twins (prototype chunk 10).
     The animation's playhead follows the scroll position: scroll down to play, up to rewind, stop to hold.
     STATUS: renders the text fallback. When chunk 10 passes: twin stages (.desktop-only / .mobile-only), and an
     {@attach} that loads only the visible twin with $lib/lottie.js scrubber() and feeds it Scrolly's progress. -->
<script>
  import Scrolly from './Scrolly.svelte';
  let { label, steps, desktop, mobile, fallback } = $props();
</script>

<Scrolly {label} {steps}>
  {#snippet children()}
    <div class="scrub-stage" data-desktop={desktop} data-mobile={mobile}>
      <p class="scrub-fallback">{fallback}</p>
    </div>
  {/snippet}
</Scrolly>

<style>
  .scrub-stage { width: var(--col); margin: 0 auto; padding: 24px; border: 1px dashed var(--line); }
  .scrub-fallback { margin: 0; color: var(--soft); font: 16px / 1.5 var(--font-body); text-align: center; }
</style>
