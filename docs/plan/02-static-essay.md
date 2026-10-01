# Chunk 02: Static essay skeleton (HTML and CSS only)

**Goal:** The whole article page, hard-coded, with **no JavaScript at all**. This is the baseline every island
improves on, and the version a reader on a bad connection or with JS off gets.

**Reference:** diatour-nyt §VI.I (page modules), §VIII.II (essay skeleton, landmarks), §VIII.III (named grid
lines, container queries), and §VI.VI (QA: the floating button covering text, the duplicate image).

## Learn first
- [web.dev Learn HTML: semantic HTML](https://web.dev/learn/html/semantic-html)
- [Josh Comeau: interactive guide to CSS Grid](https://www.joshwcomeau.com/css/interactive-guide-to-grid/)
- [Every Layout](https://every-layout.dev/) (the Stack and Center layouts)

## Tasks
- [ ] `src/layouts/Essay.astro`: `<html lang>`, `<head>` metadata (title, description, Open Graph, canonical), skip link, `<header>` / `<main>` / `<footer>` landmarks.
- [ ] Astro components (static) in `src/components/astro/`:
  - [ ] `SiteHeader`: the "Our Opinions" wordmark (not a Times logo) and a section link. Sticky, slim.
  - [ ] `StoryHeader`: kicker (`Opinion | Guest Essay`), `h1`, dek, byline with avatar and `<time datetime>`.
  - [ ] `ActionRow`: share, gift and save as `<button>`s and links. Static for now.
  - [ ] `Figure`: `figure` + `figcaption` + `.credit`.
  - [ ] `PullQuote`: `blockquote` + `cite`.
  - [ ] `Section`: `section[aria-labelledby]` + `h2`.
  - [ ] `EndMatter`: about the author, "More from Our Opinions" (three static cards).
- [ ] Body grid: `grid-template-columns: [full-start] 1fr [content-start] min(68ch, 100% - 2rem) [content-end] 1fr [full-end]`, with `.bleed` and `.wide` breakouts.
- [ ] Cards use container queries (`container: card / inline-size`), so they adapt to their column, not the viewport.
- [ ] Reserve a lane for a future floating button on phones (`padding-right` / `padding-bottom` with `env(safe-area-inset-*)`) — the QA bug from the teardown.
- [ ] Hard-code the demo story's copy into `src/pages/opinion/three-writers.astro`.
- [ ] Print stylesheet: hide the chrome, show link URLs after links.

## Done when
- The page passes [validator.w3.org](https://validator.w3.org/nu/) with no errors.
- Keyboard: Tab reaches the skip link first, then every control in a logical order, with a visible focus ring.
- 320, 375, 768, 1024 and 1440px all look intentional (screenshot each one into `docs/learning-log/img/`).
- The heading outline (from a headings bookmarklet or DevTools) reads `h1 → h2 → h3` with no skipped levels.
- The built page loads **0 bytes of JS**.

## Concepts to write about
- Why `<time datetime>` matters for machines and screen readers
- `min(68ch, 100% - 2rem)`: how one expression gives you a measure and a gutter
- Landmarks vs ARIA roles: don't add a role the native element already provides
