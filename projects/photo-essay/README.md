# Photo essay: a Birdkit-style template for photo-led guest essays

The second template in `projects/`, next to [`interactive/`](../interactive/). Same build pipeline, same mock platform
shell, same `doc.json` contract; different blocks. The layout is measured from a shipped NYT Opinion photo essay
(Sept. 2026 piece, measured Oct. 2026, in the `opinion-photo-essay` reference folder). Colors and fonts are diatour.

> Demo content. Placeholder copy and placeholder photos (SVG gradients). No Times branding, assets or fonts.

## Commands

```bash
npm install          # once
npm run dev          # http://localhost:5173, media served raw from big_assets/
npm run build        # hash media → vite build (prerender) → copy media → verify media URLs
npm run preview      # serve dist/ as a reader would get it
npm test             # unit tests (inline-html allow-list)
npm run test:e2e     # Playwright at 390 / 800 / 1440: measured layout, PhotoScrolly, JS off, shell
```

## Blocks

| Component | Props (flat, numbered for lists) | Measured |
|---|---|---|
| `text` block | one paragraph, inline `<a>`, `<em>`, `<strong>` | 20/30 in 600px, 18/25 in 350px on phones |
| `Header` | `kicker headline date dateText url alt width height caption credit`, plus `seoTitle dek` for `<head>` | 57/60 headline (40/44 phones), 945px lead photo |
| `Photo` | `url alt width height caption credit size` (`large` or `medium`) | 945px or 600px |
| `Diptych` | `url1 alt1 width1 height1 url2 … credit` | 2 × 465px, 15px gap; stacked under 740px |
| `PhotoScrolly` | `url1 alt1 width1 height1 card1 url2 … credit` | sticky 100svh stage, 0.35s crossfade, cards 100svh apart (first −33svh, last +66svh), 28/32 type (24/30 phones) |
| `Bio` | `text note` | 16/22 sans in the text column |

**PhotoScrolly** uses CSS `position: sticky` and one IntersectionObserver with `rootMargin: -50% 0 -50% 0`: a card
crossing the middle of the screen makes its photo active. No scroll library, like the reference. With JavaScript off,
the photos sit in a column and the cards follow as text; `{@attach}` adds `data-enhanced`, and only then does the
sticky overlay apply. Reduced motion drops the fade (global rule in `app.css`).

## Where things live

| You want to… | Edit |
|---|---|
| Change words | `content/doc.json` |
| Swap a photo | `big_assets/images/` (paths in `doc.json` are relative to `big_assets/`) |
| Change a token | `src/app.css` |
| Change a block | `src/lib/components/<Block>.svelte` |
| Add a block | a new component + one line in `registry` in `src/lib/blocks.js` |

Copied unchanged from `interactive/`: `scripts/hash-assets.js`, `svelte.config.js`, `src/lib/shell/`,
`src/lib/Blocks.svelte`, `src/lib/inline-html.js`, `src/lib/doc.js`, `src/lib/components/Text.svelte`, the routes and
`tests/helpers.js`, `footer.spec.js`, `responsive.spec.js`. A fix in one template's copy should go to the other's.

## Left out of the reference

- **In-body ad slots**: the reference's are collapsed (0px) unless filled. The shell's ad slot below the story covers it.
- **RelatedLinks**: the shell's `Recirc` already sits below the story.
- **Captions on scroller photos**: the reference has one credit per sequence, so this does too.
