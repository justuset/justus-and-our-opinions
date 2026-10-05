# birdkit-kit: code every Birdkit-style template shares

Birdkit-style (SvelteKit) templates import these as `$kit/…`. Today that's `projects/interactive/`; the photo essay
moved to React in `apps/story`, because standard NYT articles are drawn by the React platform, not built with Birdkit.

| File | What it is |
|---|---|
| `config.js` | `kit(adapter)`: the SvelteKit settings that produce the output tree (`dist/`, `_app.<hash>/`, relative paths, prerender, split bundles) and the `$kit` alias |
| `hash-assets.js` | Hashes `big_assets/`, writes `src/lib/assets.js`, copies media into `dist/` and verifies every media URL. Run from the template's folder by its `npm run build` |
| `Blocks.svelte` | The renderer: walks `doc.json`'s `body`. Takes the template's `registry` (from its `src/lib/blocks.js`) as a prop |
| `Text.svelte` | One paragraph in the text column, through the allow-list |
| `inline-html.js` (+ test) | The allow-list for inline HTML in text blocks |
| `doc.js` | `series()` and `list()` for flat, numbered doc props |
| `shell/` | The mock platform shell: `Masthead`, `ShareTools`, `Recirc`, `AdSlot`, `SiteFooter` and `shell.css` |

## How a template uses it

- `svelte.config.js`: `import { kit } from '../birdkit-kit/config.js'; export default { kit: kit(adapter) };`
- `vite.config.js`: `server.fs.allow` includes `'../birdkit-kit'`, and `resolve.dedupe: ['svelte']`.
- `package.json`: `node ../birdkit-kit/hash-assets.js` in `assets` and `build`; `npm test` also runs `../birdkit-kit/**/*.test.js`.

## Rules

- **No `package.json`, no `node_modules`.** This is plain source, compiled by each template with its own Svelte. That's
  why the adapter is passed in to `kit()` instead of imported, and why the templates dedupe `svelte`.
- **Not in `packages/`.** That folder is the Phase 2 npm workspace; the templates are standalone projects with their own
  lockfiles.
- **A change here changes every template.** Build and test each one (`npm test`, `npm run build`, `npm run test:e2e`).
  CI only builds `projects/interactive/` so far.
