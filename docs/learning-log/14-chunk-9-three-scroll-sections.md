# Learning log 14: Phase 1, chunk 9: The three scroll sections

**Date:** 2026-10-01  **Chunk:** Phase 1 · 9  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **separate the engine from what each step renders.** Chunk 8's engine computes a step. This chunk adds three scenes, each answering only one question: what does step *n* look like?

| Scene | Steps | Motion idea | What changes per step |
|---|---|---|---|
| A: slides | 6 | **cut** | one frame becomes visible |
| B: marked-up pages | 5 | **fade** the words, **cut** the images | one caption fades in, one image cuts in |
| C: three arguments | 3 | **settle** | each card's position, size, tilt, opacity and stacking |

## What I did (prototype)

- **The engine barely changed.** `update()` lost its debug lines and gained one call: `renderers[runway.dataset.scrolly]?.(el, step)`, made only when the step changes. Adding a scene now means adding a renderer, not editing the engine.
- **A:**
  - Six frames written **in HTML** (the reference built them with `innerHTML`, so they vanished without JS).
  - Frames stack with `position: absolute; inset: 0`, and only `.is-active` is visible. It's a hard cut, with no transition.
  - The card is `min(44.85vw, 250px)` square; the heading sits at `top: 10vh`.
  - Arrows are placed through custom properties (`--arrow-top`, `--arrow-left`, `--arrow-length`, `--arrow-stroke`). Each one sets `--arrow-length: min(18vw, 120px)` inline. In portrait, every second arrow hides and the strokes thin.
- **B:**
  - Five captions sit absolutely in the same spot, so captions of different lengths never shift the layout. They fade over 0.4s with `--ease-fade`. The images cut.
  - Phones: a caption area at least 30vh tall, with the image filling the rest.
  - From 768px: a band from 17.5vh to 82.5vh, with an 80px caption slot.
- **C:**
  - Three cards, plus a table of layouts: one array per step, one object per card, all in **% of the stage**.
  - The renderer writes `top`, `left` or `right`, `width`, `z-index`, `opacity` and `rotate()` inline; CSS transitions them over 0.95s with `--ease-settle`.
  - On portrait screens widths are ×1.6, capped at 70%. A `matchMedia('(orientation: portrait)')` listener resets every runway's `last` so the layout re-applies after rotating.
- **Reduced motion:** the caption fades, card moves and progress bar fade drop to 0s. Steps still change, just instantly.

## Accessibility: a different approach from the plan

Once a frame is inactive it's `visibility: hidden`, which also removes it from the accessibility tree. So a screen-reader user would only ever hear the current step. Instead:

- Each runway gets a visually hidden `<h2>` (the section's name, linked with `aria-labelledby`) and a visually hidden `<ol>` holding every step's text in order.
- The visual layer (frames, captions, cards) is `aria-hidden="true"`.

Result in the accessibility tree: `region "Five marked-up pages…"` → `heading` → `list` with 5 items, whatever step is on screen. Scene C's on-screen caption is filled from that same list (`ol li[step].textContent`), so the text exists in one place.

## Step 0 is in the HTML

The first frame has `is-active`, the first caption has `is-visible`, and C's cards carry step 0's layout as inline styles. The page looks right before any script runs, and the scene doesn't jump when the script does. Chunk 10 handles the case where the script never runs at all.

## Checkpoint results

The test scrolled each runway in 40px increments and, at every stop, compared the visible frame or caption with the step computed from the runway's position.

| Size | A frame/step mismatches | Arrows shown | B band (top to bottom) | C widths at step 2, unrotated | Horizontal scroll |
|---|---|---|---|---|---|
| 1280×900 | 0 | 5, 2px | 158–743px (17.5vh–82.5vh) | 30 / 36 / 26% | none |
| 1024×768 | 0 | 5, 2px | 134–633px | same | none |
| 768×1024 (portrait) | 0 | 3, 1.5px | 179–845px | 48 / 57.6 / 41.6% (×1.6) | none |
| 375×812 (portrait) | 0 | 3, 1.5px | 30vh caption area, image below | ×1.6 | none |

- **Each step change happens once.** A `MutationObserver` counted C's caption changing exactly twice on the way through (0→1→2), and A and B's frames gained `is-active` once per step.
- **Built project:** identical numbers at all four sizes.
- **No JS (project):** all six slides, all five pages with captions, and the three cards in a row, each a readable stack.
- **Nu HTML Checker:** no errors (after one fix, below).

## Port

- **`Scrolly.svelte`:**
  - Now passes `{ step, progress, enhanced }` to its snippet.
  - Renders the hidden `<h2>`. Its id comes from `$props.id()`, so the server and the browser generate the same id and hydration matches.
  - Turns the progress bar's fade off under reduced motion.
- **Each scene puts `class:enhanced` on its own wrapper.** A component's scoped CSS can't see a parent component's attribute, so `Scrolly`'s `data-enhanced` was out of reach. Passing the boolean down through the snippet is the Svelte way to share it.
  - **Without `enhanced`:** a readable stack.
  - **With it:** the reference's layout.
- **`CaptionScrolly`:**
  - In the stack, each caption should sit above its page, but they live in two separate lists.
  - `display: contents` on both list wrappers turns every caption and page into flex items of one container.
  - An inline `order` (caption *i* = 2*i*, page *i* = 2*i* + 1) interleaves them, for any number of steps.
- **`PaintingsScrolly`:** layouts are computed in the template from `step` and a `portrait` `$state`. A `matchMedia` listener sets `portrait` inside an `{@attach}`, never at the top level, because that code also runs on the server. Inline layout styles are written only when `enhanced` is true.

## What broke and how I fixed it

1. **`<svg>` after `<figcaption>`.** I first made the slide card a `<figure>` with a `<figcaption>` label and the arrow after it. The Nu checker rejected it: a `figcaption` must be the first or last child. The frames are visual-only (`aria-hidden`) anyway, so the card became a `div` with a `p`. (Fixing it with a regex also clobbered the two-up's real `</figcaption>`. The validator caught that too.)
2. **B's image overflowed the band.** `height: 100%` on an image inside a grid frame resolved to nothing. The grid's row is auto-sized, so the percentage has no definite height to resolve against and the image fell back to its natural 900px. Fix: pin it with `position: absolute; inset: 0` inside the frame.
3. **Reduced motion didn't stop the progress bar fade in the project.** The rule `.progress { transition: none }` lost to `[data-enhanced] .progress { transition: … }`, which has an extra attribute selector. The fix was to match the selector inside the media query. Lesson: an override must match the specificity of the rule it overrides, not just come later.

## Concepts learned

- **Engine vs. renderer:** the engine produces numbers (progress, step), and renderers turn numbers into pixels. Keep the boundary sharp and each side stays small.
- **Three motion vocabularies:** cut (slides), fade (words) and settle (objects), one idea per scene (breakdown §18).
- **`vh` for compositions pinned to the screen; `%` of the stage for object layouts.** Both keep proportions on any screen.
- **Anchor right-side objects with `right`,** so they stay attached to the right edge as the stage narrows.
- **Orientation queries, not width,** for the arrows: a landscape phone and a desktop share a layout.
- **Animating `top`/`left`/`width` costs layout every frame.** That's fine for three cards. Phase 2 uses FLIP transforms when there are more.

## Next

[Chunk 10: scrubbed Lottie, then hardening](../plan/phase-1/10-scrubbed-lottie-and-hardening.md).
