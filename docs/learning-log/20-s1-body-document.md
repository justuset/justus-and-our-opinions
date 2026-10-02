# Learning log 20: NYT sandbox S1: the `body` document

**Date:** 2026-10-02  **Chunk:** NYT sandbox alignment · S1  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **content as one ordered `body` of blocks**, in the shape of the shipped NYT page's payload:

```jsonc
{ "type": "text",   "value": "One paragraph, with optional <em>inline</em> HTML." }
{ "type": "svelte", "value": { "component": "TwoUp", "url1": "…", "alt1": "…", "groupCaption": "…" } }
```

The doc decides what's on the page and in what order; the developer owns the components. This chunk changes the
*plumbing only*: the page must look and behave exactly as before.

## Decisions (plan §2)

The owner took every recommendation:
- **Themes:** diatour stays the default, with a light "opinion" theme added in S3.
- **Where:** reshape this project, rather than start a new one.
- **GSAP:** adopt it, pinned to 3.12.5, in S4.
- **Names:** "Our Opinions" and the invented byline.
- **`DataScrolly`** (the one open question) gets built fresh in S6.

## What I did

1. **Moved the words with a script, not by hand.** `scripts/migrations/2026-10-02-story-to-doc.js` converted `content/story.json` into `content/doc.json`, then checked that **every string** in the old file appears unchanged in the new one before writing.
   - On its first run it refused: ten strings were "missing." All were structural, not words: the old `type`, `scene` and `mode` values, now replaced by component names.
   - I exempted exactly those three keys, by name, so a lost *word* would still fail.
   - Result: 19 body blocks, all 105 strings carried over. `story.json` was deleted in the same commit; the script stays as a record.
2. **Flat props, numbered lists.**
   - The real payload passes settings as flat key/value pairs, so lists became numbered keys: `heading1, card1, heading2, …`. `series(props, ['heading', 'card'])` in `$lib/doc.js` turns them back into an array.
   - I chose numbered keys over the blueprint's comma-separated strings for anything with words in it, because a caption can contain a comma. Comma strings are kept for `srcset`, which is already a comma list in HTML.
3. **The renderer and the registry.**
   - `src/lib/blocks.js` maps component names to components. `src/lib/Blocks.svelte` walks `body` in order.
   - `+page.svelte` is now three lines of markup. Header, byline and credits are ordinary blocks, no longer special keys.
4. **Unknown blocks can't ship.** Before, a block with an unknown type was silently dropped.
   - **Dev:** shows a dashed "Missing component: X" placeholder.
   - **Production:** `+page.js` runs `docProblems()` and throws, which stops the prerender and the build, naming the block's position.
5. **Inline HTML, safely.** Text blocks may now carry `<em>`, `<strong>` and `<a href>`, as on the real page. Rather than trusting the string with `{@html}`, `$lib/inline-html.js` **rebuilds** it from an allow-list:
   - only those tags, and only `http(s)://`, `/path` or `#anchor` links;
   - everything else is escaped, and mis-nested tags turn the whole string back into plain text.

   It has four tests run by Node's built-in runner (`npm test`, no new dependency), and CI runs them.

## Checkpoint

| Check | Result |
|---|---|
| The page renders identically | The built `index.html`, with hashed names, Svelte's hydration comments, scripts and inter-tag whitespace removed, is **identical** to the snapshot taken before the change (16,808 characters each) |
| `npm run parity` | Within 1px at 375, 1024 and 1440 |
| Media | "verified 23 media URLs" |
| A misspelled component name | `npm run build` fails: `content/doc.json can't be rendered: body[8]: missing component "Diagramm"`. `npm run dev` shows `Missing component: Diagramm` |
| Inline HTML in a real page | A test paragraph rendered `an <em>allowed</em> tag, a <a href="#notes">link</a> and &lt;script&gt;alert(1)&lt;/script&gt;` |
| Unit tests | 4 / 4 pass |

(The failure tests ran against a backed-up copy of `doc.json`, restored and byte-checked afterwards.)

## Concepts learned

- **"The doc owns the words, components own the behavior."** Editors can reorder, add or remove sections by editing one file. The registry is the only place a developer connects a name to code.
- **Fail loudly at build time, gently in dev.** A typo should never become a silently missing section on a published page, but it shouldn't stop you mid-edit either.
- **Prove a refactor with the output, not the code.** Diffing the prerendered HTML is a stronger check than reading the diff of the source. The raw diff was full of noise (new chunk names, shifted `<!--[-->` hydration markers), so I compared what a browser builds instead.
- **An allow-list beats a block-list for HTML.** You can't list every dangerous thing, but you can list the three safe ones.

## Next

[S2: the platform shell](../plan/nyt-sandbox-alignment.md#s2-the-platform-shell).
