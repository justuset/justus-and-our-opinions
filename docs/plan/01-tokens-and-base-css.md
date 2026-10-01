# Chunk 01: Design system package (diatour)

**Goal:** Turn the diatour design system into one CSS package both apps import: rem-based and fluid tokens, cascade
layers, light and dark themes, the signature diatour components, and a styleguide route.

**Reference:** `docs/design-system.md` (diatour, the visual source of truth) and `docs/layout-system.md` §1–2 (rem units,
deriving `clamp()`, the rag). Guide §3 (no pure `vw` type, WCAG zoom) and §5 (Figma → rem tokens).
diatour-nyt §I.VII (tokens a designer can read) and §VIII.III.
**Skills:** `svelte-styling` (how Svelte components consume tokens through `var()` and `style:--x`).

## Learn first
- [web.dev Learn CSS: custom properties](https://web.dev/learn/css/custom-properties), [`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [Utopia type calculator](https://utopia.fyi/type/calculator)
- [WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

## Tasks
- [ ] `packages/design-system/tokens.css` in `@layer tokens`. Every color, space, radius and motion token from `design-system.md`, in **rem** with the Figma px in a comment (`--space-4: 1.5rem; /* 24px */`).
- [ ] The fluid type scale from `layout-system.md` §2 (`--step-headline` … `--step-meta`). Verify each one by computing it at 320, 800 and 1440px in the log.
- [ ] Themes: diatour **dark** is the house default. Light is derived. Use `:root[data-theme="dark"]`, `:root[data-theme="light"]` and `prefers-color-scheme` when no theme is set.
- [ ] `base.css` in `@layer reset, base`: reset, `html { overflow-x: clip }`, body on `--paper`, `text-wrap: pretty` on `p`, `balance` on headings, a visible `:focus-visible` ring.
- [ ] `components.css` in `@layer components`, reproducing the diatour signatures: part divider (3px double rule + italic numeral), eyebrow pill, kicker, byline, refs row, table, step list, refresh disclosure, TOC drawer.
- [ ] Fonts: **Newsreader** (variable) as `--font-display` at weight 550 standing in for Exposure VAR. System sans for body, as in diatour.
- [ ] `apps/story/app/routes/styleguide.tsx`: swatches with measured contrast ratios, type specimens at three widths, every component in both themes, and a theme toggle (inline `<head>` script to avoid a flash, `localStorage` in try/catch).
- [ ] Stylelint with `stylelint-use-logical`, so physical properties are flagged.
- [ ] *Stretch:* a `tokens/*.json` (W3C format) → **Style Dictionary** → `tokens.css` pipeline with a px→rem transform (`layout-system.md` §6).

## Done when
- The styleguide in dark mode is visually indistinguishable from the diatour artifacts (apart from the display font), and light mode reads cleanly.
- At 200% browser zoom and at a 24px default font size, all type scales up. Nothing is stuck at pure `vw`.
- `--soft` and `--faint` pass AA on `--paper` in both themes (adjust and note any change in `design-system.md`).
- No hex colors or px font sizes outside `tokens.css`.

## Concepts to write about
- Deriving one `clamp()` by hand (slope and intercept)
- Why media queries use `em`
- Figma `space/4` ⇄ `--space-4`: one name on both sides
