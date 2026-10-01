# Learning log 11: Phase 1, chunk 6: Two-up images and desktop/mobile twins

**Date:** 2026-10-01  **Chunk:** Phase 1 · 6  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **mobile-first `min-width` queries**, and swapping **whole components** (twins) instead of reflowing one.

## What I did (prototype)

- **Two-up:** a `<figure class="two-up bleed">` holding two images and one `<figcaption>`. The base rules are the phone layout (a flex column).
  At **640px**, `flex-flow: row wrap`, images `flex: 1 1 0; min-width: 0`, caption `flex: 0 0 100%`. At **1250px**, 64px padding and a 1440px cap.
  Every value is a token, and the two media queries only change tokens.
- **Images:** the two placeholder drafts from the story project's `big_assets/`, copied to `prototype/assets/`, so both use the same media.
- **Twins:** the header now has a **portrait** artboard (800×1200) for phones and the existing **landscape** one (1800×1200) for desktop.
  The portrait art sits *below* the copy, which keeps chunk 4's note to leave the text band clear.
  The twin utilities only hide, and they're the **last rules** in the stylesheet:
  ```css
  @media (max-width: 1023.98px) { .desktop-only { display: none !important; } }
  @media (min-width: 1024px)    { .mobile-only  { display: none !important; } }
  ```

## What broke, and the fix

**The plan's own markup was invalid.** It wrapped the images and caption in `<div class="two-up-grid">` inside the figure. The Nu checker:
*"Element figcaption not allowed as child of element div."* A `<figcaption>` must be a **direct child** of `<figure>`. Fix: drop the wrapper and make
the `<figure>` itself the flex container, resetting its default 40px side margin. The project's `TwoUp.svelte` had the same wrapper, also fixed. I updated the plan.

## Checkpoint results (prototype, headless Chromium)

| Screen | Direction | Figure | Images | Side by side | Caption on own row | Header art showing |
|-------:|-----------|--------|--------|:------------:|:------------------:|--------------------|
| 375 | column | 0 → 375, pad 20 | 335 / 335 | – | ✅ | mobile only |
| 639 | column | pad 20 | 599 / 599 | – | ✅ | mobile only |
| 640 | **row wrap** | pad 20, margin 70 | **294 / 294** | ✅ | ✅ | mobile only |
| 1024 | row wrap | — | 486 / 486 | ✅ | ✅ | **desktop only** |
| 1249 | row wrap | pad 20 | 599 / 599 | ✅ | ✅ | desktop only |
| 1250 | row wrap | **pad 64, margin 100** | 555 / 555 | ✅ | ✅ | desktop only |
| 1600 | row wrap | **80 → 1440 (capped, centered)** | 650 / 650 | ✅ | ✅ | desktop only |
| 1920 | row wrap | **240 → 1440** | 650 / 650 | ✅ | ✅ | desktop only |

- Twin artboards keep their ratios: the mobile art is 450×675 (2:3) at 375, the desktop art 1013×675 (3:2) at 1280.
- No horizontal scroll at any width. Nu HTML Checker: no errors.

## Port

- `src/app.css`: two-up tokens and the twin utilities, as the last rules in the file.
- `TwoUp.svelte`: valid figure markup and the mobile-first rules. ✅
- `Header.svelte`: both artboards, with `.mobile-only` / `.desktop-only`. ✅
- **Built project, measured the same way, with JS on and off:** identical to the prototype (335 / 294 / 570 / 650px images, the 1440 cap centered at 1920,
  exactly one header art at each width). Svelte's scoped `.header-art { display: flex }` doesn't beat the global utility, because the utility uses `!important`.

## Concepts learned

- **Mobile-first reads like the screen growing:** the base rules are the phone, and each `min-width` block adds one change.
- **`flex: 1 1 0` vs `flex: 1`:** basis 0 means the space is split *before* content is considered, so the halves are exactly equal. `min-width: 0` lets a flex item shrink below its image's intrinsic size.
- **Why twins hide but never show:** "show" rules would need to know each component's display value (`block`, `flex`, `grid`). Hide-only utilities stay correct for any component.

## Next

[Chunk 7: the connector diagram](../plan/phase-1/07-connector-diagram.md).
