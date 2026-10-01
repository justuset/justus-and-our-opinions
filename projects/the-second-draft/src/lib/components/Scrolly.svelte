<!-- Scrolly: the shared scroll section (prototype chunk 8). ✅ Engine ported.
     A tall runway (height = steps × 135svh) holds a sticky, screen-sized panel. How far the reader has scrolled through
     the runway decides the step. The section components (Slides/Caption/Paintings/ScrubLottie) render INSIDE it and
     receive { step, progress, enhanced } through the children snippet. Scenes need `enhanced` because their scoped
     CSS can't see this component's data-enhanced attribute; each scene puts class:enhanced on its own wrapper.

     Accessibility: a visually hidden heading names the section, and a visually hidden <ol> holds every step's text.
     Scenes mark their visuals aria-hidden, because inactive frames are visibility: hidden once enhanced and a
     screen reader would never reach them (breakdown §19 #4).

     Two states:
     - Server / no JS: a readable stack (step 0, progress 0, runway not tall, panel not sticky, no progress bar).
     - Enhanced: the {@attach} below sets `enhanced`, which writes data-enhanced, and only [data-enhanced] gets the tall runway, the pinned
       panel and the progress bar. If the script never runs, the reader still gets every step's content.
     The attribute is written in the template (not with runway.dataset) on purpose: Svelte removes scoped CSS selectors
     that match nothing in the markup, so a runtime-only attribute would have its rules pruned. -->
<script>
  import { onScrollFrame, progressOf, stepOf } from '$lib/scroll.js';

  // `class` lets a caller add the twin utilities (.desktop-only / .mobile-only) to the runway itself.
  // `bar: false` drops the progress bar, for scrubbed sections where discrete steps mean nothing.
  let { label, steps, stepTexts = [], class: className = '', bar = true, children } = $props();
  const headingId = $props.id(); // the same id on the server and after hydration
  let step = $state(0);
  let progress = $state(0);
  let enhanced = $state(false); // true once the engine runs in the browser
  // The bar only shows while the panel is pinned (derived, not stored).
  let barHidden = $derived(progress <= 0 || progress >= 1);

  /** Attachment: registers this runway with the shared engine. Runs in the browser only, cleans up on destroy. */
  function engine(runway) {
    const sticky = runway.querySelector('.sticky');
    enhanced = true;
    const stop = onScrollFrame(() => {
      if (runway.offsetParent === null) return; // a hidden twin: skip it
      progress = progressOf(runway, sticky);
      step = stepOf(progress, steps); // Svelte only re-renders the scene when the value actually changes
    });
    return () => {
      stop();
      enhanced = false;
    };
  }
</script>

<section class="runway {className}" aria-labelledby={headingId} style:--steps={steps} data-enhanced={enhanced || undefined} {@attach engine}>
  <h2 class="visually-hidden" id={headingId}>{label}</h2>
  {#if stepTexts.length}
    <!-- Every step's text, in order, for screen readers (breakdown §19 #4). -->
    <ol class="visually-hidden">
      {#each stepTexts as t, i (i)}<li>{t}</li>{/each}
    </ol>
  {/if}
  <div class="sticky">
    {@render children({ step, progress, enhanced })}
    <!-- Markers are server-rendered, so the structure exists without scripting. Marker i sits at i / (n − 1). -->
    {#if bar}
      <div class="progress" class:hidden={barHidden} aria-hidden="true">
        <div class="progress-fill" style:width="{progress * 100}%"></div>
        {#each { length: steps } as _, i (i)}
          <span class="progress-marker" class:on={i <= step} style:left="{steps > 1 ? (i / (steps - 1)) * 100 : 0}%"></span>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  /* Base state = a readable stack. */
  .runway { position: relative; margin: 40px 0; }
  .sticky { position: relative; }
  .progress { display: none; }

  /* Enhanced: the runway / sticky pattern. */
  .runway[data-enhanced] { height: calc(var(--steps) * var(--runway-step)); }
  [data-enhanced] .sticky {
    position: sticky;
    top: 0;
    height: 100vh; /* fallback for browsers without svh */
    height: 100svh;
    overflow: hidden;
  }
  [data-enhanced] .progress {
    display: block;
    position: absolute;
    bottom: var(--progress-bottom);
    left: 50%;
    transform: translateX(-50%);
    width: var(--progress-w);
    height: 3px;
    background: var(--line);
    transition: opacity 0.3s;
  }
  .progress.hidden { opacity: 0; }
  .progress-fill { height: 100%; background: var(--ink); }
  .progress-marker {
    position: absolute;
    top: 50%;
    width: var(--marker);
    height: var(--marker);
    border-radius: 50%;
    background: var(--line);
    transform: translate(-50%, -50%);
  }
  .progress-marker.on { background: var(--ink); }
  @media (prefers-reduced-motion: reduce) {
    [data-enhanced] .progress { transition: none; } /* same specificity as the rule that sets it */
  }
</style>
