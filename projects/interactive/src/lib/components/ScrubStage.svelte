<!-- ScrubStage: one scroll-scrubbed Lottie (prototype chunk 10). ✅ Used by ScrubLottie (one per twin).
     A separate component so the two jobs stay apart:
     - the {@attach} LOADS the animation once, when the stage comes within 200px of the screen;
     - the $effect FEEDS it the progress on every change.
     If both lived in one attachment, every progress change would tear the animation down and load it again,
     because an attachment re-runs whenever a value it reads changes.
     Base: the text description. Once loaded, the description moves to screen readers only; if loading fails it stays. -->
<script>
  import { scrubber } from '$lib/lottie.js';
  import { prefersReducedMotion } from 'svelte/motion';

  let { path, aspect, fallback, progress = 0, enhanced = false } = $props();

  let seek = $state(null); // set once the animation is ready
  let failed = $state(false);

  /** Attachment: wait until the stage is near, then load. A display: none twin never intersects, so it never loads. */
  function lazyLottie(stage) {
    let cancelled = false;
    let loaded;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        scrubber(stage.querySelector('.scrub-anim'), path)
          .then((s) => (cancelled ? s.destroy() : (seek = loaded = s)))
          .catch(() => (failed = true)); // keep the text description on screen
      },
      { rootMargin: '200px' }
    );
    near.observe(stage);
    return () => {
      cancelled = true;
      near.disconnect();
      loaded?.destroy();
    };
  }

  // Reduced motion: hold the end frame. Otherwise the playhead is the scroll position.
  $effect(() => {
    seek?.(prefersReducedMotion.current ? 1 : progress);
  });
</script>

<div
  class="scrub-stage"
  class:enhanced
  class:loaded={seek !== null && !failed}
  class:failed
  style:--aspect={aspect}
  {@attach lazyLottie}
>
  <p class="scrub-fallback">{fallback}</p>
  <div class="scrub-anim" aria-hidden="true"></div>
</div>

<style>
  /* Base: the text description, in the column. */
  .scrub-stage { width: var(--col); margin: 0 auto; }
  .scrub-fallback { margin: 0; color: var(--soft); font: 1rem / 1.5 var(--font-body); text-align: center; }
  .scrub-anim { display: none; }

  /* Enhanced: a pinned stage; the animation is 80% of the screen tall. Flex, not grid, so the % height resolves. */
  .enhanced { width: 100%; height: 100%; margin: 0; display: flex; align-items: center; justify-content: center; }
  .enhanced .scrub-anim { display: block; height: 80%; aspect-ratio: var(--aspect); max-width: calc(100% - 32px); }
  .enhanced.failed .scrub-anim { display: none; } /* nothing to show: give the description the stage */
  .enhanced.loaded .scrub-fallback {
    position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap;
  }
</style>
