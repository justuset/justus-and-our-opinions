# Learning log 08: Phase 1, chunk 4: The header

**Date:** 2026-10-01  **Chunk:** Phase 1 · 4  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **size type by characters** (`6ch` stacks one word per line) and **scale art by height**
(`height: 100%; width: auto`), so it crops at the sides and never squashes.

## What I did

- **Markup:** the header became `<header class="header bleed">` with two layers: `.header-copy` (kicker, `h1`, dek) on top
  and `.header-art` behind, holding a placeholder SVG on an 1800×1200 landscape artboard (three manuscript pages and two coffee rings).
- **Box:** a fixed `675px` height with a 90px top margin, `overflow: hidden`, and an **explicit** `position: relative`. The reference only had it
  because `.bleed` happened to add it (breakdown §19 #11).
- **Copy layer:** absolute at `top: 12%`, a centered flex column, `pointer-events: none`. On desktop it's vertically centered.
- **Art layer:** `inset: 0`, centered, and `svg { height: 100%; width: auto; flex: none }`.
- **Tokens, same pattern as chunk 2:** every header value is a `:root` token, and the two breakpoints only redefine tokens:
  - `< 360px`: `--header-h: 67vh`, 44px headline, `.85rem` dek, copy at 13%.
  - `≥ 1024px`: headline `clamp(72px, 7.2vw, 96px)` at `12ch` and line-height `.92`, dek `clamp(16px, 1.4vw, 20px)` at `32ch`.
- Byline gets a 100px bottom margin at ≥1024px in landscape.

## Two decisions

1. **Shorter headline.** "The Second Draft Is Where the Argument Lives" is eight words. Stacked one per line at 58px it would run past the
   675px header and be cropped. The reference's headline was three words. Now it's **"The Second Draft,"** and the dek carries the rest: "…That is where the argument lives."
   I updated the `<title>` and the content-model comment to match.
2. **Mixed case, not uppercase.** The plan copied the reference's uppercase headline, but that relies on a *condensed* face, where six capitals ≈ `6ch`.
   Newsreader isn't condensed, so uppercase words overflow a `6ch` box and the line hangs off-center. Diatour's display style
   (Newsreader 550, mixed case, −0.02em tracking) is the rule anyway ("diatour wins visual conflicts"), and in it the widest word fits.

## Checkpoint results (headless Chromium, real Newsreader loaded from npm because Google Fonts is blocked here)

| Screen | Header | Headline | Lines | Widest word vs `ch` box | Copy | Art |
|-------:|-------:|---------:|:-----:|-------------------------|------|-----|
| 320×640 | 429px (67vh) | 44px | 3 | "Second" 136px in 156px ✅ | top 13% | 643×429, ratio 1.500, −162px each side |
| 340×740 | 496px (67vh) | 44px | 3 | 136 in 156 ✅ | top 13% | ratio 1.500, cropped |
| 375×812 | 675px | 58px | 3 | 179 in 210 ✅ | top 12% | 1013×675, ratio 1.500, −319px each side |
| 800×1000 | 675px | 58px | 3 | 179 in 210 ✅ | top 12% | ratio 1.500, −106px each side |
| 1024×768 | 675px | **73.7px** | 2 | — | centered (0px off) | 1013×675, ratio 1.500 |
| 1280×900 | 675px | **92.2px** | 2 | — | centered | ratio 1.500 |
| 1440×900 | 675px | **96px** | 2 | — | centered | ratio 1.500 |

- Copy never overflows the header. There's no horizontal scroll at any width.
- **The art's ratio is exactly 1.500 at every width**: it crops, it never squashes (the circles stay round).
- Nu HTML Checker: no errors.
- **Plan correction:** the plan's 340px checkpoint said "675px tall," but 340 < 360, so 67vh is correct. Fixed the plan text.

## Concepts learned

- **`ch` is font-relative.** It's the width of the "0" glyph. In Newsreader at 58px that's about 35px (≈ 0.6em), so `6ch` = 210px. A `6ch` measure only
  means "one word per line" if the font's word widths cooperate. **Size by characters, then measure in the actual font.**
- **`flex: none` on the SVG** stops the flex container from shrinking it to the screen width. Without it, the art would squash on phones, defeating height-driven scaling.
- **Media queries that change tokens:** the header's rules are written once, and only the token values change at 359px and 1024px.
- **Fixed height, not `100vh`:** on a tall phone (812px) the 675px header leaves the byline and first lines of text visible, which invites the scroll.

## Notes for designers

- Keep the band behind the dek clear in real art. The placeholder's manuscript lines sit behind it at about **4.9:1** contrast, just over AA.
- On phones, roughly the middle 35–60% of the artboard's width is visible (at 375px, 375 of 1013px). Put anything essential there.
- Desktop art doesn't yet fill wide screens (1013px of art on a 1440px screen). Chunk 6 adds the desktop/mobile twins.

## Next

[Chunk 5: Intro motion](../plan/phase-1/05-intro-motion.md).
