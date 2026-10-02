# Learning log 09: Phase 1, chunk 5: Intro motion

**Date:** 2026-10-01  **Chunk:** Phase 1 · 5  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **wait for fonts, then animate.** If the headline animates in a fallback font and the web font swaps in
mid-animation, the text reflows and jumps.

## What I did

- **In `<head>`, before anything paints:** a tiny script adds `js` to `<html>` and sets a **2.5s failsafe** that adds `is-ready` no matter what.
- **CSS:** the hidden start state applies only under `.js`: headline `opacity: 0` and 15px down, dek `opacity: 0` and 10px down.
  `.is-ready` brings both to `opacity: 1; transform: none`. Transitions: 0.8s `--ease-intro`, with the dek delayed 0.2s.
  The durations, stagger and distances are tokens.
- **Page script (end of `<body>`):** `document.fonts.ready.then(() => html.classList.add('is-ready'))`, falling back to an immediate reveal
  in browsers without the Font Loading API.
- **Reduced motion:** the text is visible immediately, with no transition and no waiting for fonts. See "Changed from the plan."

## How I tested "no jump"

A font that loads instantly from cache can't show the bug, so the test made it slow on purpose:

- served the page over HTTP and intercepted the Google Fonts requests,
- answered with the real Newsreader files (from npm), **delayed by 1.5s**,
- sampled the headline's opacity, offset and box size every 40ms.

"Jump" means the headline's box changes size while it's visible.

## Checkpoint results

| Scenario | Font loaded | `is-ready` | Headline first visible | Size change while visible? |
|----------|------------:|-----------:|-----------------------:|:--------------------------:|
| Slow font (1.5s) | 1589ms | 1589ms | 1633ms | **No** ✅ |
| Fast font (50ms) | 125ms | 125ms | 168ms | **No** ✅ |
| Reduced motion, slow font | 1555ms | 1555ms | **41ms (immediately)** ✅ | Yes, a plain swap with no animation, as intended |
| JavaScript disabled | 1574ms | never | **43ms (immediately)** ✅ | Yes, a plain swap, as intended |
| Main script throws | — | **2536ms (failsafe)** ✅ | 2536ms | — |

- **Stagger:** the headline reached half opacity at 1763ms and the dek at 1940ms, **≈ 0.18s apart**. That's the 0.2s delay, give or take the 40ms sampling.
- Both elements end at `opacity: 1`, `translateY(0)`.
- Nu HTML Checker: no errors.

## Changed from the plan

The plan's reduced-motion rule only removed the transition. That leaves the headline at `opacity: 0` until fonts load, so a reader who
asked for less motion would stare at a blank header for 1.5s on a slow connection. Under reduced motion there's no animation to protect, so the
text now shows immediately and the font swaps in like any other text. I updated the plan text to match.

## Concepts learned

- **`document.fonts.ready`** resolves when the fonts the page is using have finished loading (or failed). Measured here: `is-ready` landed in the same
  sample as the font, and the first visible frame came after it.
- **Three ways the page can run, three guards:**
  - JS off → `.js` is never set, so the start state never applies.
  - JS on and working → `fonts.ready` reveals the text.
  - JS on but broken → the 2.5s failsafe reveals it.
  The reference handled only the first, via `@media (scripting: none)`.
- **Easing:** `cubic-bezier(0.25, 1, 0.5, 1)` covers most of the distance early, then settles. Compared with `ease-in`, which starts slowly,
  it feels responsive. Try both in DevTools → Animations at 10%.
- **Stagger sets reading order:** the headline lands first, then the dek, so the eye follows the hierarchy.

## Next

[Chunk 6: Two-up images and desktop/mobile twins](../plan/phase-1/06-two-up-and-twins.md).
