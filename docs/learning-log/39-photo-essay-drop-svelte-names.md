# Learning log 39: The photo essay drops its Svelte names

**Date:** 2026-10-05  **Step:** clean up after the move to React  **Branch:** `refactor/photo-essay-drop-svelte`

## Goal
React has drawn the photo essay since entry 37, but its doc still called every block `"type": "svelte"`, the converter
was `fromBirdkitDoc`, and some comments described a Svelte template that no longer exists. Name things for what they
are now. The Svelte names stay only in `projects/interactive/`.

## What I did (commands, files)
- `projects/photo-essay/content/doc.json`: `"type": "svelte"` → `"type": "block"` (7 blocks). Props are unchanged.
- `apps/story/app/article/fromBirdkitDoc.ts` → `fromDoc.ts` (`git mv`); `BirdkitDoc` → `StoryDoc`, `fromBirdkitDoc()`
  → `fromDoc()`, and `docProblems()` now expects `block`. Updated `routes/photo-essay.tsx` and `types.ts` to match.
- Comments: `media.ts` pointed to `projects/photo-essay/src/lib/media.js`, which is gone (it now points to
  `scripts/renditions.js`); `article.css` and `routes/photo-essay.tsx` no longer mention the Svelte template.
- Docs: `apps/story/README.md` (the mapping table now starts from doc blocks, not Svelte components),
  `projects/photo-essay/README.md` and `CLAUDE.md`.
- Learning-log entries 28–38 are left as written: they record what was true then.

## What I learned
- The converter was always the seam. Changing the doc's block type took one line in `docProblems()`, and no component
  noticed.

## What I'd do differently
- Rename at the moment of the move (entry 37). "Keep the Birdkit shape so it could go back" was a door nobody planned
  to use, and the leftover names confused the next reader.

## Next
- Nothing pending for this cleanup.
