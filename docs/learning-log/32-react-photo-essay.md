# Learning log 32: The photo essay in the reference page's React components

**Date:** 2026-10-05  **Step:** Svelte photo essay → React story app  **Branch:** `feat/story-photo-essay-react`

## Goal

The shipped Opinion photo essay is a standard article on the Times's React platform, not a Birdkit page. Its
component names are visible in the browser (React fiber names): `HeaderBasic`, `MediaFigure`, `Credit`, `Diptych`,
`Scrolly`, `ResponsiveAd` › `AdSlot`, `RelatedLinks` › `RelatedLink`, `Italic`, `HangingPunctuation`, `Timestamp`,
`withErrorBoundary`. Rebuild `projects/photo-essay`'s Svelte components as those React components in `apps/story`,
from the same doc.

## What I did

- `app/article/types.ts`: the platform's block shape. Each block has a `__typename`; paragraphs are `TextInline`
  pieces with formats (`ItalicFormat`, `BoldFormat`, `LinkFormat`), never HTML strings.
- `app/article/fromBirdkitDoc.ts`: converts `projects/photo-essay/content/doc.json` (flat props) into those blocks.
  `series()` and the inline allow-list (`inline.ts`) are ports of `$kit/doc.js` and `$kit/inline-html.js`. The
  platform-only blocks (two `Dropzone`s and a `RelatedLinksBlock`) are added here, labeled demo.
- `app/components/article/`: one component per block, CSS Modules for styles (hashed class names, like the
  reference's Emotion `css-*` classes), rem units and logical properties.
- `Scrolly` is a class component like the reference's, with the same ids, one default `IntersectionObserver`, the
  step index read from the card id, and the cumulative reveal (every photo up to the last card on screen).
- `Body` maps `__typename` to a component wrapped in `withErrorBoundary`. The route's loader runs `docProblems` first,
  because error boundaries don't run during server rendering.
- `tests/photo-essay.spec.ts`: 10 tests × 3 tiers (390 / 800 / 1440), including JS off and no console errors.

## What broke and how I fixed it

- **Scroller photos only filled the top of the screen on phones.** `#story img { block-size: auto }` has an id in it,
  so it beat `.scrolly[data-enhanced] .img { block-size: 100% }`. Wrapped the base rules in `:where(#story)` so they
  have zero specificity, as the Svelte template does with `:where(.birdkit-body)`.
- **`:first-of-type` picked the wrong card.** The credit is a `<p>` too. Targeted `[data-step='0']` and `:last-child`.
- **React 19 preloaded the scroller's first photos in `<head>`.** React adds a preload for any image that isn't lazy.
  The scroller is far down the page, so its photos are all `loading="lazy"` now; only the lead photo is preloaded.
- **npm 10 refused the install** (`engines.npm >= 11`). `npx npm@11 install` works without changing the global npm.
- ESLint's hooks rule flagged Playwright's fixture callback named `use`. Renamed it `provide`.

## Concepts learned

- A class component's `componentDidMount` is the React-era twin of Svelte's `{@attach}`: it runs once in the browser,
  after the server HTML is on screen, so it's the safe place for `IntersectionObserver`.
- Kept vs changed from the reference: kept the ids, the default observer and the cumulative reveal; changed
  `alt="photo"` to real alt text, made card ids unique per scroller, rendered the credit with React instead of
  `innerHTML`, and used `srcset`/`sizes` instead of a stored `mobile` state.
- Error boundaries catch browser render errors only. On the server, validate data before render.
- The default `IntersectionObserver` counts a card the moment one pixel is on screen, so the photo swaps as the
  card enters at the bottom, earlier than the Svelte template's middle-line trigger.

## What I'd do differently

Share `renditions.js` and `inline-html.js` between the two templates as one TypeScript package instead of porting
them, once `packages/` has a build step.
