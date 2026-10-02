# Learning log 15: Phase 1, chunk 10: Scrubbed Lottie and hardening

**Date:** 2026-10-01  **Chunk:** Phase 1 · 10  **Branch:** `claude/wonderful-knuth-w43l2c`

> **Later changes (as of 2026-10-02):** The project's `srcset` sources moved from `{ "400w": path }` objects in `story.json` to plain srcset strings in `doc.json` (`"images/a-400w.webp 400w, images/a.webp 800w"`) (S1, [log 20](20-s1-body-document.md)).

## Goal

Two parts:

1. **Scroll-scrubbing.** Scene D's animation playhead *is* the scroll position: scroll down and it plays, scroll up and it rewinds, stop and it holds.
2. **The production layer.** The page still works when motion is unwelcome, JavaScript is off, JavaScript crashes, or a file fails to load. Images load lazily and at the right size.

## Part 1: the scrub

### The animation

The project's two Lottie files were a single moving dot. I replaced them with something that says what the section is about, "a draft condensing into its final form," made by a small generator, `scripts/make-scrub-lottie.js`:

- a page with 12 bars of "text";
- 7 bars shrink to nothing and fade, staggered 4 frames apart (frames 6–40);
- the 5 survivors slide up to close the gaps (frames 30–54), and the page shortens to fit.

The script exists for learning as much as for the asset. A Lottie file is just JSON: a canvas (`w`, `h`), a frame range (`ip`/`op`, `fr`), and layers whose properties are either still (`{ a: 0, k: value }`) or keyframed (`{ a: 1, k: [{ t, s, i, o }, …] }`). We wrote it ourselves, so there's no license or credit to record. A real project would export from After Effects with Bodymovin.

**Two Lottie surprises:**
- A fill's color alpha is **ignored**. My first page rendered solid white. Fill opacity is a separate `o` value from 0 to 100.
- Scaling a 1px rounded rectangle up distorts its corners. Animate the rectangle's own `s` (size) instead of the layer's scale.

### The prototype

- Two runways with `--steps: 2.5`, one `.desktop-only` (1800×1200 landscape file) and one `.mobile-only` (800×1200 portrait file).
- In `update()`, scrub runways skip the step logic entirely: `if (r.kind === 'd') { r.scrub?.(p); continue; }`. The scrub function is `p => anim.goToAndStop(p * (totalFrames − 1), true)`, where `true` means "frame number, not milliseconds."
- **Loading:** an `IntersectionObserver` with `rootMargin: '200px'` watches the D runways. A `display: none` twin never intersects, so **the hidden twin's file is never requested**. The library itself is injected only then, too.
- **Why not a `defer` script, as the plan said?** Deferred scripts run *after* the document is parsed, which means after our inline script at the end of `<body>`, so `lottie` wouldn't exist yet. Injecting it on demand fixes the ordering, and nobody downloads the library unless they scroll near scene D.

### Checkpoint (prototype at 1280×900 and 375×812; the built project gave identical numbers)

| Check | Result |
|---|---|
| JSON requested before scrolling near D | none |
| JSON requested after | **only** `scrub-desktop.json` (1280) or **only** `scrub-mobile.json` (375) |
| Animation size | 720px tall at 900 (80%), 650px at 812 (80%) |
| Visible layers at p = 0 → .25 → .5 → .75 → 1 → .5 → 0 | 13 → 11 → 8 → 6 → 6 → **8 → 13**: plays forward, rewinds backward |
| Reduced motion | 6 at every position: the end frame, held still |
| JSON fails to load | the stage gets `scrub-failed`, the empty box hides, and the text description stays on screen |

## Part 2: hardening

### `.scrolly-ready`: the base is the stack

Until now, the scroll layout was the base CSS. If JS was off or crashed, readers got 7,000px runways with hidden frames, the reference's worst bug (breakdown §19 #2). Now:

- **The base CSS is the static stack:** every frame, caption and card in reading order.
  - B interleaves caption, page, caption, page using `display: contents` and an inline `order`.
  - C lists all three captions above one row of cards.
- **Every scroll rule lives under `.scrolly-ready`:** tall runways, sticky panels, absolute frames, `visibility: hidden`, the progress bar and transitions.
- **The script adds `.scrolly-ready` as its last step.** Reaching that line proves all the setup above it ran. One refinement on the plan: the class goes on *just before* the first `update()`, because the first measurement has to happen in the scroll layout. If that `update()` throws, the class comes off again.

**Why no `@media (scripting: none)`?** The reference needs that block to *undo* its scroll layout when scripting is off. Here the scroll layout never applies without the class, so there's nothing to undo. The `.js` class from chunk 5 still does its own job, hiding the headline's start state only when JS runs. Each switch covers a different failure:

| Situation | `.js` (in `<head>`) | `.scrolly-ready` (last line) | What the reader gets |
|---|---|---|---|
| JS on and working | ✅ | ✅ | the scroll experience |
| JS off | ❌ | ❌ | header visible, every section stacked |
| JS on, page script crashes | ✅ (2.5s failsafe reveals the headline) | ❌ | header after 2.5s, every section stacked |
| JS on, Lottie JSON or library fails | ✅ | ✅ | everything works; scene D shows its text |

Measured (prototype and build identical):
- **JS off:** runways 2036 / 2630 / 333 / 24px; 0 of 11 frames hidden; all 5 B captions visible; C's caption list 600px wide; headline visible.
- **JS broken** (I made `ResizeObserver` throw, so the page script dies early): the same numbers, plus the error.

### The rest

- **Reduced motion:** one global rule, `*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important }`. Steps still change, instantly. Scene D jumps to its last frame and stops following the scroll.
- **Lazy loading:** `loading="lazy" decoding="async"` on every image below the header (16 in the prototype).
- **`srcset`:** I made half-size variants with ImageMagick (`two-up-draft-*-400w.webp`, `marked-up-*-600w.webp`).
  - Two-up: `sizes="(min-width: 1250px) 656px, (min-width: 640px) 50vw, 100vw"`.
  - B: `sizes="(min-width: 768px) calc(100vw - 80px), calc(100vw - 32px)"`.
  - In the project, `story.json` lists the files by width (`{ "400w": …, "800w": … }`), and `$lib/media.js` turns that into the attribute. The build's media check now verifies **23** URLs (16 before, plus the 7 variants).
- **Accessibility tree:** the full page, prototype vs build, is **identical**: h1, byline, text, figure with two described images, the diagram list, then for each scroll section a region, an h2 and its step list. Scene D's description is still read once the animation shows, because it's visually hidden, not removed.

### Lighthouse (mobile, run with the npm `lighthouse` package against headless Chromium)

| | Performance | Accessibility | Best Practices | CLS | LCP | TBT |
|---|---|---|---|---|---|---|
| Target | ≥ 90 | 100 | ≥ 95 | < 0.05 | | |
| Prototype | **97** | **100** | **96** | **0** | 1.7s | 0ms |
| Built project | **97** | **100** | **96** | **0** | 1.6s | 10ms |

The one failing audit in both is "errors in console": Google Fonts is blocked in this test sandbox, so its request fails. On an open network that audit should pass.

## Port

- **`ScrubLottie.svelte`:** two `Scrolly` runways, one per twin. `Scrolly` gained two props: `class` (so a caller can add `.desktop-only`) and `bar` (off for scrub sections, since 2.5 "steps" has no meaningful markers).
- **`ScrubStage.svelte` (new):** one twin's stage, made a separate component to keep two jobs apart:
  - an **`{@attach}` loads** the animation once, when the stage is within 200px;
  - an **`$effect` feeds** it `progress` on every change.

  In one attachment, both would break: an attachment re-runs whenever a value it reads changes, so reading `progress` there would tear down and reload the Lottie on every scroll frame.
- **Reduced motion:** Svelte's built-in `prefersReducedMotion.current` (from `svelte/motion`), a reactive value that's SSR-safe.
- **`lottie.js`:** `scrubber()` now **rejects** when the JSON fails (Lottie's `data_failed` event), so `ScrubStage` can set `failed` and keep its text.
- **Hardening:** the project's components already worked this way since chunk 8. `data-enhanced` is the project's `.scrolly-ready`: set by the attachment after hydration, so a failed hydration leaves the stack. The global reduced-motion rule went into `app.css`.

## What broke and how I fixed it

1. **`file://` can't load Lottie JSON.** Opened straight from disk, the prototype's scene D failed with a CORS error. Browsers block XHR from `file://` pages. The failure path worked as designed (text stayed on screen), which was a nice accidental test. From this chunk on, open the prototype through a local server (`python3 -m http.server -d prototype`), as the plan README says.
2. **A % height inside a grid, again.** Scene D's `height: 80%` would have hit the same auto-row problem as scene B's image in chunk 9, so the stage uses flex (`align-items: center`). A flex item's percentage height resolves against the container's definite height.
3. **The failed state squeezed the text.** In the project, a failed load left the empty animation box taking up the row, and the description shrank to 200px wide. Fixed with `class:failed` hiding the box, matching the prototype (462px).

## Concepts learned

- **Scrub vs autoplay:** autoplay runs on a clock; scrub runs on the reader's thumb. Scrub suits explanation, because readers set the pace and can go back.
- **Enhance, don't degrade:** write the page that works with nothing, then add a class that proves the enhancement is ready, and put every enhanced rule behind it.
- **Lazy at three levels:** images (`loading="lazy"`), data (the JSON, on intersection) and code (the library itself, on demand).
- **`srcset` + `sizes`:** `srcset` says which files exist and how wide they are; `sizes` says how wide the slot will be. The browser does the math using the screen's pixel density.
- **Attachment vs effect:** attachments are for setting up DOM things once; effects are for keeping something in sync with changing state.

## Next

[Chunk 11: finish the port and verify parity](../plan/phase-1/11-optional-svelte-port.md).
