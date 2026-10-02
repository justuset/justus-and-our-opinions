# Learning log 23: NYT sandbox S3: breakpoints and themes

**Date:** 2026-10-02  **Chunk:** NYT sandbox alignment · S3  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea, in two halves: **the page adapts to three device tiers, and its colors are swappable as a block.**

- **Tiers.** The NYT site designs for three tiers: smartphone under 740px, tablet 740–1149px, and desktop from 1150px
  ([blueprint](../reference/nyt-sandbox-blueprint.md) §6). Our components came from a recreation that switched wherever
  each one happened to: 640, 768, 1024 and 1250. A real graphics desk lines its graphics up with the platform's tiers, so
  a story never looks "tablet" in one block and "phone" in the next.
- **Themes.** Decision D1: diatour (dark) stays the default, and a light "opinion" theme can be picked with the doc's
  `"theme"` key.

## What I built

### 1. Breakpoint tokens, and every switch moved to a tier

`app.css` now opens with:

```css
:root {
  --bp-tablet: 740px;
  --bp-desktop: 1150px;
}
```

**These are documentation, not working variables.** CSS can't read custom properties inside `@media` (`@media
(min-width: var(--bp-tablet))` is simply ignored), so the numbers are repeated in each query. The tokens give the numbers
one documented home, and a search for `740px` finds every use.

| Was | Now | What switches |
|---|---|---|
| 1024 | **740** | Header twin art (portrait → landscape), centered header copy, headline 58 → 72px+, the diagram's 4-column stage, the scrub Lottie twin, byline margin (landscape only) |
| 640 | **740** | Two-up: stacked → row |
| 768 | **740** | Scene B: phone stack → 65vh band |
| 1250 | **1150** | Two-up gets 64px side padding and a 1440px cap |
| 739px | **739.98px** | The upper bound of "phone", matching the twin utilities |

The plan said to keep a component's own breakpoint "only where it genuinely needs one, and record why." **None did.**
Every component looked right at the tier boundary, so all moved. The one rule left off-tier is the **< 360px** header
rule: it's a safeguard that shrinks the headline on very small phones, not a device tier.

Why `739.98px` and not `739px`? With browser zoom or a high-density screen, the viewport can be **739.5px** wide. Then
`max-width: 739px` is false and `min-width: 740px` is also false, so neither rule applies. `739.98` closes that gap. (Media
queries level 4 has `width < 740px`, which says this directly; the `.98` form works in older browsers too.)

The image `sizes` hints in `doc.json` named the old breakpoints, so the browser would have picked image files for a
layout that no longer exists. They were updated (numbers only, no essay words):

```diff
- "sizes": "(min-width: 1250px) 656px, (min-width: 640px) 50vw, 100vw"
+ "sizes": "(min-width: 1150px) 656px, (min-width: 740px) 50vw, 100vw"
```

### 2. Themes as token blocks

The S2 article already carried `class="g-theme-{theme}"`. S3 makes that class do something:

```css
.g-theme-diatour { --paper: #121211; --ink: #ededeb; --soft: rgba(235,235,240,.66); --faint: rgba(235,235,240,.56); … }
.g-theme-opinion { --paper: #fbfbf8; --ink: #121212; --soft: rgba(18,18,18,.72);   --faint: rgba(18,18,18,.6);    … }
:where(.birdkit-body) { display: flow-root; background: var(--paper); color: var(--ink); }
.g-theme-opinion :is(.hero-anim, .scrub-anim) { filter: invert(1); }
```

- **A theme is only a set of token values.** Every component already used `var(--ink)`, `var(--soft)` and so on, so no component changed. That's the payoff of the "tokens only, no hard-coded colors" rule.
- **The story paints its own background.** Custom properties inherit, so the theme class redefines the tokens for everything inside the article. But the page behind it (`body`) belongs to the shell and keeps `:root`'s values. So the article sets its own `background`. That's also why the masthead stays dark in the light theme: it's the platform's, not the story's.
- **`display: flow-root`** makes the article contain its children's margins. Without it, the header's top margin "collapses" through the article and a dark strip of the shell shows above the light story.
- **Lottie art is inverted** in the light theme. The animations were drawn in light-on-dark, and `filter: invert(1)` flips them without a second set of files.

## Checkpoint

**1. Breakpoint matrix** at 375 / 739 / 740 / 1149 / 1150 / 1440 (breakdown §17), measured in headless Chromium:

| Width | Header art | Headline | Two-up | Diagram | Scene B | Scrub twin |
|---|---|---|---|---|---|---|
| 375 | portrait | 58px | column | list | phone stack | portrait |
| 739 | portrait | 58px | column | list | phone stack | portrait |
| **740** | **landscape** | **72px** | **row** | **4 cols + arrows** | **65vh band** | **landscape** |
| 1149 | landscape | 82.7px | row | 4 cols | band | landscape |
| **1150** | landscape | 82.8px | **row, 64px pad** | 4 cols | band | landscape |
| 1440 | landscape | 96px | row, 64px pad | 4 cols | band | landscape |

Every change now happens across 739 → 740 or 1149 → 1150, and no width scrolls sideways. In the "before" run, 739 already
had a row two-up while 740 still had portrait art and a list diagram: three different "tablets" on one page.

The byline's 100px bottom margin applies only at 740+ **in landscape**. At 740 × 900 the screen is portrait, so 32px is
correct.

**2. Contrast (WCAG AA, 4.5:1 for body text).** Each text token was measured on the page background and on the
`--surface` panels, with alpha colors blended over what's behind them first (a 60% black is only as dark as the paper
it's on):

| Theme | ink | soft | faint |
|---|---|---|---|
| diatour | 15.99 | 7.29 | 5.55 |
| opinion | 18.07 | 7.40 | **4.84** |

The first run failed: the light `--faint` at 0.56 alpha gave **4.23:1** on paper and 4.13:1 on surface. Raising it to
0.6 gives 4.84 and 4.70. `docs/design-system.md` was updated to match. `--line` (1.49 and 1.31) is decorative: it draws
rules, never text, so AA doesn't apply.

**3. Nothing else moved.**

- **Parity:** `npm run parity` is still within 1px at 375 / 1024 / 1440. Those widths sit on the same side of the old and new breakpoints, so the prototype and the project still agree there.
- **No JS:** all text renders at each tier.
- **Media:** "verified 23 media URLs" still passes.

## Concepts learned

- **`@media` can't use `var()`.** Media queries are evaluated before any element exists, and custom properties belong to elements. Breakpoint tokens are documentation, or a job for a preprocessor or `@custom-media` (not yet in browsers).
- **Gaps between ranges.** `max-width: 739px` plus `min-width: 740px` leaves fractional widths uncovered. Use `.98`, or range syntax.
- **Theming with custom properties is just inheritance.** Redefine the tokens on a container, and everything inside picks them up. Everything outside (the shell) doesn't.
- **Contrast with transparency** depends on the background. Always blend first, then measure, and measure on every surface the text appears on.
- **Margin collapse** can leak a child's margin out of its parent. `display: flow-root` is the modern, side-effect-free way to stop it.

## Known nuance

The inverted Lottie art uses 5% / 14% fills, while the light tokens use 4% / 12%. When the hero animation hands over to
its SVG poster, the shapes shift very slightly in the light theme. A light-theme Lottie export would fix it. It's left
as is, since diatour is the default.

## Next

[S4: StickyScroller on ScrollTrigger](../plan/nyt-sandbox-alignment.md#s4-stickyscroller-on-scrolltrigger): GSAP behind
our own `{ step, progress }` contract.
