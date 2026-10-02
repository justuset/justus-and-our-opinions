<!-- Section D: a scroll-scrubbed Lottie with desktop and mobile twins (prototype chunk 10). ✅ Ported.
     The animation's playhead follows the scroll position: scroll down to play, up to rewind, stop to hold.
     Two runways, one per twin (.desktop-only / .mobile-only, switching at the tablet tier, 740px). The engine skips the hidden one,
     and only the visible one ever downloads its JSON (see ScrubStage). -->
<script>
  import StickyScroller from './StickyScroller.svelte';
  import ScrubStage from './ScrubStage.svelte';
  import { asset } from '$lib/assets.js';
  let { label, steps, height, desktop, mobile, fallback } = $props();

  const twins = [
    { class: 'desktop-only', path: desktop, aspect: '1800 / 1200' },
    { class: 'mobile-only', path: mobile, aspect: '800 / 1200' }
  ];
</script>

{#each twins as twin (twin.class)}
  <StickyScroller {label} {steps} {height} class={twin.class} showProgress={false}>
    {#snippet children({ progress, enhanced })}
      <ScrubStage path={asset(twin.path)} aspect={twin.aspect} {fallback} {progress} {enhanced} />
    {/snippet}
  </StickyScroller>
{/each}
