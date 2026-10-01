# Learning log 10: The Birdkit-style story project

**Date:** 2026-10-01  **Chunk:** between Phase 1 chunks 5 and 6  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

Restructure the repo to replicate the folder structure in the **Birdkit-Style Story Project build spec**
(`docs/reference/birdkit-build-spec.pdf`): a SvelteKit source project whose build emits the same output tree as a live NYT
interactive. Then document every part for a web designer/developer.

## What I did

- **New project:** `projects/the-second-draft/` with every file and folder from the spec's source tree: `content/story.json`,
  `big_assets/` (images, Lottie files, diagram frames, scripts), `scripts/hash-assets.js` and `deploy.js`, `static/favicon.png`, and `src/`
  (`app.html`, `app.css`, five route files, `lib/assets.js`, `scroll.js`, `lottie.js`, and eleven components).
- **Versions** pinned to the spec's ranges: SvelteKit 2.70, Svelte 5.57, Vite 6.4, adapter-static 3, vite-plugin-svelte 5, lottie-web 5.13.
  SvelteKit 3 is out, but the spec's config was written for 2.
- **Content:** `story.json` was generated from the prototype's markup (same copy), in the spec's block types (`text`, `two-up`,
  `diagram`, `scrolly` with `scene`, `lottie`).
- **Media:** placeholder images drawn on a canvas in headless Chromium (`.webp`, `.jpg`, the favicon), each labelled
  "PLACEHOLDER," and three tiny hand-written Lottie files. Google Fonts and PIL weren't available here, but npm and Chromium were.
- **Ported** prototype chunks 1–5 for real (Header with its intro, Byline, Text, Credits, all tokens). The other components render the
  readable no-JS version of their block, with a top comment naming the chunk that finishes each one.
- **Docs:** `docs/project-structure.md` (the full guide), the project's `README.md`, the spec saved as PDF plus a Markdown transcription,
  a "Port" step added to the Phase 1 workflow and to chunks 6–10, chunk 11 rewritten as "finish the port and verify parity," and
  updates to the README, `CLAUDE.md`, architecture and the Phase 2 plan.

## What broke, and the fixes (5)

| # | Symptom | Cause | Fix |
|---|---------|-------|-----|
| 1 | The client build wrote `_app.eJHU…` and the server build `_app.dcTc…` | `svelte.config.js` is loaded several times per build, and the spec's `Date.now()` hash differed on each load | Compute once into `process.env.BUILD_HASH` and reuse it (child processes inherit it) |
| 2 | Media copied into `dist/` before the build would vanish | adapter-static empties `dist/` when it writes | `hash-assets.js` runs twice: hash + `assets.js` before, `--copy` after |
| 3 | The build failed with `404 /_big_assets…/two-up-draft-1.webp` | The prerender crawler follows `<img src>`, and the media folder doesn't exist yet at crawl time | `handleHttpError` skips `_big_assets` URLs only, and `--copy` then verifies every media URL in `index.html` exists |
| 4 | An absolute `<cdn>/…` `ASSET_BASE` breaks preview and host moves. A committed production value breaks `npm run dev` | — | The generated `assets.js` holds both, `dev ? '/big_assets' : './_big_assets.<hash>'` |
| 5 | The deploy plan marked `favicon.png` as immutable | The policy said "everything but `index.html`," but `static/` files are unhashed too | Only `_app.*` and `_big_assets.*` are immutable. Other unhashed files get a short cache and upload before `index.html` |

## Verification

- `npm run build`: one `_app.<hash>` across client, server and `dist/`, and "verified 16 media URLs."
- **Output tree** matches the spec: `entry/{start,app}`, `nodes/{0,1,2}`, **9 chunks** (the spec said "about 9"), CSS per node (`0.css`, `1.css`, `2.css`; the spec listed only `2.css`), and `_big_assets.<hash>/{images,videos}`.
- **Two builds in a row:** a new `_app` name each time, and the same `_big_assets.d09a166288` (media unchanged).
- **Served from `/projects/the-second-draft/`** (like a CDN path): every file loads through relative URLs, all 16 images load, the page hydrates and the header intro runs.
- **JavaScript off:** the HTML holds the headline, all 10 paragraphs, 16 images, the 4-item diagram list and all 11 scroll frames.
- **Dev server:** media served raw from `/big_assets/`, with no build needed.
- `npm run preview` → 200, and `npm run deploy` → 41 files, hashed folders immutable, `index.html` last.

## Concepts learned

- **Build output is a contract.** The shape of `dist/` (what's hashed, what isn't) decides how it can be cached and deployed. The spec is about that shape, not about the source.
- **Measure the output, don't trust the config.** Three of the five problems only showed up by building and looking at `dist/`.
- **Prototype first, then port.** The prototype teaches one idea at a time with nothing hidden. The project shows where each idea lives in a real build.

## Next

[Phase 1, chunk 6: two-up images and twins](../plan/phase-1/06-two-up-and-twins.md). Build it in the prototype, pass the checkpoint, then port it into `TwoUp.svelte`.
