<!-- Scrolly: the shared scroll section (prototype chunk 8).
     A tall runway (height = steps × 135svh) holds a sticky, screen-sized panel. How far the reader has scrolled through
     the runway decides the step. The section components (Slides/Caption/Paintings/ScrubLottie) render INSIDE it and
     receive { step, progress } through the children snippet.

     STATUS: renders the no-JS state, a readable stack (step 0, progress 0, runway not tall, panel not sticky).
     When chunk 8 passes: an {@attach} registers the runway with $lib/scroll.js and adds data-enhanced, and only
     [data-enhanced] gets the tall runway and sticky panel (the .scrolly-ready gate from chunk 10). -->
<script>
  let { label, steps, stepTexts = [], children } = $props();
  let step = $state(0);
  let progress = $state(0);
</script>

<section class="runway" aria-label={label} style:--steps={steps}>
  {#if stepTexts.length}
    <!-- Every step's text, in order, for screen readers (breakdown §19 #4). -->
    <ol class="visually-hidden">
      {#each stepTexts as t, i (i)}<li>{t}</li>{/each}
    </ol>
  {/if}
  <div class="sticky">
    {@render children({ step, progress })}
  </div>
</section>

<style>
  /* Base state = a readable stack. The enhanced (sticky, tall-runway) rules are added in chunk 8. */
  .runway { position: relative; margin: 40px 0; }
  .sticky { position: relative; }
</style>
