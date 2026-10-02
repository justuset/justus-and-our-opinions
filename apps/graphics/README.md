# @opinion/graphics

The graphics desk: SvelteKit + Svelte 5, built with `adapter-static`. Every page is **prerendered** to HTML at build
time (`src/routes/+layout.ts`), so there's no server at runtime.

```bash
npm run dev -w @opinion/graphics     # http://localhost:5174
npm run build -w @opinion/graphics   # build/ (static HTML, CSS, JS)
npm run check -w @opinion/graphics   # svelte-check (types in .svelte files)
```

Styles come from `@opinion/design-system`. From [chunk 05](../../docs/plan/phase-2/05-svelte-tally.md), each graphic
gets a preview route and two embed entries (`render` on the server, `hydrate` in the browser).
