# Chunk 11 (optional): Port to Svelte

**One new idea:** **components rendered from a content file.** Once the page works in plain JS, turn each block into a
Svelte component, wrap the engine in `<Scrolly>`, and render the page from a JSON file. That's the Birdkit
architecture in miniature, and the bridge into [Phase 2](../phase-2/README.md) (chunks 07–08).

**Reference:** your finished `prototype/index.html`, chunk 1's content-model comment, and `docs/architecture.md`.
**Skills:** `svelte-runes`, `svelte-template-directives`, `svelte-styling`, `sveltekit-structure`.

## Build
- [ ] `npx sv create prototype-svelte` (SvelteKit, minimal, TypeScript), with `adapter-static` and `export const prerender = true`.
- [ ] `src/lib/content.json`: chunk 1's content model made real. The header, every text block, the two-up, the diagram, scrolly A/B/C/D with their steps and layouts, and the credits.
- [ ] Move `:root` tokens and shared rules (`.g-text`, `.bleed`, twins) into `src/app.css`.
- [ ] Components, one per block type, each owning its scoped `<style>`:
      `Header.svelte`, `Text.svelte`, `TwoUp.svelte`, `Diagram.svelte`, `Credits.svelte`, `SceneSlides.svelte`, `SceneBand.svelte`, `SceneArrange.svelte`, `SceneScrub.svelte`.
- [ ] `Scrolly.svelte` wraps the engine:
  - [ ] Props `steps` and `kind`. It exposes `{ step, progress }` to its content through a snippet: `{@render children({ step, progress })}`.
  - [ ] Registers with one shared engine module (`scroll-engine.ts`, the chunk 8 code) in an **`{@attach}`**, which cleans up on destroy.
  - [ ] Adds `data-enhanced` after mounting (the Svelte version of chunk 10's `.js` gate).
- [ ] `Diagram.svelte`: the ResizeObserver lives in an `{@attach}`, not in `$effect` + `bind:this` (see `CLAUDE.md`).
- [ ] `+page.svelte`: `{#each content.blocks as block (block.id)}` → `<svelte:component>`-style map: `const COMPONENTS = { text: Text, 'two-up': TwoUp, … }`.
- [ ] Header intro: `document.fonts.ready` inside an `{@attach}` on the header.

## Learn
- The plain-JS page had *data* (arrays A, B, C) and *templates* (HTML) separated by convention. Svelte makes that structure explicit.
- `$state` for `step` and `progress`, `$derived` for anything computed from them (`active = step === i`).
- Server rendering: `npm run build` prerenders full HTML, so the page reads without JS, like chunk 10's fallback, but automatic.

## Checkpoint
- [ ] Side by side with `prototype/index.html` at 375, 1024 and 1440: they look and scroll the same.
- [ ] Change a caption in `content.json` and the page updates. No component code changes.
- [ ] `npm run build && npx serve build` with JS disabled: the same readable stack as chunk 10.
- [ ] Add a fifth scrolly section by **editing JSON only**.
