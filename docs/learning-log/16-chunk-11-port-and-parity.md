# Learning log 16: Phase 1, chunk 11: Finishing the port and proving parity

**Date:** 2026-10-01  **Chunk:** Phase 1 · 11  **Branch:** `claude/wonderful-knuth-w43l2c`

> **Later changes (as of 2026-10-02):** `story.json` is now `content/doc.json` (S1, [log 20](20-s1-body-document.md)); the "add a fifth section" JSON in its new form is in [`project-structure.md`](../project-structure.md) §12. Since S2, `npm run parity` switches the platform shell off before measuring ([log 21](21-s2-platform-shell.md)).

## Goal

One new idea: **components rendered from a content file, built to a deployable output tree, proven equal to the hand-built page.** Every chunk was ported as it passed, so this chunk closes the loop: finish what was left (the header animation), show that a new section needs only content, and *measure* that the two builds are the same page.

## 1. Every component is ✅

Going in, the only ⏳ left was the header's Lottie. The project never had the prototype's debug code (`console.log`s, the chunk 8 test panel), so there was nothing to remove. The prototype keeps its `window.updateCount` counter on purpose: chunk 8's checkpoint uses it.

## 2. The hero Lottie: an animation that ends on its poster

`scripts/make-hero-lottie.js` writes two files, `hero-desktop.json` (1800×1200) and `hero-mobile.json` (800×1200). It builds them from the **same coordinates as the SVG artboards** in `Header.svelte`:

- the pages drop 60px and un-rotate into place, staggered;
- the text lines draw left to right;
- the rings grow in last.

It's 2 seconds, played once.

Because the last frame *is* the SVG, the SVG becomes the **poster**:
- what readers see with no JS;
- what readers who prefer reduced motion see (they never download the animation);
- what everyone sees when the animation ends.

I checked that claim by rendering both: frame 59 vs the SVG differs by **11 of 540,000 pixels** on desktop and **1** on mobile, all anti-aliasing.

In `Header.svelte`, each twin gets `{@attach hero('desktop' | 'mobile')}`:

1. **Reduced motion?** Stop. The poster is the art.
2. **An `IntersectionObserver` waits for the twin to be visible.** A `display: none` twin never intersects, so only one file downloads. The same trick as scene D.
3. **`playOnce()` resolves only after Lottie has drawn its first frame** (`DOMLoaded`). `lottie.js` gained a shared `ready()` that also rejects on `data_failed`.
4. **Only then does `playing[twin] = true` hide the poster** (`.playing > svg { visibility: hidden }`). If the file fails, the poster simply stays.

**Lining up the two layers.** The poster is scaled by height (`height: 100%; width: auto`, centered). The animation's box matches it: absolutely positioned, `height: 100%`, `aspect-ratio: 1800 / 1200`, centered with `left: 50%; translateX(-50%)`. Measured: the two boxes differ by **0px** in x, width and height.

**One subtlety:** `.playing > svg` can only ever hide the poster. Svelte scopes the selector to elements this component *wrote*, and the SVG Lottie injects at runtime isn't one of them. Chunk 8's pruning surprise, working in our favor this time.

Measured on the build:

| Width | Requested | After 0.4s |
|---|---|---|
| 1440 | only `hero-desktop.json` | playing, poster hidden |
| 375 | only `hero-mobile.json` | playing, poster hidden |
| 1440, reduced motion | nothing | poster visible |

A pixel diff of the whole header at 1440 (animation finished vs poster) showed only edge pixels: 1px outlines on strokes and text anti-aliasing. Nothing moves at the swap.

## 3. A fifth section from `story.json` only

The plan says to add a fifth scroll section by editing only `story.json`. I didn't add it to the real essay. The essay is the argument, and per `CLAUDE.md` AI doesn't write or edit the argument, even demo copy. Instead I proved it in a **scratch copy** of the project:

- inserted a 2-step "paintings" block labelled `TEST FIXTURE`;
- built and served it.

Result: five runways, the new one **2430px** (2 × 135svh at 900px tall) with **2 markers**, and its caption read "Fixture step two." after scrolling into step 2. No component changed. The JSON is documented in `project-structure.md` §12 ("Add another scroll section").

(An aside on tooling: my first attempt piped the file list to `rsync`, which isn't installed in this container. The command chain stopped before editing anything, but a later command ran the build in the real project directory. That was harmless, since a build only regenerates `dist/` and `assets.js`, and I checked `git diff` to confirm the real `story.json` was untouched. The redo used `tar`. Lesson: when a step in a chain can fail, put the `cd` and the risky work in one `set -e` block.)

## 4. The parity script: `npm run parity`

`scripts/parity.js`:
- **Serves both builds itself.** It runs a tiny static server for `prototype/` and `dist/`; both are plain files, so no `vite preview` is needed.
- **Opens each in headless Chromium** at 375, 1024 and 1440px.
- **Measures the same things on both:**
  - column width;
  - header height;
  - headline size;
  - two-up direction and image widths;
  - diagram width;
  - every runway's height;
  - page height;
  - the scroll offsets where runway A's steps begin (found by binary search on the lit markers).
- **Fails (exit code 1) on any difference over 1px.**

Google Fonts and cdnjs are blocked on both pages, so both measure with the same fallback font and the run works offline. `playwright` is now a dev dependency, pinned to the version whose Chromium this environment ships.

**The first run found a real bug.** Page height was **270px** taller in the project at every width. A block-by-block comparison showed it starting at the first runway: the project's enhanced runways kept the no-JS stack's `margin: 40px 0`. The prototype's chunk 10 rules reset it (`.scrolly-ready .runway { margin: 0 }`); the project's `[data-enhanced]` rule only set the height. Four runways × the margins, minus margin collapsing with the neighboring paragraphs' 12.5px, gave the 270px. One line fixed it. (It was also a bug in my own measuring code: the step-offset search first counted *every* runway's markers, not just runway A's.)

**Final run, everything within 1px:**

| Measure | 375 | 1024 | 1440 |
|---|---|---|---|
| Column width | 281.3 | 600 | 600 |
| Header height | 675 | 675 | 675 |
| Headline size (fallback font) | 58 | 73.728 | 96 |
| Two-up | column, 335 / 335 | row, 486 / 486 | row, 650 / 650 |
| Diagram width | 281.3 | 1024 | 1200 |
| Runway heights | 7290 / 6075 / 3645 / 3038 | same | same |
| Page height | 24442 | 23490 | 23755 |
| Runway A step offsets | 1065 / 2130 / 3195 / 4260 / 5325 | 1066 / 2131 / … | 1066 / 2131 / … |

(The 1065 vs 1066 at different widths is the binary search landing on either side of a fractional boundary. The prototype and project always agree at the same width.)

## 5. Build, deploy, no-JS, Lighthouse

- **`npm run build`:** ends with "verified **23** media URLs". The `dist/` tree matches §8: `index.html`, `favicon.png`, `_app.<build>/` (version.json, 2 entries, 3 nodes, 3 CSS files, 10 chunks; one is lottie-web's lazy chunk), and `_big_assets.<hash>/` (images including the `srcset` variants, the hero and scrub twins).
- **`npm run deploy`:** every hashed file is `public, max-age=31536000, immutable`; `favicon.png` and `index.html` are `max-age=60`, and `index.html` is last.
- **JavaScript off and JavaScript broken:** the same readable stack as chunk 10 (0 of 11 frames hidden, all captions visible, headline visible).
- **Lighthouse (mobile, preview):** Performance **95**, Accessibility **100**, Best Practices **96**, CLS **0**. Performance dropped 2 points from chunk 10, the cost of the hero animation. Best Practices' one miss is the sandbox blocking Google Fonts.

## Concepts learned

- **A poster frame makes animation optional:** if the animation's last frame equals the static art, the static art serves no JS, reduced motion and the end state alike. The design rule for handoff: *the poster is the last frame.*
- **Measure, don't eyeball:** two pages that look the same can differ by 270px. A script that compares numbers finds what screenshots hide.
- **Content-driven pages:** the prototype separated data from templates by convention (the `C_LAYOUTS` array beside hand-written HTML). The project makes it structural (`story.json` → `BLOCKS` → component), and the fifth-section test is the proof.

## Next

[Phase 1 retro](17-phase-1-retro.md), then [Phase 2, chunk 00](../plan/phase-2/00-foundation.md).
