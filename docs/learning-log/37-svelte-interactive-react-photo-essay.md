# Learning log 37: Svelte for interactives, React for the photo essay

**Date:** 2026-10-05  **Step:** split the templates by stack  **Branch:** `feat/story-photo-essay-react`

## Goal
Match how the NYT divides the work (my doc "Svelte and React at NYT"): the React platform draws every standard
article from CMS blocks, and only interactives are Birdkit (SvelteKit) builds. The photo essay is a standard article,
so it shouldn't be a Svelte build.

## What I did (commands, files)
- Applied `story-photo-essay-react.patch` (entry 36): the React photo essay in `apps/story`, `/photo-essay`.
- Ported the Figma header (entry 32) from Svelte to React: `Opinion` now draws the section ("Opinion", accent) over the
  label, `HeaderBasic` gets the 72px rule and the new spacing, and two new components sit under the lead photo,
  `ArticleTools` (listen and share row) and `Byline`. The promo stays inline in `HeaderBasic`.
- `HeaderBasicBlock` gained `section`, `listenTime`, `commentCount`, `byline` and `promo`. `fromBirdkitDoc` fills
  them, and turns the byline bio into `TextInline` pieces on the server, like paragraphs.
- `projects/photo-essay/` is content only now: `content/doc.json`, `photos/`, `big_assets/` and the renditions script
  (`renditions.js` moved from `src/lib/` to `scripts/`). The SvelteKit build, its components and its tests are gone;
  the React app's Playwright suite covers the page.
- Docs: `CLAUDE.md`, `README.md`, `docs/project-structure.md`, both READMEs.

## Concepts learned
- The doc keeps the Birdkit shape (flat props) even though React draws it. The converter is the seam: the same words
  could go back to a Birdkit build if the essay ever needed custom code.

## What I'd do differently / left as is
- `apps/story/app/article/article.css` still has its own color names (`--ink`, `--line` …). It should import
  `projects/birdkit-kit/tpl.css` (or a copy in `packages/design-system`) so both stacks share the `--color-*` roles.
- The rendition widths are written twice (`scripts/renditions.js` and `apps/story/app/article/media.ts`).
