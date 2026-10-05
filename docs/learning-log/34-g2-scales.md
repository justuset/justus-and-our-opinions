# Learning log 34: G2, the size scales and rules

**Date:** 2026-10-05  **Step:** global CSS chunk G2 ([plan](../plan/2026-10-05-global-css.md))  **Branch:** `refactor/birdkit-kit`

## Goal

Move the NYT's size primitives (font sizes, spacing, border widths) and its rule shorthands into the shared
`tpl.css`, in rem, so templates name a step instead of typing a number.

## What I did

- **`projects/birdkit-kit/tpl.css`**: a second `@layer tpl.tokens` block with
  - `--size-font-12 … -40` (eight steps), `--size-spacing-0-5 … -5` (an 8px base: the suffix counts 8px steps, so
    `1-5` is 12px), and `--size-border-1`, `-1-5`, `-2`;
  - `--rule-horizontal-primary` (2px, stroke-primary) and `--rule-horizontal-tertiary` (1px hairline). A rule is a
    whole `border` shorthand, so a divider is one token. Its color is still an unresolved `light-dark()`, so the rule
    follows the theme of whatever element draws it.
- Names are the NYT token paths without the `tpl-` prefix (`size.font.14` → `--size-font-14`), the same paths as
  `docs/reference/tokens/Dark.json`. Only the steps a template uses are defined. The NYT ships more (`-10` to `-72`, spacing to 80px, negative steps), and a step gets added when a component needs it.
- **photo-essay**: its px `--space-*` tokens are gone. Components use `--size-spacing-*`, and `--space-block` and
  `--gap-photo` alias `--size-spacing-5`. Sizes on the scale (`--text-size`, `--card-size`, `--meta-size`, `--bio-size`, `--tool-size`, the mobile headline) alias their `--size-font-*` step. Bio, byline and article-tools dividers use `--rule-horizontal-tertiary`.
- **interactive**: `--text-size`, `--meta-size` and `--node-border` (the diagram's 1.5px strokes) alias the scale.
- Off-scale measurements stay literal in each `app.css`: the 57px and 58px headlines, 15px captions, 13px credits,
  12.5px paragraph gaps, the 100px header top. That matches the NYT file, which writes `.8125rem` inline when a value
  isn't on its scale.

## Checked

- Every element's box (x, y, width, height), font size, line height, margins, padding, border and stroke width, before
  and after, at 390, 800 and 1440 in both templates: **zero differences** (272 and 174 elements).
- `npm run build` (verified 23 and 33 media URLs), unit tests, and e2e (24 + 42) pass.

## Why rem for borders and spacing

At the default 16px root nothing changes. A reader who sets a larger default font size now gets proportionally larger
spacing too, so the layout keeps its proportions instead of only the text growing. Browsers never round a non-zero
border below one device pixel, so `0.0625rem` hairlines stay visible.

## Left for later

- The shell's borders (`ShareTools`, `AdSlot`, `SiteFooter`, `Recirc`) still say `1px` and `2px`. G5 moves them onto
  `--size-border-*` and `--rule-horizontal-*` along with the other shell tokens.
- `prototype/` is untouched (Phase 1 record).
