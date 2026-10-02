# Chunk 10: Scrubbed Lottie, then hardening

**One new idea, in two parts:** **scroll-scrubbing vs autoplay** (the animation's playhead *is* the scroll position),
then the **production layer**: reduced motion, no-JS fallbacks, lazy loading and responsive images.

**Reference:** breakdown §14 (scene D), §16 (reduced motion and no-JS, and its gaps), §19 (all fixes).

## Build, part 1: scrub
- [x] Get two Lottie files, `assets/scrub-desktop.json` (landscape) and `assets/scrub-mobile.json` (portrait). Either export your own
      from After Effects with Bodymovin, or use a free animation from LottieFiles **and record its license and credit**.
- [x] Two runways with `--steps: 2.5`, one `.desktop-only` and one `.mobile-only`, each with a `<div class="scrub-stage">`.
- [x] Load lottie-web (`<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js">`, `defer`).
- [x] For each **visible** twin only:
  ```js
  const anim = lottie.loadAnimation({ container, renderer: 'svg', loop: false, autoplay: false, path: 'assets/scrub-desktop.json' });
  // in update(): for scrub runways, skip the step logic
  anim.goToAndStop(p * (anim.totalFrames - 1), true);   // true = frame number, not milliseconds
  ```
- [x] Add `d: renderD` to the renderers, called **every frame** with `p` (not only on step change).

## Build, part 2: hardening
- [x] **Reduced motion:**
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; } }`.
  In JS, when reduced motion is on, show scene D's **last frame** statically and skip the scrub.
- [x] **No-JS fallback:** the reference uses `@media (scripting: none)`. Keep that, **and** gate everything scroll-specific behind a
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
- [x] **Lazy loading:** `loading="lazy" decoding="async"` on every image below the header. Only load a Lottie when its runway nears the viewport (IntersectionObserver, `rootMargin: '200px'`).
- [x] **`srcset`:** two-up and scene B images get `srcset="… 800w, … 1600w"` with `sizes` matching their real rendered width
      (two-up ≥640: `(min-width: 1250px) 656px, (min-width: 640px) 50vw, 100vw`). Always set `width` and `height`.
- [x] Alt text on every meaningful image. `aria-hidden` on purely decorative SVGs.

## Learn
- Scrub vs autoplay: autoplay runs on a clock, while scrub runs on the reader's thumb. Scrubbing lets readers control pace and rewind, which suits explanatory animation.
- `goToAndStop(frame, true)`: the second argument says "this is a frame number." Without it, Lottie treats the value as milliseconds.
- `(scripting: none)` covers JS turned **off**. The `.js` class covers JS that is **on but broken**. You want both.
- `srcset` + `sizes` let the browser choose the smallest file that's sharp enough for the slot.

## Checkpoint
- [x] Scene D: scroll forward and the animation plays. Scroll back and it rewinds. Stop and it holds. Only one twin loads (check the Network panel: one `.json`).
- [x] **Lighthouse** (mobile): Performance ≥ 90, Accessibility 100, Best Practices ≥ 95. Note CLS (target < 0.05).
- [x] **Reduced motion** on (Rendering panel): no transitions, and scene D shows its end frame.
- [x] **JavaScript off** (⌘⇧P → Disable JavaScript): the whole page reads top to bottom, with every frame and caption of A, B and C stacked, no blank runways,
      and the header text visible.
- [x] **JS on but broken** (add `throw new Error()` at the top of your main script): the same readable stack appears, and the headline shows after 2.5s (chunk 5's failsafe).
- [x] The full-page accessibility tree still reads in order, and every step's text is reachable.

## Result
Built and verified: see [learning log 15](../../learning-log/15-chunk-10-scrub-and-hardening.md). Where this plan
changed in practice:
- **The Lottie files are self-authored** by `projects/interactive/scripts/make-scrub-lottie.js` (12 lines condense to 5), so there's no third-party license to record.
- **lottie-web isn't a `defer` script.** A deferred script runs *after* the inline page script, so `lottie` wouldn't exist yet. The page script injects the library itself, only when a scene D runway comes within 200px.
- **No `@media (scripting: none)` block.** The base CSS *is* the no-script stack, and every scroll rule lives under `.scrolly-ready`, so there's nothing to undo.
- **`.scrolly-ready` goes on just before the first `update()`, not after it.** The first measurement has to happen in the scroll layout. If that `update()` throws, the class comes off again.
- **Open the prototype through a local server from now on.** Lottie loads its JSON with XHR, which `file://` pages can't do. The text fallback stays on screen when that happens.

Measured: Lighthouse mobile **97 / 100 / 96** (Performance / Accessibility / Best Practices), CLS **0**. The one failed audit is console errors from Google Fonts being blocked in the test sandbox.

When all boxes are ticked, Phase 1's main path is done. 🎉 Write `docs/learning-log/` "Phase 1 retro", then go to chunk 11 or [Phase 2](../phase-2/README.md).

## Port (after the checkpoint passes) ✅
Into `projects/interactive/`: `src/lib/components/ScrubLottie.svelte` with `src/lib/lottie.js` `scrubber()` (twins, loading only the visible one). The hardening rules go into `src/app.css` and the components. Media is already wired: `srcset`/`loading` on every `<img>`, and `big_assets/videos/*.json` for the Lottie files. Rebuild with `npm run build`, check JS on and off, and mark the component ✅ (see [`docs/project-structure.md`](../../project-structure.md) §11).
