# Phase 2 · Chunk 05: Graphics desk and the embed pipeline, first graphic: Tally

**Goal:** Build the first Svelte 5 graphic in the SvelteKit graphics app, then the **embed pipeline** that lets
the React story server-render it and hydrate it, the Times pattern of desk-built graphics embedded in the article template.

**Reference:** diatour-nyt §VI.II (tally sketch), §VI.VII.1 (tally template: edge cases, ArchieML fields),
§III.II (Svelte at the Times), §II.VI (Vue → runes). `docs/architecture.md`, "The embed contract."
**Skills:** `svelte-runes`, `svelte-template-directives` (`{@attach}`), `svelte-styling`, `sveltekit-structure`
(prerender, `<svelte:boundary>`, ssr-hydration reference).

## Learn first
- [Svelte tutorial](https://svelte.dev/tutorial): Basic Svelte, runes, each blocks, attachments
- [Svelte: `mount` / `hydrate`](https://svelte.dev/docs/svelte/imperative-component-api) and [`svelte/server` `render`](https://svelte.dev/docs/svelte/svelte-server)
- [SvelteKit: page options, `prerender`](https://svelte.dev/docs/kit/page-options)

## Tasks
### The graphic
- [ ] `apps/graphics/src/lib/graphics/Tally.svelte`, with `let { total, label, span } = $props()`.
  - [ ] Marks are `aria-hidden`. The count is **live text** in a `figcaption`.
  - [ ] Server render: all marks filled (the no-JS end state). On the client, reset and fill when 50% visible, with an **`{@attach}`** function that creates and disconnects the IntersectionObserver (not `$effect` + `bind:this`).
  - [ ] Reduced motion: stay full. Large counts (over 100) group into tens. Grid + container query sizing. Tokens only.
- [ ] Wrap the graphic in `<svelte:boundary>` with a quiet failed state.
- [ ] Preview route `src/routes/preview/[graphic]/+page.svelte` with three example prop sets. The desk can review graphics without the story.

### The pipeline
- [ ] `apps/graphics/src/embeds/tally.server.ts` → `export function render(props) { return svelteRender(Tally, { props }) }`.
- [ ] `apps/graphics/src/embeds/tally.client.ts` → `export function hydrate(target, props) { return svelteHydrate(Tally, { target, props }) }`.
- [ ] `scripts/build-embeds.mjs`: Vite library builds, SSR for `*.server.ts` and browser for `*.client.ts`, written to `dist/embeds/<graphic>/`, plus `manifest.json` (file hashes).
- [ ] Story side, `app/components/embed/Embed.tsx`:
  - [ ] In the loader (server), import `dist/embeds/<graphic>/fragment.js` and call `render(props)`. Pass `{ html, css }` to the component.
  - [ ] Render `<figure className="embed" style={{ aspectRatio }} data-graphic data-props dangerouslySetInnerHTML={{ __html: html }} />`, memoized so React never re-renders its children.
  - [ ] On the client, an IntersectionObserver triggers a dynamic `import(embedUrl)` → `hydrate(el, props)`. Clean up with `unmount` on route change.
  - [ ] Wrap it in an `ErrorBoundary`.
- [ ] Map `graphic` blocks in `BlockRenderer` → `<Embed>`. Add `{.graphic} graphic: tally …` to the demo `.aml`.

## Done when
- The tally appears in the **page source** of the React story (server-rendered) and animates once on scroll.
- The Network panel shows `embed.js` for the tally loading only near the viewport. React and Svelte both run on the page with no hydration warnings.
- Breaking the embed (throw in `hydrate`) leaves the server HTML in place and the essay intact.

## Concepts to write about
- `{@attach}` vs `$effect` + `bind:this`
- `render()` → `hydrate()`: Svelte's SSR contract, side by side with React's
- Why the story app knows only `{ graphic, props }`: team boundaries as code boundaries
