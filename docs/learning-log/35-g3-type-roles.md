# Learning log 35: G3, typography roles

**Date:** 2026-10-05  **Step:** global CSS chunk G3 ([plan](../plan/2026-10-05-global-css.md))  **Branch:** `refactor/birdkit-kit`

## Goal

Components pick a type **role**, not a size: `font: var(--type-body)` instead of
`font: var(--text-size) / var(--text-leading) var(--font-text)`.

## How the NYT does it

Every role is one `font` shorthand in a custom property, for example `--tpl-typography-body-16: 400 1rem/1.39 nyt-imperial, …`.
The `font` shorthand resets letter-spacing and case without being able to set them, so each role has two companions,
`-ls` and `-tt`, that a component applies on the next two lines. The NYT ships about 80 roles, each with both
companions, declared on `:root, :where(:root *)`. Re-declaring on every element means a role re-resolves wherever one
of its parts (like a size toggle) changes.

## What I did

- **`tpl.css`**, a third `@layer tpl.tokens` block:
  - the three font faces, moved out of both `app.css` files: `--font-display` (Newsreader, standing in for
    Cheltenham), `--font-body` (system sans, for Franklin) and `--font-text` (the body-text face, for Imperial). The interactive template's unused `--font-serif-body` is gone;
  - the shared roles: `--type-body` (NYT body-regular 20/1.5, and body-compact 18/1.3889 below 740px),
    `--type-text-14` (400 14/1.4) and `--type-title-14` (600 14/1.4). The kit's `Text.svelte` and `Blocks.svelte` use them.
- **interactive `app.css`**: `--type-kicker`, `--type-headline` (+ `-ls: -0.02em`), `--type-dek`, `--type-caption`,
  `--type-title-15`. Headline, dek and caption change at breakpoints, so these roles compose the primitives the media
  queries already redefine (`--headline-size`, `--dek-size`, `--caption-leading`). That works because `var()` is
  substituted on the element that declares the role, `:root`, where the media query has already changed the primitive.
  The phone body text keeps its Phase 1 measurement (18/27) by redefining `--type-body` there.
- **photo-essay `app.css`**: `--type-headline`, `--type-kicker` (+ `-ls`, `-tt: uppercase`), `--type-card`,
  `--type-caption`, `--type-credit`, `--type-bio`, `--type-byline`, `--type-tool`, `--type-tool-strong`. Nothing here
  changes at a breakpoint except headline and card, so the phone media query simply redefines those two roles, and
  the separate size and leading tokens are gone.
- Only roles that need `-ls`/`-tt` have them (the interactive headline and the photo-essay kicker).
- Where a Figma measurement differs from a role by line-height only, the component says so on the next line:
  `font: var(--type-text-14); line-height: 1.5;` (promo, byline bio). The header date keeps `line-height: normal`.

## Checked

- Computed box, font size, line-height, margins, padding, borders, font family, weight, style, letter-spacing and
  text-transform of every element at 390 / 800 / 1440, both templates: **zero differences**. The first run caught one
  real difference: the header date had inherited a `normal` line-height and the credit role gave it 17px, moving
  everything below it 1px. That's why the date now says `line-height: normal`.
- With a 24px root font size (a reader's larger default), every role scales by 1.5×. The interactive desktop headline goes from 96 to 108px, not 144: its `clamp(4.5rem, 7.2vw, 6rem)` takes the vw middle value, but both bounds are rem, so it still grows.
- `npm run build` (verified 23 and 33 media URLs), unit tests, and e2e (24 + 42) pass.

## The 480px question (still open)

The NYT platform switches body type at 480px; our templates switch at 740px. The S4b measurements show 18px at 390
and 20px at 800, which can't tell the two apart. I couldn't measure at 600px: the NYT domain is blocked for Claude's web
tools. Body text is now one role, so the answer is a one-line change in `tpl.css`.

## Left local

Single-use graphic type stays in its component: the scrub fallback (16/1.5), the paintings step list (15/1.4), the
slides heading (`clamp()` with vw) and the caption scrolly text (20/1.3 → 24/1.25). A role earns its place when two
components share it. The error pages now use `--type-headline`, so their headline leading follows the role
(1 → 1.0526 in photo-essay, and .92 from 740px in interactive). Error pages aren't in the diff.
