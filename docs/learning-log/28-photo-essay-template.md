# Learning log 28: A photo essay template

**Date:** 2026-10-02  **Step:** new template  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

Add a second template to `projects/`, for photo-led Opinion guest essays, using the `opinion-photo-essay` reference
(a SvelteKit rebuild measured from a shipped NYT photo essay) as the source of layout values and blocks.

## What I did

- `projects/photo-essay/`, built on the interactive template's pipeline instead of the reference's: content in
  `content/doc.json` (`text` + `svelte` blocks with flat props), media in `big_assets/` through `asset()`, the hashed
  `_app.<hash>/` and `_big_assets.<hash>/` output, the registry in `src/lib/blocks.js` that fails the build on unknown
  components, and the same platform shell.
- Ported the reference's blocks: `Header` (from `EssayHeader`), `Photo` (from `ImageBlock`), `Diptych`, `PhotoScrolly`,
  `Bio`. Its multi-paragraph `text` blocks became one `text` block per paragraph, the shape of the NYT payload.
- Kept the reference's measured px values as tokens in `src/app.css`; colors and fonts are diatour, both themes.
- Ported the reference's Playwright checks to the repo's helpers, and added a JavaScript-off check.

## What broke and how I fixed it

- **PhotoScrolly with JavaScript off.** The reference makes the stage sticky in plain CSS and hides every photo but the
  first, so without JS the reader never sees photos 2 and 3. Here the base CSS is a column of photos followed by the
  cards as text, and the sticky overlay only applies under `[data-enhanced]`, which the `{@attach}` sets.
- **Playwright browser mismatch.** The copied lockfile's Playwright wanted a browser build that wasn't installed.
  Pinned `@playwright/test` and `playwright` to `~1.62.0`, the version whose Chromium is in the local cache.

## Concepts learned

- A second template is mostly a new `components/` folder and a new `app.css`. Everything about how a story is built and
  shipped stayed the same, which is the point of the Birdkit split.
- A no-JS state isn't "the enhanced layout minus the motion". Sometimes it needs its own layout.

## Next

- The copied files (shell, renderer, hash script) now exist twice. If a third template arrives, move them to a shared
  package instead of copying again.
