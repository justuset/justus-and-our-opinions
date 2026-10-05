# Learning log 33: G1, color roles with light-dark()

**Date:** 2026-10-05  **Step:** global CSS chunk G1 ([plan](../plan/2026-10-05-global-css.md))  **Branch:** `refactor/birdkit-kit`

## Goal

Replace each template's two copies of every color (one on `:root`, one per theme class) with one shared declaration
per color, named like the NYT's semantic roles.

## How the NYT does it: the space toggle

The shipped page writes each color once, as two `var()` fallbacks side by side:

```css
--tpl-color-content-primary: var(--tpl-pvt-light, #121212) var(--tpl-pvt-dark, #f8f8f8);
```

Two switch variables decide which half survives. A switch set to `initial` counts as missing, so its `var()` falls back
to the color. A switch set to nothing (`--tpl-pvt-dark: ;`) is valid but empty, so its half disappears. Light mode is
`--tpl-pvt-light: initial; --tpl-pvt-dark: ;`, and classes like `.tpl-always-dark` flip the pair on any subtree.

## What I did

- **`projects/birdkit-kit/tpl.css`** (new): ten color roles on `:root`, each `light-dark(<Light.json>, <Dark.json>)`.
  `light-dark()` is the native version of the space toggle: it picks a side from the element's `color-scheme`.
  It works through custom properties because a custom property keeps `light-dark()` unresolved until a real property
  uses it, so a `color: var(--color-content-primary)` inside a light `<article>` gets the light value even though the
  variable was declared on a dark `:root`.
- Themes are now one line each: `.g-theme-opinion, .always-light { color-scheme: light }` and the dark pair.
  `.always-*` lets a section inside a story flip, like NYT's `.tpl-always-dark`.
- `tpl.css` sits in `@layer tpl.tokens`. Templates' `app.css` stays unlayered, and unlayered rules beat layered ones,
  so a template can always override the kit.
- Both layouts import `$kit/tpl.css` first. Every `var(--paper|ink|soft|faint|line|surface|ink-dim|link|accent)` in
  both templates and the kit is renamed to its role (map in `docs/design-system.md`). `prototype/` keeps its old names: it's the Phase 1 record.

## Checked

- Computed colors of every element, before and after, both templates, both themes (a script swapping the theme class):
  - **photo-essay:** identical, except the shell's `.skip-ad` link, which had no color of its own. The UA's link blue
    `rgb(0,0,238)` became `rgb(158,158,255)`, because `color-scheme: dark` on `:root` also switches browser defaults.
    That's an improvement (the old blue was about 2.3:1 on the dark page).
  - **interactive:** the planned change from diatour's translucent greys to `Dark.json`'s solid ones (`--faint`
    `rgba(235,235,240,.56)` → `#838383`, `--line` 14% white → `#333332`), and the light page `#fbfbf8` → `#ffffff`.
    Over the dark page the old and new values land within a few levels of each other.
- Contrast (WCAG): content-secondary-dim 4.94:1 dark / 4.81:1 light; content-secondary 6.34 / 6.9; links 6.53 / 5.96;
  the dark accent `#ddf160` 15.02. The shell's muted text on the `#1b1b1a` ad slot is 4.55:1, just over AA.
- `npm run build` (verified 23 and 33 media URLs), unit tests, and e2e (24 + 42) pass. The interactive footer test now
  expects `rgb(131, 131, 131)`, like photo-essay's.

## Left for later

- `--shell-bg-secondary` stays `#1b1b1a` (diatour `--surface-2`). G5 decides whether it becomes `background-secondary`.
- The 480px body-type question gets measured before G3.
