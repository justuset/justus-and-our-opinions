# Chunk 02: Server-rendered essay (React SSR, no client behaviors yet)

**Goal:** The full Opinion article as **React components rendered on the server**, which is how the Times article
template works. It uses the diatour look and the guide's three-rail layout, and it's fully readable before any
JavaScript runs.

**Reference:** diatour-nyt §VI.I (page modules), §VIII.II (essay skeleton, landmarks), §VI.VI (QA bugs to
design against); `docs/layout-system.md` §3–5 (rails, breakpoint choreography, source order, defensive layout);
guide §2 and §4.

## Learn first
- [React Router: route modules, `meta` and `links`](https://reactrouter.com/start/framework/route-module)
- [web.dev Learn HTML: semantic HTML](https://web.dev/learn/html/semantic-html)
- [Josh Comeau: interactive guide to Grid](https://www.joshwcomeau.com/css/interactive-guide-to-grid/)
- [Tufte CSS: sidenotes](https://edwardtufte.github.io/tufte-css/#sidenotes)

## Tasks
- [ ] `app/root.tsx`: `<html lang>`, theme attribute, skip link, `<Meta/> <Links/>` (title, description, Open Graph, canonical).
- [ ] Chrome components (`app/components/chrome/`): `SiteHeader` (the "Our Opinions" wordmark, not a Times logo), `ActionRow` (share, gift and save as real buttons and links, no behavior yet), `EndMatter`.
- [ ] Story components (`app/components/story/`): `StoryHeader` (kicker `Opinion | Guest Essay`, `h1`, dek), `StoryMeta` (avatar, bio, `<time dateTime>`, a contents placeholder), `Figure`, `PullQuote`, `Callout`, `Section`.
- [ ] Layout from `layout-system.md` §3: `.story-body` with `StoryMeta` in the left rail and callouts floating into the right rail. Implement all **four tiers** (≥75em, 60–75em, 48–60em, <48em).
- [ ] Source order = single-column reading order. Callouts follow their paragraph in the JSX.
- [ ] Defensive layout: `min-width: 0` on grid children, `overflow-wrap: anywhere` on links and code, `aspect-ratio` on media placeholders.
- [ ] Reserve a lane for floating controls on phones (`padding-inline-end`, `env(safe-area-inset-*)`). This fixes the teardown's floating-share bug before it exists.
- [ ] Route `app/routes/opinion.$slug.tsx`, with the demo copy hard-coded in a TS object for now (chunk 03 replaces it).
- [ ] Print stylesheet.
- [ ] *Exercise:* write `scripts/ssr-by-hand.mjs`, which calls `renderToString(<StoryHeader …/>)` from `react-dom/server` and prints the HTML. Compare it with what the framework does.

## Done when
- With JavaScript disabled, the article is complete and readable at every tier.
- Screenshots at 375, 800, 1000 and 1280px show the four tiers (`docs/learning-log/img/`).
- The [Nu HTML validator](https://validator.w3.org/nu/) shows no errors. The heading outline is `h1 → h2 → h3`. A keyboard user reaches the skip link first.
- At 200% zoom, the layout drops a tier instead of overflowing (em-based queries).

## Concepts to write about
- What the server sends vs what React does on hydration (chunk 04 adds hydration)
- Why source order matters more than visual order
- How the float-into-the-rail sidenote works at each tier
