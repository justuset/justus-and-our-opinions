# Learning log 27: The page shell in diatour dark

**Date:** 2026-10-02  **Step:** S4b follow-up  **Branch:** `claude/wonderful-knuth-w43l2c`

## Why

S4b built the shell (masthead, share tools, recirculation, ad slot, footer) from measurements of the shipped page,
including its look: a white page, a blue comment button, Franklin and Cheltenham substitutes. The owner asked for the
shell to use the design system's dark theme instead. That also matches CLAUDE.md: **diatour wins visual conflicts**.

The split is now:

- **Layout from the measurements:** heights, widths, paddings and type sizes (47 / 42px masthead, 350 / 600 × 36 button, 1200px page, 11px footer…).
- **Look from diatour dark:** colors and fonts.

## What changed

`src/lib/shell/shell.css` keeps the `--shell-*` names, but most are now **aliases** of diatour tokens:

| Shell token | Was (measured) | Now (diatour dark) |
|---|---|---|
| `--shell-bg` | `#ffffff` | `var(--paper)` `#121211` |
| `--shell-bg-secondary` | `#f7f7f7` | `#1b1b1a` (`--surface-2`) |
| `--shell-ink` | `#121212` | `var(--ink)` `#ededeb` |
| `--shell-muted` | `#666666` | `var(--faint)` |
| `--shell-rule`, `--shell-border` | `#ebebeb`, `#e2e2e2` | `var(--line)` |
| Comment button | `#567b95` fill, `#326891` border | `var(--ink)` fill, `var(--paper)` text, `var(--soft)` on hover |
| Pills | white | `var(--surface)` |
| Wordmark | Libre Caslon Text 700 | Newsreader (`--font-display`) 550 |
| Labels | Libre Franklin | the system sans (`--font-body`) |

- **Why aliases work.** The aliases are defined on `:root`, where diatour's values are the dark ones. A story theme block (`.g-theme-opinion`) redefines `--paper` and friends only inside `<article>`. The shell sits outside it, so it always gets dark.
- **The wordmark still adapts** to the header it floats over: `--ink` over a dark story header, `--paper` over the light "opinion" one.
- **Libre Franklin and Libre Caslon Text are no longer loaded**, so the page makes one font request fewer.

## Checks

- **Contrast (WCAG AA):** every shell text pair passes.
  - On `--paper`: ink 15.99, soft 7.29, faint 5.55.
  - On `#1b1b1a`: ink 14.7, faint 5.38.
  - The button (paper text on ink): 15.99.
- **`npm run test:e2e`: 24 passed.** The comment-button color test now expects `--ink`, and a new test asserts that the shell is dark: page `--paper`, text `--ink`, ad slot `#1b1b1a`, footer links `--faint`. Every layout assertion is unchanged and still passes.
- `npm run build`, `npm test` and `npm run parity` (within 1px) pass.
