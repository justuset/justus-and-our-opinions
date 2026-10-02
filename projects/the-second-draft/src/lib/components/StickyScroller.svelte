<!-- StickyScroller: the shared scroll section, named like the blueprint's (§7.3). ✅ Engine on GSAP ScrollTrigger (NYT sandbox S4).
     A tall track holds a sticky, screen-sized panel. How far the reader has scrolled through the track decides the
     step. The section components (Slides/Caption/Paintings/ScrubLottie) render INSIDE it and receive
     { step, progress, enhanced } through the children snippet. Scenes need `enhanced` because their scoped CSS can't
     see this component's data-enhanced attribute; each scene puts class:enhanced on its own wrapper.

     Track height: the doc's `height` per section (the shipped page uses 900vh, 960svh and 500svh), or steps × 135svh.

     Accessibility: a visually hidden heading names the section, and a visually hidden <ol> holds every step's text.
     Scenes mark their visuals aria-hidden, because inactive frames are visibility: hidden once enhanced and a
     screen reader would never reach them (breakdown §19 #4).

     Two states:
     - Server / no JS / GSAP failed to load: a readable stack (step 0, progress 0, track not tall, panel not sticky, no bar).
     - Enhanced: once ScrollTrigger has loaded, the {@attach} below sets `enhanced`, which writes data-enhanced, and only
       [data-enhanced] gets the tall track, the pinned panel and the progress bar.
     The attribute is written in the template (not with runway.dataset) on purpose: Svelte removes scoped CSS selectors
     that match nothing in the markup, so a runtime-only attribute would have its rules pruned. -->
<script>
  import { tick } from 'svelte';
  import { loadScrollTrigger, stepOf, trackBounds } from '$lib/scroll.js';

  // `class` lets a caller add the twin utilities (.desktop-only / .mobile-only) to the track itself.
  // `showProgress: false` drops the progress bar, for scrubbed sections where discrete steps mean nothing.
  let { label, steps, height, stepTexts = [], class: className = '', showProgress = true, children } = $props();
  const headingId = $props.id(); // the same id on the server and after hydration
  let progress = $state(0);
  let enhanced = $state(false); // true once ScrollTrigger runs in the browser
  // Derived, not stored: Svelte only re-renders the scene when the step value actually changes.
  let step = $derived(stepOf(progress, steps));
  // The bar only shows while the panel is pinned.
  let barHidden = $derived(progress <= 0 || progress >= 1);

  /** Attachment: one ScrollTrigger for this track. Runs in the browser only, killed on destroy. */
  function engine(runway) {
    const sticky = runway.querySelector('.sticky');
    let trigger;
    let destroyed = false;
    loadScrollTrigger()
      .then(async (ScrollTrigger) => {
        if (destroyed) return;
        enhanced = true;
        await tick(); // let Svelte write data-enhanced first, so ScrollTrigger measures the tall track, not the stack
        if (destroyed) return;
        const read = (self) => {
          if (runway.offsetParent === null) return; // a hidden twin: skip it
          progress = self.progress;
        };
        trigger = ScrollTrigger.create({ trigger: runway, ...trackBounds(sticky), onUpdate: read, onRefresh: read });
      })
      .catch(() => {
        // GSAP didn't load (blocked or offline): the readable stack stays, which is the no-JS page.
      });
    return () => {
      destroyed = true;
      trigger?.kill();
      enhanced = false;
    };
  }
</script>

<section
  class="runway {className}"
  aria-labelledby={headingId}
  style:--steps={steps}
  style:--track-h={height}
  data-enhanced={enhanced || undefined}
  {@attach engine}
>
  <h2 class="visually-hidden" id={headingId}>{label}</h2>
  {#if stepTexts.length}
    <!-- Every step's text, in order, for screen readers (breakdown §19 #4). -->
    <ol class="visually-hidden">
      {#each stepTexts as t, i (i)}<li>{t}</li>{/each}
    </ol>
  {/if}
  <div class="sticky">
    {@render children({ step, progress, enhanced })}
    <!-- Markers are server-rendered, so the structure exists without scripting. Marker i sits at i / steps: where step i
         begins, so each one lights up exactly when the fill reaches it. -->
    {#if showProgress}
      <div class="progress" class:hidden={barHidden} aria-hidden="true">
        <div class="progress-fill" style:transform="scaleX({progress})"></div>
        {#each { length: steps } as _, i (i)}
          <span class="progress-marker" class:on={i <= step} style:left="{(i / steps) * 100}%"></span>
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

  /* Enhanced: the track / sticky pattern. The stack's margins go. */
  .runway[data-enhanced] { margin: 0; height: var(--track-h, calc(var(--steps) * var(--runway-step))); }
  /* The panel pins just below the platform masthead and fills the rest of the screen (NYT sandbox S2). */
  [data-enhanced] .sticky {
    position: sticky;
    top: var(--masthead-h);
    height: calc(100vh - var(--masthead-h)); /* fallback for browsers without svh */
    height: calc(100svh - var(--masthead-h));
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
  /* The fill is full width and scaled, not resized: a transform is composited, so the bar costs no layout per frame. */
  .progress-fill { height: 100%; background: var(--ink); transform-origin: left center; }
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
