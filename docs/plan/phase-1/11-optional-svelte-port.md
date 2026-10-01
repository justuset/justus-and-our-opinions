# Chunk 11: Finish the port and verify parity

**One new idea:** **components rendered from a content file, built to a deployable output tree.** The Birdkit-style story
project at `projects/the-second-draft/` already exists, built from the [build spec](../../reference/birdkit-build-spec.md),
and each chunk has been ported into it as its checkpoint passed. This chunk closes the loop: confirm the Svelte project and the
hand-built prototype are the same page, and that the build output is ready to ship.

**Reference:** [`docs/project-structure.md`](../../project-structure.md) (every file, the pipeline, source → output, caching),
your finished `prototype/index.html`, and chunk 1's content-model comment (now real in `content/story.json`).
**Skills:** `svelte-runes`, `svelte-template-directives`, `svelte-styling`, `sveltekit-structure`, `svelte-deployment`.

## Build
- [ ] Every component in `src/lib/components/` is marked ✅ in its top comment and in `project-structure.md` §4. Any ⏳ left means
      a chunk's "Port" step was skipped. Do it now.
- [ ] `Header.svelte`: the hero Lottie (`big_assets/videos/hero/hero.json`) plays once via `$lib/lottie.js` `playOnce()`, with the SVG kept as the
      no-JS poster. Skip it under reduced motion.
- [ ] Remove anything the prototype needed but the project doesn't (inline test helpers, `console.log`s from chunk 8).
- [ ] Add a **fifth scroll section by editing `story.json` only**: no component changes.
- [ ] Write a parity script (Playwright) that loads `prototype/index.html` and `npm run preview` side by side at 375, 1024 and 1440, and compares:
      column width, header height, headline size, two-up direction, diagram width, runway heights, and step offsets in one runway.

## Learn
- The prototype separated *data* (the arrays A, B, C) from *templates* (HTML) by convention. The project makes it structural:
  `story.json` → `+page.svelte`'s `BLOCKS` map → one component per block type.
- `$state` for `step` and `progress`, `$derived` for anything computed from them, `{@attach}` for every DOM side effect.
- Why the build output has two hashed folders, and why `index.html` is uploaded last (`project-structure.md` §9).

## Checkpoint
- [ ] The parity script matches within ±1px at all three widths (font differences excepted), or every difference is explained in the log.
- [ ] `npm run build` ends with "verified N media URLs", and `find dist -type f` matches the tree in `project-structure.md` §8.
- [ ] `npm run preview` with **JavaScript disabled** reads top to bottom: every step of every scroll section is visible.
- [ ] `npm run deploy` lists hashed folders as immutable and `index.html` last.
- [ ] Lighthouse on the preview: Accessibility 100, CLS < 0.05.

When this passes, Phase 1 is complete. 🎉 Write the Phase 1 retro in `docs/learning-log/`, then go to [Phase 2](../phase-2/README.md).
