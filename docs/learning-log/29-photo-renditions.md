# Learning log 29: `npm run photos`, WebP renditions

**Date:** 2026-10-02  **Step:** photo essay tooling  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

Put six real photos into the photo essay and stop hand-converting images: one command that turns full-size originals
into responsive WebP files.

## How NYT does it (and what we copy)

NYT photo URLs look like `…/05guest-essay-superJumbo.jpg?quality=75&auto=webp`. Two things happen in two places:

- **Sizes at upload.** The CMS makes a fixed set of renditions (`superJumbo`, `jumbo`, `articleLarge`…) when an editor
  uploads a photo. Pages list them in `srcset`.
- **Format per request.** The image CDN (Fastly) reads `auto=webp` and the browser's `Accept` header and re-encodes on
  the fly.

A static site has no image CDN, so both jobs move to one **prep step** that runs before media enters the project. It's
deliberately not part of `npm run build`: NYT's project builds never touch photos either, and keeping it out leaves
`big_assets/` as "exactly what ships" and keeps a native dependency (sharp) out of the build.

## What I did

- `photos/`: full-size originals, never shipped.
- `scripts/make-renditions.js` (`npm run photos`): sharp → `big_assets/images/<name>-<w>w.webp` at quality 75, EXIF
  orientation applied, skips up-to-date files, prints each original's width and height for `doc.json`.
- `src/lib/renditions.js`: the one rule both sides share. Widths 600 / 1200 / 2000, never upscaled, so a 1335px
  original's top file is `-1335w`, not a fake `-2000w`. Unit-tested (`renditions.test.js`).
- `src/lib/media.js`: `photo(name, width)` → `{ src, srcset }`. Header, Photo, Diptych and PhotoScrolly use it, each with
  its own `sizes`.
- `content/doc.json`: the six photos fill the lead, the diptych, the first two scroller steps and the first large photo.
  Every other template slot keeps its placeholder (the template's SVGs, now originals in `photos/` that go through the
  same step): a slot is never deleted to fit the number of photos. Alt text drafted for review; credits TK.
- Tests: the scroller test counts its cards instead of assuming three; a new test checks the phone loads `-600w` and
  wider screens `-1200w` (`currentSrc`).

## Results

| Original JPEG | 1200w WebP | 600w WebP |
|---|---|---|
| lead 428 KB | 169 KB | 64 KB |
| calf 424 KB | 91 KB | 26 KB |

`npm run build` verifies 33 media URLs (11 photos × 3); 42/42 e2e pass.

## Concepts learned

- `srcset` + `sizes` is the browser half of the deal: the page describes the slot's width, the browser picks the file.
  Without `sizes`, it assumes `100vw` and over-downloads in narrow slots.
- One shared module for naming means the script and the components can't drift apart.

## Next

- The interactive template could use the same step; that's the third copied piece, so move it to `packages/` then.
- Real credits, and a person's pass on the alt text.
