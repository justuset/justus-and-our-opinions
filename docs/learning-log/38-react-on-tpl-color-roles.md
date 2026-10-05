# Learning log 38: The React app on the tpl.css color roles

**Date:** 2026-10-05  **Step:** one set of color roles for both stacks  **Branch:** `feat/story-photo-essay-react`

## Goal
The React photo essay had its own palette (`--paper`, `--ink`, `--line` …) and a light theme block that redefined it.
The Svelte interactive uses the `--color-*` roles in `projects/birdkit-kit/tpl.css` (G1). Put both on the same roles.

## What I did (commands, files)
- `apps/story/app/article/article.css` imports `tpl.css` and drops its palette, its font faces and the
  `.g-theme-opinion` block. `tpl.css`'s theme classes only set `color-scheme`, and the roles follow.
- Every component module: `--paper` → `--color-background-primary`, `--ink` → `--color-content-primary`,
  `--ink-dim` → `--color-content-primary-dim`, `--soft` → `--color-content-secondary`, `--faint` →
  `--color-content-secondary-dim`, `--link` → `--color-content-accent-dim`, `--accent` → `--color-content-accent`,
  `--line` → `--color-stroke-tertiary`, `--surface` → `--color-background-secondary`. Hairlines use
  `--rule-horizontal-tertiary`. The `--shell-*` tokens alias the roles, as in `birdkit-kit/shell/shell.css`.
- New e2e test: switching `#story` to `g-theme-opinion` turns it white and leaves the shell dark.

## What broke and how I fixed it
- After the switch, the light theme did nothing: every role stayed dark. Vite 8 minifies CSS with Lightning CSS, and
  for its default (older) browser target it rewrites `light-dark(a, b)` as `var(--lightningcss-light, a)
  var(--lightningcss-dark, b)` with the switch variables set on `:root`. A custom property's `var()`s are substituted
  where the property is declared, so every role resolved once, at `:root`, as dark. `#story`'s `color-scheme: light`
  had nothing left to change. Fix: `build.cssTarget` in `vite.config.ts` names the first browsers with
  `light-dark()` (Chrome/Edge 123, Firefox 120, Safari 17.5), so it ships untouched. The new test fails without it.

## Concepts learned
- `light-dark()` inside a custom property stays live until it's used, which is the whole trick behind G1. A polyfill
  built from variables can't keep that, because variables resolve where they're declared.

## Left as is
- `app/app.css` (the home route) still uses `@opinion/design-system`'s `--paper` / `--ink`. That package also sets
  `--font-body` unlayered, so it beats `tpl.css`'s layered one: the same system stack, minus Roboto.
