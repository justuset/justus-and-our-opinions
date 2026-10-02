# Phase 2 · Chunk 03: Content model with ArchieML

**Goal:** Story copy moves into `content/stories/*.aml`. The shared `@opinion/archie` package parses and
validates it into typed blocks, and the React template renders them through a block map, the pattern in diatour §VIII.VIII.

**Reference:** diatour-nyt §I.VI (ArchieML), §VIII.VIII (block map, error boundaries, lazy), §VI.VII
("everything that changes between uses becomes a prop or an ArchieML field"), §VII.IV (editors stay in Docs).

## Learn first
- [ArchieML spec](http://archieml.org/) and [archieml-js](https://github.com/newsdev/archieml-js)
- [React Router: `loader`](https://reactrouter.com/start/framework/data-loading)
- [TypeScript discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions), [Zod](https://zod.dev)

## Tasks
- [ ] `packages/archie`: `npm i archieml zod`. Export `parseStory(text): Story` and the types `Story`, `Block`.
- [ ] Block union: `text | heading | quote | callout | image | video | audio | quiz | roundtable | graphic`.
  - `graphic` is the **embed contract** from `architecture.md`: `{ graphic: 'tally' | 'stat-chart' | 'scrolly', props, ratio? }`.
- [ ] Validation errors name the file, the block index and the field. A chart without `source` fails ("no source, no chart").
- [ ] Write `three-writers.aml` (kicker, headline, dek, author, date, lead, a `[+body]` freeform array).
- [ ] Story route `loader`: read and parse the `.aml` on the server and return `Story`. Use a 404 for unknown slugs.
- [ ] `BlockRenderer.tsx`: `const BLOCKS = { text: TextBlock, quote: PullQuote, … }`. Unknown types render `null` in production and a visible warning in dev.
- [ ] Wrap each block in `ErrorBoundary` (`react-error-boundary`), so one bad block can't blank the essay.
- [ ] A second story, `second-essay.aml`, with a different block order.
- [ ] *Stretch:* `scripts/fetch-doc.mjs` pulls a published Google Doc as text into `content/stories/` (the Times's real copy flow).

## Done when
- Editing the `.aml` changes the page on reload. A malformed block fails `npm run build` with a precise message.
- Two stories render from one template.
- `packages/archie` has unit tests for parsing and for each validation error.

## Concepts to write about
- Content as data: editors without tickets
- Narrowing on `block.type`
- Why the graphic block holds only props (the story doesn't know Svelte exists)
