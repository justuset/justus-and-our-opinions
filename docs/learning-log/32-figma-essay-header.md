# Learning log 32: The essay header from Figma

**Date:** 2026-10-05  **Step:** photo essay header, Figma `header.essay-header` (node 1:5)  **Branch:** `refactor/birdkit-kit`

## Goal
Match the updated header frame (Frame 1) in style and spacing, and build the new block under the lead photo (Frame 2):
listen and share tools, byline with bio, and a promo box. Use the repo's tokens, not Figma's raw values.

## What I did (commands, files)
- Read the frames with the Figma MCP (`get_metadata`, `get_design_context`, `get_variable_defs`). Figma's variables
  (`color/content/accent`, `size/spacing/*`, `article/space/block`) map onto token paths already in `docs/reference/tokens/`.
- `src/app.css`: new `--accent` (Dark `#ddf160`, Light `#346eb7`), `--space-*` from `size.spacing.*`, `--byline-size`,
  `--tool-size`. Kicker is now 14/24 with 0.08em tracking, `--header-top` is 100px.
- `Header.svelte`: two-line kicker (section label in accent), a 72px rule as `.headline::before`, date in `--ink-dim`,
  52px (12 + block 40) to the photo, then the tools row, byline and promo in the text column, 32px below.
- New `ArticleTools.svelte` (inert buttons, own inline SVG icons) and `Byline.svelte`. They're children of `Header`,
  not registered blocks, so the doc stays one `Header` block with flat props.
- Measured against Figma at 1440: kicker, headline, date and byline land within 1–3px. `npm run test:e2e`: 42 passed.

## What broke and how I fixed it
- The byline box collapsed to 82px with a one-line bio. Figma's has an 80px min-height inside, so the box gets a 102px
  rule-to-rule minimum.

## Concepts learned
- A decorative rule belongs in a pseudo-element, not the markup: it has no meaning for screen readers.

## What I'd do differently / left as is
- The Figma promo says "Add The New York Times on Google". No Times branding here, so it reads "Add Our Opinions on Google".
- Headline weight stays diatour's 550 (Figma says SemiBold). Figma's Helvetica becomes the system sans.
- The demo byline is "Photographer Name", not the real name in the frame (demo content is invented).

## Next
- On the shipped page the tools row is the platform's. If a second template needs it, move `ArticleTools` into `birdkit-kit/shell/`.
