# Phase 2 · Chunk 07: The scroll engine and four scene types

**Goal:** Rebuild the reference template's scrollytelling system in Svelte 5: the **runway / sticky stage / progress**
model, plus its four scene types (**slides, band, arrange, scrub**). Every frame is server-rendered and every scene degrades
to a readable stack, and the same scenes work full-page (chunk 08) and as embeds in the React essay.

**Reference (read first):** [`docs/reference/scrolly-template-breakdown.md`](../../reference/scrolly-template-breakdown.md)
§10–16 (core math, the four scenes, the JS engine, no-JS gaps) and §19–20 (bugs to fix, what we keep).
Also `scrolly-template.html` itself (open it in a browser and scroll it), diatour-nyt-frontend §VIII.VI (step engine
principles) and diatour-nyt §III.III (restraint).
**Skills:** `svelte-runes`, `svelte-template-directives` (`{@attach}`, `{@render}`), `svelte-styling`, `sveltekit-structure` (SSR/hydration).

## Learn first
- [MDN: `position: sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky) and [the `svh` / `lvh` / `dvh` units](https://web.dev/blog/viewport-units)
- [Paul Lewis: Avoid layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing) (read all, then write all)
- [FLIP animations](https://aerotwist.com/blog/flip-your-animations/) (for Scene C at scale)
- [Lottie web: `goToAndStop`](https://airbnb.io/lottie/#/web) (for Scene D)

## Tasks

### Engine (`apps/graphics/src/lib/scrolly/`)
- [ ] `scroll-engine.ts`, **one per page** (a module singleton):
  - [ ] `register(runway, { steps, kind, onStep, onProgress })` returns `unregister`.
  - [ ] An IntersectionObserver (`rootMargin: '0px'`) keeps a **live set** of runways that are in view.
  - [ ] One `scroll` listener (`{ passive: true }`) and `resize`, throttled with rAF, measure **only live runways**:
    pass 1 reads every `getBoundingClientRect()`, pass 2 writes. No reads after writes in the same frame.
  - [ ] `p = clamp(−top / (height − stickyHeight), 0, 1)`, using the **sticky element's measured height**, not `innerHeight` (fixes breakdown #10).
  - [ ] `step = min(steps − 1, floor(p × steps))`. Call `onStep` **only when the step changes**, and `onProgress(p)` every frame for scrub scenes and the bar.
  - [ ] On resize or orientation change, reset each runway's last step and re-apply.
- [ ] `Runway.svelte`: `<section class="runway" style:--steps={steps}>` → `.sticky` → `{@render children({ step, p })}` + `<Progress>`.
  - [ ] **Enhance after hydrate:** the server HTML is a **static stack** (every frame visible, one after another). An `{@attach}`
    registers with the engine and sets `data-enhanced`. Only `.runway[data-enhanced]` gets `height: calc(var(--steps) * var(--runway-step))`,
    sticky positioning and hidden inactive frames. JS off or failing → a readable stack (fixes #1, #2).
  - [ ] Screen readers: an `<ol class="visually-hidden">` with every step's text. Frames are `aria-hidden` visuals with captions (fixes #4).
- [ ] `Progress.svelte`: 240px / 60vw bar, one marker per step at `i/(n−1)`. Visible only while `0 < p < 1`. `aria-hidden`.
- [ ] Tokens in `packages/design-system`: `--runway-step: 135svh`, `--ease-settle`, `--ease-fade`, `--ease-intro`, `--progress-w`.

### Scenes (`apps/graphics/src/lib/scrolly/scenes/`)
- [ ] **`SceneSlides.svelte` (A):** hard-cut frames. Heading at `10vh`, card `min(44.85vw, 15.625rem)`. Arrow API through CSS custom properties
  (`--arrow-top/left/length/stroke/mobile-stroke`). Portrait: thinner strokes, alternate arrows hidden.
- [ ] **`SceneBand.svelte` (B):** under 48em, caption area plus image. At ≥48em, a centered `65vh` band (17.5vh insets) with a `min(20vh, 5rem)` caption overlay.
  Captions stacked in one spot and faded with `--ease-fade` 0.4s. Images hard-cut.
- [ ] **`SceneArrange.svelte` (C):** per-step layout tables in % (`top`, `left|right`, `width`, `rot`, `op`, `z`) from ArchieML.
  Portrait scale ×1.6 capped at 70%. 0.95s `--ease-settle`. Uses **FLIP transforms** when there are more than 5 items (fixes #6).
- [ ] **`SceneScrub.svelte` (D):** `onProgress(p)` drives an SVG or Lottie (`goToAndStop(p × (frames − 1), true)`). Mobile and desktop twins,
  with only the visible twin registered. Reduced motion: show the end frame statically.
- [ ] Each scene is also an **embed** (`scene-*.server.ts`, `scene-*.client.ts`), so the React essay can use it through the chunk 05 contract.
- [ ] Preview route `/preview/scrolly` with all four scenes in the reference's order, using the reference's placeholder data.

### ArchieML shape
```
{.scrolly}
scene: arrange
steps: 3
[.captions]
* Step one caption
* Step two caption
* Step three caption
[]
[.layouts]
{.step}
[.items]
top: 25
left: 6
width: 37.5
rot: 0
op: .15
z: 2
…
[]
{}
[]
{}
```

## Done when
- The preview page scrolls exactly like `scrolly-template.html` at 375×812 and 1280×900, with step changes at the same scroll offsets
  (at 1280×900, runway A's step changes every **1065px**, per breakdown §10).
- **JS disabled**, and separately **JS blocked after load**: every scene reads as a stack of frames and captions with no blank runways.
- The scroll handler does nothing (no rect reads) when no runway is in view (check with a Performance recording).
- With reduced motion on, every step change is instant and Scene D shows its end frame.
- VoiceOver/NVDA reads every step's text in order.

## Concepts to write about
- The runway formula, in your own words, with a sketch
- Why IntersectionObserver alone can't drive a progress bar or a scrub
- Enhance-after-hydrate vs `@media (scripting: none)`, and which failure each one covers
