# Chunk 10: Scrubbed Lottie, then hardening

**One new idea, in two parts:** **scroll-scrubbing vs autoplay** (the animation's playhead *is* the scroll position),
then the **production layer**: reduced motion, no-JS fallbacks, lazy loading and responsive images.

**Reference:** breakdown §14 (scene D), §16 (reduced motion and no-JS, and its gaps), §19 (all fixes).

## Build, part 1: scrub
- [ ] Get two Lottie files, `assets/scrub-desktop.json` (landscape) and `assets/scrub-mobile.json` (portrait). Either export your own
      from After Effects with Bodymovin, or use a free animation from LottieFiles **and record its license and credit**.
- [ ] Two runways with `--steps: 2.5`, one `.desktop-only` and one `.mobile-only`, each with a `<div class="scrub-stage">`.
- [ ] Load lottie-web (`<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js">`, `defer`).
- [ ] For each **visible** twin only:
  ```js
  const anim = lottie.loadAnimation({ container, renderer: 'svg', loop: false, autoplay: false, path: 'assets/scrub-desktop.json' });
  // in update(): for scrub runways, skip the step logic
  anim.goToAndStop(p * (anim.totalFrames - 1), true);   // true = frame number, not milliseconds
  ```
- [ ] Add `d: renderD` to the renderers, called **every frame** with `p` (not only on step change).

## Build, part 2: hardening
- [ ] **Reduced motion:**
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; } }`.
  In JS, when reduced motion is on, show scene D's **last frame** statically and skip the scrub.
- [ ] **No-JS fallback:** the reference uses `@media (scripting: none)`. Keep that, **and** gate everything scroll-specific behind a
      `.scrolly-ready` class that the script adds **as its last line, after the engine has set up successfully**. Unlike chunk 5's `.js` class
      (set in `<head>` before anything can fail), this one proves the engine actually works, so it covers JS that's enabled but crashes (breakdown §19 #2):
  ```css
  /* base = a static, readable stack of frames and captions */
  .scrolly-ready .runway { height: calc(var(--steps) * var(--runway-step)); }
  .scrolly-ready .sticky { position: sticky; top: 0; height: 100svh; }
  .scrolly-ready .frame  { position: absolute; opacity: 0; visibility: hidden; }
  ```
  ```js
  // …all setup above…
  update();
  document.documentElement.classList.add('scrolly-ready');   // last line: only reached if nothing threw
  ```
  Move chunk 8–9's runway, sticky and frame rules under `.scrolly-ready`.
- [ ] **Lazy loading:** `loading="lazy" decoding="async"` on every image below the header. Only load a Lottie when its runway nears the viewport (IntersectionObserver, `rootMargin: '200px'`).
- [ ] **`srcset`:** two-up and scene B images get `srcset="… 800w, … 1600w"` with `sizes` matching their real rendered width
      (two-up ≥640: `(min-width: 1250px) 656px, (min-width: 640px) 50vw, 100vw`). Always set `width` and `height`.
- [ ] Alt text on every meaningful image. `aria-hidden` on purely decorative SVGs.

## Learn
- Scrub vs autoplay: autoplay runs on a clock, while scrub runs on the reader's thumb. Scrubbing lets readers control pace and rewind, which suits explanatory animation.
- `goToAndStop(frame, true)`: the second argument says "this is a frame number." Without it, Lottie treats the value as milliseconds.
- `(scripting: none)` covers JS turned **off**. The `.js` class covers JS that is **on but broken**. You want both.
- `srcset` + `sizes` let the browser choose the smallest file that's sharp enough for the slot.

## Checkpoint
- [ ] Scene D: scroll forward and the animation plays. Scroll back and it rewinds. Stop and it holds. Only one twin loads (check the Network panel: one `.json`).
- [ ] **Lighthouse** (mobile): Performance ≥ 90, Accessibility 100, Best Practices ≥ 95. Note CLS (target < 0.05).
- [ ] **Reduced motion** on (Rendering panel): no transitions, and scene D shows its end frame.
- [ ] **JavaScript off** (⌘⇧P → Disable JavaScript): the whole page reads top to bottom, with every frame and caption of A, B and C stacked, no blank runways,
      and the header text visible.
- [ ] **JS on but broken** (add `throw new Error()` at the top of your main script): the same readable stack appears, and the headline shows after 2.5s (chunk 5's failsafe).
- [ ] The full-page accessibility tree still reads in order, and every step's text is reachable.

When all boxes are ticked, Phase 1's main path is done. 🎉 Write `docs/learning-log/` "Phase 1 retro", then go to chunk 11 or [Phase 2](../phase-2/README.md).
