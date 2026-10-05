# Photo essay: a Birdkit-style template for photo-led guest essays

The second template in `projects/`, next to [`interactive/`](../interactive/). Same build pipeline, same mock platform
shell, same `doc.json` contract; different blocks. The layout is measured from a shipped NYT Opinion photo essay
(Sept. 2026 piece, measured Oct. 2026, in the `opinion-photo-essay` reference folder). Colors and fonts are diatour.

> Demo content. Placeholder copy; the photos are rodeo photographs whose credits are TK. Alt text is a draft for a person
> to approve. No Times branding, assets or fonts.

## Commands

```bash
npm install          # once
npm run photos       # make WebP renditions of photos/ into big_assets/images/ (see Photos below)
npm run dev          # http://localhost:5173, media served raw from big_assets/
npm run build        # hash media → vite build (prerender) → copy media → verify media URLs
npm run preview      # serve dist/ as a reader would get it
npm test             # unit tests (renditions, plus the kit's inline-html allow-list)
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
| Add or swap a photo | drop the original in `photos/`, run `npm run photos`, name it in `doc.json` (see Photos) |
| Change a token | `src/app.css` |
| Change a block | `src/lib/components/<Block>.svelte` |
| Add a block | a new component + one line in `registry` in `src/lib/blocks.js` |

Shared with `interactive/` through [`../birdkit-kit/`](../birdkit-kit/) (imported as `$kit/…`): the platform shell,
`Blocks`, `Text`, `inline-html.js`, `doc.js`, `hash-assets.js` and the SvelteKit config. Change those there, then build
and test both templates. Still copied per template: the routes and `tests/helpers.js`, `footer.spec.js`, `responsive.spec.js`.

## Photos

Like a newsroom CMS that makes renditions when a photo is uploaded, `npm run photos` is a **prep step**, not part of the
build. The build and `big_assets/` rule stay as they are: `big_assets/` holds exactly what ships.

1. Put the full-size original in `photos/` (JPEG, PNG, WebP or TIFF), named in lowercase with hyphens: `photos/calf.jpg`.
2. Run `npm run photos`. `scripts/make-renditions.js` (sharp) writes `big_assets/images/calf-600w.webp`, `-1200w`,
   `-2000w` at quality 75, never upscaling (a 1335px original tops out at `-1335w`). It prints the original's size:
   `photos: images/calf  "width": 2000, "height": 1250`. Unchanged originals are skipped.
3. In `content/doc.json`, name the photo **without an extension** and paste that size: `"url": "images/calf",
   "width": 2000, "height": 1250`. The component builds `srcset` with `photo()` from `$lib/media.js`, and each slot sets its
   own `sizes`, so a phone loads the 600w file and a desktop the 1200w one.
4. `npm run build` (ends with "verified N media URLs", 3 per photo), then commit `photos/`, `big_assets/images/` and
   the regenerated `src/lib/assets.js`.

Slots the story hasn't filled keep a placeholder: the template's SVGs live in `photos/` too (`large-2.svg`,
`scrolly-2-1.svg`…) and go through the same step, since sharp reads SVG. To fill a slot, add your photo and point the
slot's `url` at it; don't delete slots to match the number of photos you have.

Removing a photo: delete its original and its renditions by hand (the script never deletes).
The widths live in one place, `src/lib/renditions.js`, which both the script and the components import.

## Left out of the reference

- **In-body ad slots**: the reference's are collapsed (0px) unless filled. The shell's ad slot below the story covers it.
- **RelatedLinks**: the shell's `Recirc` already sits below the story.
- **Captions on scroller photos**: the reference has one credit per sequence, so this does too.
