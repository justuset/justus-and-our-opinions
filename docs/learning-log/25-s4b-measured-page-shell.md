# Learning log 25: NYT sandbox S4b: the measured page shell

**Date:** 2026-10-02  **Chunk:** NYT sandbox alignment · S4b  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **build to measurements, and let tests hold you to them.**

The owner measured the shipped page ("In Defense of the Detour") with computed styles at 390, 800 and 1987px wide and
wrote a plan to rebuild its shell from those numbers ([saved here](../plan/2026-10-02-nyt-page-shell.md)). The plan was
for a generic sandbox, so it was adapted, and the owner chose:

- **Adapt** it to this repo as chunk S4b (not a literal run);
- **shell only**: the platform around the story gets the measured values, and the story keeps diatour;
- **the article tasks** (body column, header, two-up, credits) go into S5, keeping our components' features.

## What I built

### The shell as five components

`+layout.svelte` now composes `src/lib/shell/`:

```svelte
<div id="app">
  <Masthead {inverse} />
  <main id="site-content">{@render children()}</main>
  <div id="standalone-footer">
    <ShareTools comments={0} />
    <Recirc />
    <AdSlot />
    <SiteFooter />
  </div>
</div>
```

Each component owns one region and styles only itself.

| Region | Measured | Notes |
|---|---|---|
| `Masthead` | Container `position: absolute; top: 6px`, transparent. Section 47px tall (padding 8 15 3) on phones, 42px (4 15 2, `top: -7px`) from 740 | Holds the skip link. Wordmark "Our Opinions" in Libre Caslon Text |
| `ShareTools` | Comment button 350 / 600 wide, 36 tall, `#567b95` with a `#326891` border, 13px 600 uppercase, 0.65px tracking | Pills below. Layout only: the buttons do nothing |
| `Recirc` | Full width, 45px top margin; from 740 a 1200px-max row, padding `20px 3% 0`, grid + rail | Grey placeholder blocks |
| `AdSlot` | `#bottom-wrapper`: 280px min height, secondary background, borders, 10px uppercase label | A dashed 300 × 250 box |
| `SiteFooter` | 45px bottom padding, 11px type, 1200px max from 1150, a `#ebebeb` rule | "© 2026 Our Opinions · demo" |

### Platform tokens, apart from the story's

`src/lib/shell/shell.css` holds `--shell-*` tokens: colors, the Libre Franklin and Libre Caslon fonts, a 20px phone
gutter, the 600px column and the 1200px page. On the real site, the platform and the graphics desk are different teams with
different stylesheets. Two token sets with different prefixes make that split visible: nothing in the story reads a
`--shell-` token, and nothing in the shell reads a story token.

The shell also takes over the page's background (white) and text color, which `app.css` used to set. The story already
paints its own background inside `<article>` (S3), so the dark story now sits on a white platform page, as a
dark interactive does on the real site.

### The masthead floats, so `--masthead-h` is 0

S2's mock bar was sticky, so panels had to pin *below* it. The measured masthead is `position: absolute`: it sits over
the story's header (which starts 90px down, the measured `margin-top`) and scrolls away with the page. Nothing platform-owned
stays on screen, so panels pin to the very top, as on the shipped page.

All of that is one token change, `--masthead-h: 0px`. The sticky `top`, the panel height, `scroll-padding-top` and
S4's `trackBounds()` already read it, so no scroll code changed. That's the payoff of S2 putting the offset in one place.

### Which wordmark color?

The measured wordmark is black, over the shipped page's white header. Our default story header is dark, and black on
`#121211` would vanish. The layout reads the doc's theme (`page.data.doc.theme` from `$app/state`) and passes
`inverse` to the masthead: white over diatour, black over the light "opinion" theme.

### Playwright at three widths

`@playwright/test` (pinned to the same 1.56.1 as `playwright`) with three projects: mobile 390×844, tablet 800×1024 and
desktop 1440×900. Its `webServer` builds and serves `dist/`, so the tests run against what a reader gets.

```js
// tests/footer.spec.js
const b = await css(page, '#comment-button-bigBottom', ['background-color', 'font-size', 'letter-spacing']);
expect(Math.round(b.width)).toBe(viewport() === 'mobile' ? 350 : 600);
expect(Math.round(b.height)).toBe(36);
expect(b['background-color']).toBe('rgb(86, 123, 149)');
```

- **`css()`** returns an element's box plus whichever computed styles you ask for. It's the same measurement the owner did in DevTools, now repeatable.
- **The test ran red before the code existed.** All 18 shell tests failed first; only "no horizontal scroll" passed. The rule is to see a test fail before trusting that it passes.
- **Web fonts are blocked inside the tests** by a fixture in `helpers.js`. The specs assert sizes and positions, not glyph widths, so a font download only adds flakiness. In this sandbox, where Google Fonts can't load, the first run took 4.4 minutes waiting on them; with the fixture it takes 18 seconds.
- **`npm test` stays the unit tests.** The plan made `test` run Playwright, which would have stopped CI running the unit tests. The browser suite is `npm run test:e2e`, the name CLAUDE.md reserved for it, and CI now runs it after the build.

## Checkpoint

| Check | Result |
|---|---|
| `npm run test:e2e` | **21 passed** (7 tests × mobile, tablet, desktop) |
| Masthead | absolute, transparent, 47 / 42 / 42px, scrolls off by 1500px, skip link → `#site-content` |
| Panels | pin at `top: 0px` |
| Comment button | 350 / 600 / 600 wide, 36 tall, measured color, type and tracking |
| Region order | story → share tools → recirculation → ad → footer |
| Footer | 45px bottom padding, 11px; full width (390) on phones, `max-width: 1200px` on desktop |
| Horizontal scroll | none at any width |
| `npm run parity` | within 1px (the shell switch now hides `.masthead-container` and `#standalone-footer`) |
| `npm test`, JS off | 7 pass; all story text renders at 375 / 740 / 1150 |

The review screenshots (`test-results/review/*.png`, not committed) show the masthead light over the dark header, and
the shell below: a 600px comment button, a three-column grid with a rail on desktop (one column on phones), the ad
slot, then the footer.

## Deviations from the measurements

- **Wordmark:** "Our Opinions" (CLAUDE.md), white over a dark story header.
- **Small grey labels:** `#666`, not the measured `#999` / `#727272`. On `#f7f7f7`, `#999` is 2.66:1 and `#727272` is 4.49:1, both under WCAG AA's 4.5 (`#666` is 5.36:1). The white-on-`#567b95` comment button is exactly 4.5:1, so it passes, just.
- **The error page** sat on a white page with the story's light text, and its `<main>` was nested in the layout's `<main>` (invalid HTML, from before S4b). It now uses a `<div>` and the shell's colors.

## Concepts learned

- **Measure, then encode the measurement as a test.** A number in a table is a claim. A number in an assertion stays true, or CI goes red.
- **Separate token sets for separate owners.** The platform and the story can each change their look without breaking the other.
- **One token for a cross-cutting offset.** Moving the masthead from sticky to floating was a one-line change because S2 never hard-coded 44px.
- **Keep the test runner's job clear.** Unit tests (fast, no browser) and e2e tests (a built page in a real browser) get separate scripts, so each stays quick to run on its own.

## Next

[S5: the real component set](../plan/nyt-sandbox-alignment.md#s5-the-real-component-set), now including the shell
plan's article tasks. One open decision first: whether the measured NYT look lives in the `opinion` theme.
