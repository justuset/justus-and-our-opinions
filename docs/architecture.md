# Architecture: a Times-shaped stack, a React story page plus SvelteKit graphics

**Status:** Accepted, 2026-10-01. It supersedes the earlier Astro-islands proposal (see "History" at the end).
**Driving requirement:** use the diatour design system, and stay **as close as possible to how New York Times
Opinion pages are built**.

## What we're imitating

From the diatour-nyt analysis (§III, §VII.III, §VIII):

| At the Times (as publicly described) | In this project |
|--------------------------------------|-----------------|
| The article page is **React**, server-rendered on **Node**, then hydrated in the browser. Data comes from GraphQL | `apps/story`: React 19 + **React Router 7 (framework mode)**, SSR on Node, hydrated with `hydrateRoot` |
| Recurring formats are React components fed by structured content (a block list) | `BlockRenderer` maps `block.type` → React component (diatour §VIII.VIII) |
| Graphics and visual essays are built by the graphics desk in **Svelte / SvelteKit**, with **ArchieML** copy and **ai2html** | `apps/graphics`: **SvelteKit** + Svelte 5, ArchieML, an optional ai2html export |
| Graphics are separate projects **embedded** into the article as server-rendered HTML that then hydrates | Each graphic builds into an **embed bundle**: `fragment.html` + `embed.js` + `embed.css`. The story inlines the fragment on the server, and the Svelte embed hydrates it on the client |
| Editors write in Google Docs, and code reads ArchieML | `content/stories/*.aml` (a Google Docs fetch is an optional stretch) |
| CI/CD through GitHub Actions | GitHub Actions |

> **What we can't copy, and why:** the GraphQL server, the Scoop and Oak CMS, and the Times's internal graphics
> framework are private. (That framework has been publicly discussed under the name *Birdkit*, built on SvelteKit,
> but none of this is in the diatour sources. Verify before citing it.) We substitute files and small build
> scripts at those seams, and keep the **shapes** of the interfaces the same: typed blocks in, server HTML out,
> hydrate on the client.

## Diagram

```
 content/stories/three-writers.aml ─────────────► packages/archie  (parse + validate → Story { blocks[] })
                                                         │
               ┌─────────────────────────────────────────┴───────────────────────────┐
               ▼                                                                       ▼
   apps/story  (React 19, React Router 7, Node SSR)                  apps/graphics  (SvelteKit, Svelte 5)
   ┌───────────────────────────────────────────┐                    ┌───────────────────────────────────┐
   │ route /opinion/:slug                       │                    │ src/lib/graphics/Tally.svelte      │
   │  loader → Story                            │                    │ src/lib/graphics/StatChart.svelte  │
   │  <Essay> → <BlockRenderer>                 │                    │ src/lib/graphics/Scrolly.svelte    │
   │    text / quote / figure    → React (SSR)  │                    │ routes/preview/[graphic] (desk     │
   │    quiz / roundtable        → React (SSR + │                    │   preview pages, prerendered)      │
   │                               hydrate)     │    build-embeds    │                                     │
   │    graphic {slug, props}    → <Embed>  ◄───┼────────────────────┤ dist/embeds/<graphic>/             │
   │       server: inline fragment.html         │                    │   fragment.html  (svelte/server)    │
   │       client: load embed.js → hydrate()    │                    │   embed.js       (svelte hydrate)   │
   └───────────────────────────────────────────┘                    │   embed.css                         │
               ▲                                                     └───────────────────────────────────┘
               └──────────── packages/design-system  (diatour tokens.css, base.css, components.css) ─────────┘
```

## Repository layout (npm workspaces)

```
justus-and-our-opinions/
├─ package.json                 ← "workspaces": ["apps/*", "packages/*"]
├─ content/stories/*.aml        ← story copy (ArchieML)
├─ packages/
│  ├─ design-system/            ← diatour tokens + base + component CSS (single source for both apps)
│  └─ archie/                   ← ArchieML → typed Story/Block (TypeScript + Zod)
├─ apps/
│  ├─ story/                    ← React Router 7 app: the Opinion article template (product side)
│  │  └─ app/{routes,components/blocks,components/chrome,embed}
│  └─ graphics/                 ← SvelteKit app: graphics desk
│     ├─ src/lib/graphics/      ← one Svelte component per graphic
│     ├─ src/routes/preview/    ← standalone preview pages per graphic
│     └─ scripts/build-embeds.mjs
├─ tests/{unit,e2e}
└─ .github/workflows/ci.yml
```

## Two page types

| Page type | Who builds it at the Times | Our app | Example |
|-----------|----------------------------|---------|---------|
| **Essay**: the standard Opinion article template | Platform (React) + embedded graphics | `apps/story` | "Three Writers, One Question" |
| **Visual essay**: a full-page interactive (Birdkit-style) | Graphics desk (SvelteKit), end to end | `apps/graphics` route `/essays/[slug]` | The rebuild of `docs/reference/scrolly-template.html` |

The scroll scenes and graphics are written once and used in both: full-page in a visual essay, and as embeds inside an essay.
How the visual essay works is explained in `docs/reference/scrolly-template-breakdown.md`. It's prototyped by hand in
**Phase 1** (`prototype/index.html`, `docs/plan/README.md`) before Phase 2 builds it here.

## Which layer does a block belong in?

| If the block… | Built in | Why (Times analogy) |
|---------------|----------|---------------------|
| is text, a quote, a figure or end matter | React, server-rendered | The platform article template |
| is a recurring interactive format (quiz, poll, roundtable) | React, hydrated | Product features live with the product front end |
| is a bespoke visual or scrollytelling | Svelte, in the graphics app, embedded | The graphics desk builds it and the article embeds it |
| is a static annotated chart drawn by a designer | ai2html export, embedded as a fragment | The newsroom's Illustrator → HTML path |

## The embed contract (the seam between React and Svelte)

```ts
// block in the story
{ type: 'graphic', id: 'tally-1', graphic: 'tally', props: { total: 42, label: 'car-free blocks', span: 'since 2019' },
  ratio?: '16 / 9' }

// files produced by apps/graphics for each graphic
dist/embeds/tally/fragment.js   // export function render(props): { html, css }   (server, svelte/server)
dist/embeds/tally/embed.js      // export function hydrate(target, props)          (client, svelte hydrate)
dist/embeds/tally/embed.css
```

- **Server:** the story's `<Embed>` calls `render(props)` and outputs
  `<div class="embed" data-graphic="tally" data-props='…' dangerouslySetInnerHTML={{ __html: html }} />`.
  React hydration leaves that inner HTML alone, because the string is the same on server and client.
- **Client:** `<Embed>` uses an IntersectionObserver to `import('/embeds/tally/embed.js')` when the embed nears
  the viewport, then calls `hydrate(el, props)`. The wrapper reserves space (`aspect-ratio`) so nothing shifts.
- **Isolation:** each `<Embed>` sits in a React `ErrorBoundary`. Inside, the Svelte graphic uses `<svelte:boundary>`.

## Trade-offs (said honestly)

- **More moving parts than Astro.** You learn real seams: SSR, hydration, embed bundles and workspaces. That's the point.
- **The whole article hydrates with React**, as the Times page does. Its JS cost is real, so Phase 2 chunk 11 sets budgets
  (React app ≤ 150 KB gzipped, each embed ≤ 40 KB).
- **Two dev servers** (`story` on :5173, `graphics` on :5174). A root `npm run dev` runs both.

## History

- **v1 (superseded): Astro shell with Svelte and React islands.** It was simpler and lighter, but no Times page works that
  way. Dropped on 2026-10-01 at the user's request to stay close to the Times's front-end practice. The
  hand-rolled island exercise survives as the embed pipeline in Phase 2 chunk 05.
