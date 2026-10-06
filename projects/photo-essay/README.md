# Photo essay: content for a photo-led guest essay

A standard Opinion article, not an interactive. At the NYT, standard articles are CMS blocks drawn by the platform's
React components; only interactives are Birdkit (SvelteKit) builds. So this folder holds the **content** and the
**photos**, and the page is drawn by React in [`apps/story`](../../apps/story/) at `/photo-essay`
(`app/article/fromDoc.ts` turns `doc.json` into the platform's `__typename` blocks on the server).
The Svelte template that used to live here is in git history (before `feat/story-photo-essay-react`).

> Demo content. Placeholder copy; the photos are rodeo photographs whose credits are TK. Alt text is a draft for a person
> to approve. No Times branding, assets or fonts.

## Commands

```bash
npm install          # once (sharp)
npm run photos       # make WebP renditions of photos/ into big_assets/images/ (see Photos below)
npm test             # rendition widths
```

Run, check and test the page from the repo root:

```bash
npm run dev -w @opinion/story        # copies the photos, then http://localhost:5173/photo-essay
npm run test:e2e -w @opinion/story   # Playwright at 390 / 800 / 1440, JS on and off
```

## Blocks in `content/doc.json`

The doc is an ordered `body` of `text` paragraphs and `block`s (a `component` name plus flat props). Each maps to one
React block:

| Doc block | Props (flat, numbered for lists) | React |
|---|---|---|
| `text` | one paragraph, inline `<a>`, `<em>`, `<strong>` | `ParagraphBlock` |
| `Header` | `section kicker headline date dateText url alt width height caption credit`, then `listenTime comments author bio promoText promoCta promoHref` for the tools row, byline and promo (each drops out when missing), plus `seoTitle dek` for `<head>` | `HeaderBasic` › `Opinion`, `MediaFigure`, `ArticleTools`, `Byline` |
| `Photo` | `url alt width height caption credit size` (`large` or `medium`) | `MediaFigure` |
| `Diptych` | `url1 alt1 width1 height1 url2 … credit` | `Diptych` |
| `PhotoScrolly` | `url1 alt1 width1 height1 card1 url2 … credit` | `Scrolly` |
| `Bio` | `text note` | italic `ParagraphBlock`s |

## Photos

Like a newsroom CMS that makes renditions when a photo is uploaded, `npm run photos` is a **prep step**.

1. Put the full-size original in `photos/` (JPEG, PNG, WebP, TIFF or SVG), named in lowercase with hyphens: `photos/calf.jpg`.
2. Run `npm run photos`. `scripts/make-renditions.js` (sharp) writes `big_assets/images/calf-600w.webp`, `-1200w`,
   `-2000w` at quality 75, never upscaling (a 1335px original tops out at `-1335w`). It prints the original's size.
   Unchanged originals are skipped.
3. In `content/doc.json`, name the photo **without an extension** and paste that size: `"url": "images/calf",
   "width": 2000, "height": 1250`.
4. Commit `photos/` and `big_assets/images/`. `apps/story` copies the renditions into its `public/images` on dev and build.

The widths live in `scripts/renditions.js` and in `apps/story/app/article/media.ts`: change both together.
Removing a photo: delete its original and its renditions by hand (the script never deletes).
