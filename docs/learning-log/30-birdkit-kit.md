# Learning log 30: Shared code in `projects/birdkit-kit/`

**Date:** 2026-10-02  **Step:** cleanup after a ponytail audit  **Branch:** `refactor/birdkit-kit`

## Goal

A repo-wide audit for things to cut found two big ones:

1. The photo essay template (log 28) was built by **copying** the interactive template's platform code. Eighteen files
   were byte-identical in both: the shell, the renderer, the hash script, the SvelteKit config, the allow-list.
2. `scripts/migrations/2026-10-02-story-to-doc.js` was a one-time script that could no longer run (`story.json` was
   deleted in the same commit, log 20).

## What I did

- Moved the shared files to `projects/birdkit-kit/`, imported as `$kit/…`: `shell/` (6 files), `Blocks.svelte`,
  `Text.svelte`, `inline-html.js` + test, `doc.js`, `hash-assets.js`, and the SvelteKit settings as `config.js`
  (`kit(adapter)`). Each template's `svelte.config.js` is now three lines.
- `Blocks.svelte` takes the template's `registry` as a prop instead of importing `./blocks.js`, which was the one thing
  tying it to a single template.
- `hash-assets.js` works on `process.cwd()` instead of its own location, so one copy serves every template.
- Deleted the migration script. Git history keeps it; the docs say where it went.

## What could have broken, and how it was checked

- **Two Svelte runtimes.** The kit has no `node_modules`, so a bare `svelte` import from its components would be resolved
  from the kit's folder, and could find a different copy higher up. `resolve.dedupe: ['svelte']` in each template's
  `vite.config.js` makes Vite use the template's own. Checked: the interactive page hydrates (5 scroll sections enhanced, no
  console errors) and the photo essay passes 42/42 e2e.
- **The adapter import.** `config.js` can't `import '@sveltejs/adapter-static'` for the same reason, so the template passes
  it in.
- **Dev server file access.** Vite refuses to serve files outside the project unless `server.fs.allow` lists them. Added
  `'../birdkit-kit'`; checked with `npm run dev`.

## Why not `packages/`

`packages/` is the Phase 2 npm workspace: the root lints, type-checks and builds everything in it. The templates are
standalone projects with their own lockfiles (project-structure §2), and `projects/` is already excluded from the root
lint and format rules. So the kit sits next to the templates, as plain source.

## Results

About 600 duplicated lines gone, plus the 129-line migration script. Both templates build (interactive: 23 media URLs,
photo essay: 33) and both run the kit's unit test.

## What I'd do differently

Share from the start. Copying felt cheaper when the photo essay was one template, but the copies were identical on day
one, so there was never a reason for two.

## Next

- CI only builds `projects/interactive/`. A matrix over both templates would cover the kit's other user.
- The tests that check the shell (`footer.spec.js`, `responsive.spec.js`, `helpers.js`) are still copied per template.
  They import `@playwright/test`, which would need the same "no node_modules here" treatment to share.
