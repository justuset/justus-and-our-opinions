# Learning log page

Builds the whole learning log as one reading page, in the layout of the **diatour-nyt-frontend** artifact.

```bash
npm run log:page          # from the repo root → tools/learning-log-page/dist/learning-log.html
```

Open the result in a browser, or publish it as the [Our Opinions Learning Log](https://claude.ai/artifact/Tr7wUETfCzxzzhmcgtJVD7)
artifact (ask Claude Code to republish `tools/learning-log-page/dist/learning-log.html` to that URL).

| File | What it is |
|------|-----------|
| `build.mjs` | Reads every `docs/learning-log/NN-*.md` and `docs/guides/github-repo-from-scratch.md`, converts them with [marked](https://marked.js.org), and writes the page. Fails if an in-page link has no target |
| `template.css` | The diatour-nyt-frontend artifact's CSS, **vendored unchanged**, minus its embedded commercial display font (Newsreader stands in) and image marks |
| `extra.css` | What log entries need beyond the template: the "Later changes" note, sub-headings, quotes, numbered lists, the colophon |
| `page.js` | The page's script: running head, current part, a read dot per chapter and a resume link (saved in the reader's browser only) |
| `dist/` | The output (gitignored) |

**How entries become the page:**

- **Card parts.** Each entry becomes a card. Its `**Date:**` line feeds the eyebrow pill, its `## Goal` paragraph becomes the dek, and a leading `> Later changes…` quote becomes the boxed note.
- **Links.** Links between entries become in-page jumps. Links to other repo files open on GitHub, on the branch you're on (`LOG_PAGE_BRANCH=main npm run log:page` to choose another).
- **Parts** are number ranges in `PARTS` at the top of `build.mjs`. A new entry lands in the last part automatically; when a new phase starts, add a part with the entry number it starts at.
