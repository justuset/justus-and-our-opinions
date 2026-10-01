# Chunk 01: Design tokens and base CSS

**Goal:** Turn `docs/design-system.md` into real CSS: tokens, cascade layers, light and dark themes, fluid type,
and a `/styleguide` page that shows them all.

**Reference:** diatour-nyt §I.VII ("tokens a designer can read"), §VIII.III (layers, grid, container queries,
fluid type), and the diatour CSS itself (see `docs/design-system.md`).

## Learn first
- [web.dev Learn CSS: Custom properties](https://web.dev/learn/css/custom-properties) and [Cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [Utopia fluid type](https://utopia.fyi/), [`clamp()`](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [`text-wrap: balance | pretty`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)

## Tasks
- [ ] `src/styles/tokens.css`: every token from the design-system tables, in `@layer tokens`.
- [ ] Light values on `:root`. Dark values under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` **and** `:root[data-theme="dark"]`.
- [ ] `src/styles/base.css` in `@layer reset, base`: modern reset, `body` background, font smoothing, `text-wrap: pretty` on `p`, `balance` on headings, `:focus-visible` ring.
- [ ] Load **Newsreader** (variable, opsz + wght) from Google Fonts with `font-display: swap`. Point `--font-display` at it.
- [ ] Use `font-variation-settings` / `font-weight: 550` to match the source's semi-bold display weight.
- [ ] `src/styles/components.css` in `@layer components`: eyebrow pill, kicker, part divider, refs row, table, step list, disclosure.
- [ ] `src/pages/styleguide.astro`: color swatches with contrast ratios, type scale specimens, every component in both themes, and a theme toggle (`data-theme` on `<html>`, saved in `localStorage` inside try/catch).
- [ ] Contrast check: `--soft` and `--faint` on `--paper` in both themes. Adjust if under AA and note the change in the design-system doc.

## Done when
- `/styleguide` looks like the diatour artifacts in dark mode and reads cleanly in light mode.
- No hard-coded colors or font sizes outside `tokens.css` (`grep -rE "#[0-9a-f]{3,6}" src/ --include=*.css` finds only tokens).
- Toggling the theme doesn't flash the wrong theme on reload (set `data-theme` with an inline script in `<head>`).

## Concepts to write about
- Why `@layer` ends specificity fights
- Figma variable `space/3` == `--space-3`: one name, one number, no translation
- How `clamp(min, preferred, max)` replaces three media queries
