# Learning log 06: Phase 1, chunk 2: Tokens and the text column

**Date:** 2026-10-01  **Chunk:** Phase 1 · 2  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **`clamp()` and `min()` replace media queries.** The column width comes from one expression,
`--col: min(100% − 2 × gutter, 600px)`, with no breakpoint deciding it.

## What I did

- Added a `<style>` block whose first section is **all tokens** in `:root`:
  - **Layout (measured):** `--gutter: clamp(10px, 12.5vw, 49px)`, `--w-body: 600px`, `--col`, paragraph, byline and credits spacing.
  - **Motion (measured):** the three easing curves, unused until chunk 5.
  - **Color (diatour):** `--paper`, `--ink`, `--soft`, `--faint`, `--line`, `--surface`.
  - **Type (diatour):** display serif (Newsreader), system sans body, and a serif body option.
  - **Reading text:** `--text-size` / `--text-leading` at 20/30, with one media query that changes the *tokens* (not the rules) to 18/27 below 740px.
- Loaded Newsreader from Google Fonts with `display=swap`.
- `.g-text { width: var(--col); margin: 0 auto var(--gap-para); }`, with `text-wrap: pretty` inside `@supports`.
- The byline and credits share the column in the sans face, in `--soft` and `--faint`.
- Moved the byline and credits margins into tokens once I noticed raw numbers in the rules. The checkpoint rule is "every value lives in `:root`."

## Checkpoint results (headless Chromium, every width)

| Screen | Gutter | Column | Type | Matches breakdown §3 |
|-------:|-------:|-------:|------|:--------------------:|
| 320 | 40px | **240px** | 18/27 | ✅ |
| 375 | 46.9px | **281.3px** | 18/27 | ✅ |
| 392 | 49px | 294px | 18/27 | ✅ (gutter cap) |
| 698 | 49px | **600px** | 18/27 | ✅ (column cap) |
| 740 | — | 600px | **20/30** | ✅ (type step) |
| 800 / 1024 / 1600 | centered | **600px** | 20/30 | ✅ |

- No horizontal scroll at any width.
- **Contrast on `--paper`:** `--ink` 16.0:1, `--soft` 7.3:1, `--faint` 5.6:1, all above AA's 4.5:1.
- **Line length on desktop:** about **57** characters per line with the sans, **64** with the serif. The target is 60–75.
- Nu HTML Checker: still no errors.

## The body-face decision

| | Sans (diatour) | Serif (reference) |
|---|---|---|
| Characters per line at 600px / 20px | ~57 (under target here, likely ~60 on macOS with SF Pro) | ~64 (on target) |
| Matches | The diatour system, which `CLAUDE.md` says wins visual conflicts | The reference and the Times's own body text |
| Feel on dark paper | Clean and modern, a "study guide" voice | Bookish, a "long read" voice |

**Kept: sans (diatour), for now.** It's one line to flip: `--font-text: var(--font-serif-body);`. Worth checking on a real Mac with
Newsreader loaded before chunk 3. If the sans line length still lands under 60 there, that's an argument for the serif.

Note: Google Fonts is blocked in this build environment, so my serif screenshots show the Georgia/Times fallback, not Newsreader.

## Concepts learned

- **Where `12.5vw` meets 49px:** 49 ÷ 0.125 = 392px. **Where the column reaches 600px:** 600 + 2 × 49 = 698px. Both confirmed in the measurements.
- **`min()` picks the smaller value at that moment**, so one declaration behaves like a phone rule below 698px and a desktop rule above it.
- **Media queries that change tokens, not rules:** the 740px step only redefines `--text-size` and `--text-leading`, and every rule that uses them follows.
- **`margin-inline: auto` centers a block with a set width.** The leftover space is split evenly.

## Not in scope yet

The header (kicker, headline, dek) still runs edge to edge in default styling. That's chunk 4. The empty sections have no height yet.

## Next

[Chunk 3: Full-bleed breakout](../plan/phase-1/03-full-bleed-breakout.md).
