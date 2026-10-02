# Learning log 26: `projects/the-second-draft` → `projects/interactive`

**Date:** 2026-10-02  **Step:** rename (no behavior change)  **Branch:** `claude/wonderful-knuth-w43l2c`

## Why

The folder was named after the one story it held. NYT names this kind of article by its **type**: the shipped piece
lives at `nytimes.com/interactive/<date>/opinion/<slug>.html` (from its URL). So the folder is now `projects/interactive/`:
the **template** for interactive articles. The story inside it is still identified by the `slug` in `content/doc.json`.

| Thing | Before | After |
|---|---|---|
| Repo folder | `projects/the-second-draft/` | `projects/interactive/` |
| npm package name | `the-second-draft` | `interactive` |
| Story slug (`doc.json`), root id | `the-second-draft`, `#g-bk-the-second-draft` | **unchanged** |
| Deploy path (dry run) | `projects/the-second-draft/…` | `interactive/the-second-draft/…` (article type + slug, like the real URL) |
| CI job | `working-directory: projects/the-second-draft` | `projects/interactive` |

What isn't public is how NYT names Birdkit project folders internally. The URL segment is the verified part.

## How

- `git mv projects/the-second-draft projects/interactive`. Git records it as a rename, so `git log --follow` still shows each file's history. The untracked `node_modules/` and `dist/` moved with it.
- **Every path string** `projects/the-second-draft` was replaced across code, CI and docs, including older learning logs, so their links keep working.
- The slug was deliberately left alone. It names the piece, not the template, and changing it would change the page's root id and the parity baseline.

## Checks

- `npm run build`: "verified 23 media URLs".
- `npm test` 7 pass; `npm run parity` within 1px; `npm run test:e2e` 21 pass.
- `npm ci` accepts the renamed lockfile.
- Root lint and `npm run log:page` pass.

## On your machine

After `git pull`, the old folder may still exist locally with only untracked files in it (`node_modules/`, `dist/`). Delete
`projects/the-second-draft/` if it's there, then run `npm install` in `projects/interactive/`.
