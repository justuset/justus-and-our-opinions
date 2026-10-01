# Chunk 03: Content model with ArchieML

**Goal:** Move the story out of code. An editor writes `content/stories/three-writers.aml`, and the template
turns it into a typed list of blocks and renders it. Then **change the template once and two stories update.**

**Reference:** diatour-nyt §I.VI (ArchieML), §VIII.VIII (block map, content drives layout), §VI.VII ("extract
everything that changed between uses into a prop or ArchieML field").

## Learn first
- [ArchieML spec](http://archieml.org/) (15 min, it's short) and [archieml-js](https://github.com/newsdev/archieml-js)
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) and [custom loaders](https://docs.astro.build/en/reference/content-loader-reference/)
- [TypeScript discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

## Tasks
- [ ] `npm i archieml` (add types in `src/lib/archieml.d.ts` if none ship).
- [ ] Write `three-writers.aml` with these fields: `slug`, `kicker`, `headline`, `dek`, `author`, `date`, `lead` (image block), and a `[+body]` freeform array of typed blocks:
  ```
  [+body]
  text: Streets are the largest public space we own…
  {.quote}
  text: …
  cite: A. Writer
  {}
  {.tally}
  total: 42
  label: car-free blocks
  span: since 2019
  {}
  []
  ```
- [ ] `src/lib/types.ts`: a `Block` union (`text | heading | quote | image | tally | chart | scrolly | quiz | roundtable`) and a `Story` type.
- [ ] `src/lib/archie.ts`: parse, then **validate** (Zod). Fail the build with a clear message for unknown block types or a missing `source` on charts ("no source, no chart").
- [ ] A content collection that loads every `.aml` in `content/stories/`.
- [ ] `BlockRenderer.astro`: `switch (block.type)` → component. Unknown types render nothing in production and a visible warning in dev.
- [ ] `src/pages/opinion/[slug].astro` with `getStaticPaths()` over the collection. Delete the hard-coded page from chunk 02.
- [ ] Add a second story, `content/stories/second-essay.aml`, with a different block order, to prove the template generalizes.

## Done when
- Editing a sentence in `.aml` updates the page on save (dev server).
- A typo in a block type fails `npm run build` with a message that names the file and the block.
- Two stories render from one template.

## Concepts to write about
- Why "content as data" lets editors work without a ticket
- Discriminated unions: how `block.type` narrows the TypeScript type in each branch
- Build-time validation vs runtime validation
