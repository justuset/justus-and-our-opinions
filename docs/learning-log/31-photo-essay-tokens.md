# Learning log 31: Photo essay colors and type from token files

**Date:** 2026-10-05  **Step:** tokens for the photo essay template  **Branch:** `refactor/birdkit-kit`

## Goal

Swap the photo essay's hand-picked colors and type values for the ones in three W3C-format token files: `Dark.json`,
`Light.json` and `opinion-photo-essay-type-tokens.json`. All three now live in `docs/reference/tokens/`. The font
families stay diatour's (Newsreader and system sans).

## What I did

- `projects/photo-essay/src/app.css`: each color and type token now names the token path it came from.
  - `.g-theme-diatour` (and `:root`) use `Dark.json`, and `.g-theme-opinion` uses `Light.json`.
  - Two new roles: `--ink-dim` for body text (`color.content.primary-dim`) and `--link` for inline links
    (`color.content.accent-dim`).
  - Every font size is in rem (px ÷ 16), including the measured 57px headline (`3.5625rem`), the 15px caption and the
    13px credit. Text now scales with the reader's browser font size instead of staying fixed. Line-heights are
    unitless ratios, such as `1.0526` for 57/60, so they scale with it. The kicker's tracking is now `0.07em`.
- Shared shell (`projects/birdkit-kit/shell/`): the masthead, share tools, ad slot and footer type moved from px to rem,
  with unitless line-heights. At the default 16px root nothing moves. The e2e tests pass for both templates.
- Two photo-essay e2e tests changed. The shell's `--faint` is now `rgb(131, 131, 131)`, and the headline's line-height
  is rounded before the check, because a ratio computes to 59.998px instead of exactly 60.
- The kicker's line-height went from 1.2 to the token's 1.5. Credits got the 13/17 line-height (`--credit-leading`).
- Contrast checks: `--faint` scores 4.9:1 on dark paper and 4.8:1 on white, so both pass AA.

## Left as is

- **Weights:** these stay diatour's (550 headline, 600 kicker). The tokens use Cheltenham bold, but diatour wins visual conflicts.
- **Wide photos:** the tokens set large photos to 1200px at 1440px and wider. That change also needs new `sizes` attributes and
  renditions, so it gets its own step.
- **`projects/interactive` colors:** it keeps its own theme values. These tokens were measured from a photo essay.

## Interactive template type in rem too

This breaks the Phase 1 "measured px" rule, on purpose: the type should scale with the reader's font size. The values
are the same at the default 16px root, so the build, the unit tests and the 24 e2e tests all pass unchanged.

- `src/app.css`: text 20/30 → `1.25rem` / `1.5`, phone 18/27 → `1.125rem` (same `1.5`), kicker `0.8125rem`, meta
  `0.875rem`, caption `0.9375rem` with a 15/30 → `2` leading at ≥740, and headline `3.625rem` (`2.75rem` under 360).
- The fluid sizes keep their `vw` middle term, but the `clamp()` bounds are now in rem: `clamp(4.5rem, 7.2vw, 6rem)`
  for the headline and `clamp(1rem, 1.4vw, 1.25rem)` for the dek. When the reader zooms, the rem bounds scale with it.
- The px font sizes in the components moved to rem: ScrubStage, SlidesScrolly, Diagram, PaintingsScrolly and CaptionScrolly.
