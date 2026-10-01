# The Second Draft: a Birdkit-style story project

A SvelteKit project whose **build output has the same shape as a Birdkit-style New York Times interactive**: one prerendered
`index.html`, a hashed `_app.<build-hash>/` code folder, and a separately hashed `_big_assets.<content-hash>/` media folder.

> Demo content. The essay, author, artwork and animations are invented placeholders for a front-end study project. No Times
> branding, assets or fonts are used.

**Full guide:** [`docs/project-structure.md`](../../docs/project-structure.md) explains every folder and file, the build
pipeline, caching and deploying, and the fixes made to the [build spec](../../docs/reference/birdkit-build-spec.md).

## Commands

```bash
npm install          # once
npm run dev          # http://localhost:5173, media served raw from big_assets/
npm run build        # hash media → vite build (prerender) → copy media → verify media URLs
npm run preview      # serve dist/ as a reader would get it
npm run deploy       # print the upload plan with cache headers (dry run)
```

## Where things live

| You want to… | Edit |
|--------------|------|
| Change words | `content/story.json` |
| Swap an image or animation | `big_assets/` (paths in `story.json` are relative to this folder) |
| Change a token (color, spacing, type, easing) | `src/app.css` |
| Change how a block looks or behaves | `src/lib/components/<Block>.svelte` |
| Add a block type | A new component + one line in `BLOCKS` in `src/routes/+page.svelte` |
| Change the build output shape | `svelte.config.js` (every setting is commented) |

## Build output

```
dist/
├─ index.html                       the whole story, readable with JavaScript off
├─ favicon.png
├─ _app.<build-hash>/               new name every build → cache forever
│  ├─ version.json
│  └─ immutable/{entry, nodes, chunks, assets}
└─ _big_assets.<content-hash>/      new name only when media changes → cache forever
   ├─ images/
   └─ videos/
```

## Status

The page, header (with intro motion), byline, text and credits are ported from the hand-built prototype
(`prototype/index.html`, Phase 1 chunks 1–5). The two-up, diagram and scroll sections currently render their readable
no-JavaScript version. Each component's top comment says which Phase 1 chunk finishes it.
