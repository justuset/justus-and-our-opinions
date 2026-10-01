# How the scrolly template is built: a breakdown for designers and front-end developers

**Source:** [`scrolly-template.html`](scrolly-template.html) (supplied 2026-10-01). It recreates the layout and fluid
mechanics of a *Birdkit-style* New York Times interactive (a full-page visual story built by the graphics desk), with
placeholder content. Its own header comment says values marked **"measured"** were read from a reference page. We
haven't re-checked those against the live page. Everything marked **✔ verified** below was measured by loading the
template in headless Chromium at 320, 375, 800, 1024, 1280 and 1440px wide (Playwright, 2026-10-01).

> **Shareable version:** a designed page of this breakdown, with live column and runway calculators, is at
> <https://claude.ai/artifact/EEvaHehYdR7vNAMkXd697j> (private until shared from its Share menu).

> **How to read this doc.** Each part has a **For designers** box (what you see, what to hand off) and a **For
> developers** box (the exact mechanism). Part 19 lists the problems we found. Part 20 maps every piece onto our build.

---

## Contents

1. [Page anatomy](#1-page-anatomy)
2. [Tokens](#2-tokens)
3. [The text column and gutters](#3-the-text-column-and-gutters)
4. [Full-bleed breakout](#4-full-bleed-breakout)
5. [Visibility twins (separate phone and desktop art)](#5-visibility-twins)
6. [The header](#6-the-header)
7. [Byline and body text](#7-byline-and-body-text)
8. [Two-up images](#8-two-up-images)
9. [Connector diagram](#9-connector-diagram)
10. [The scrolly core: runway, sticky stage, progress](#10-the-scrolly-core)
11. [Scene A: hard-cut slides](#11-scene-a-hard-cut-slides)
12. [Scene B: image band with fading captions](#12-scene-b-image-band-with-fading-captions)
13. [Scene C: re-arranging paintings](#13-scene-c-re-arranging-paintings)
14. [Scene D: scroll-scrubbed animation](#14-scene-d-scroll-scrubbed-animation)
15. [The JavaScript engine, line by line](#15-the-javascript-engine)
16. [Reduced motion and no-JS](#16-reduced-motion-and-no-js)
17. [Breakpoint matrix](#17-breakpoint-matrix)
18. [Motion spec](#18-motion-spec)
19. [Review: bugs and risks found](#19-review-bugs-and-risks)
20. [How we rebuild it in this project](#20-how-we-rebuild-it)
21. [Designer handoff checklist](#21-designer-handoff-checklist)

---

## 1. Page anatomy

The whole page is one `<article class="story">`. Blocks are **plain siblings** in reading order. Body paragraphs
cap themselves at the text column, and visual blocks break out of it on their own. **No layout wrapper** surrounds the text.

```
┌──────────────────────────── viewport ────────────────────────────┐
│ HEADER (.header.bleed)  675px tall, full width                   │
│   headline + italic dek, centered, fade-up intro                 │
│   art behind: desktop SVG twin / mobile SVG twin                 │
├──────────────────────────────────────────────────────────────────┤
│        byline                          ← 600px text column       │
│        p.g-text                                                  │
│        p.g-text                                                  │
│ TWO-UP (.two-up.bleed)   two images + one shared caption         │
│        p.g-text                                                  │
│ DIAGRAM (.diagram)  column on phones → 1200px stage on desktop   │
│        p.g-text                                                  │
│ ┌ RUNWAY A (6 steps) ───────────────────────────────────────────┐│
│ │ ┌ STICKY stage 100svh ──────────────────────────────────────┐ ││
│ │ │ frames swap per step (hard cut) · progress bar + markers  │ ││
│ │ └───────────────────────────────────────────────────────────┘ ││
│ │ (runway is 6 × 135svh tall, the stage stays pinned while the  ││
│ │  runway scrolls past)                                         ││
│ └───────────────────────────────────────────────────────────────┘│
│        p.g-text                                                  │
│ RUNWAY B (5 steps)  image band + fading captions                 │
│        p.g-text                                                  │
│ RUNWAY C (3 steps)  paintings re-arrange per step                │
│        p.g-text                                                  │
│ RUNWAY D (2.5 steps)  scrubbed animation: desktop twin / mobile  │
│        p.g-text                                                  │
│        credits                                                   │
└──────────────────────────────────────────────────────────────────┘
```

| Block | Class | Width behavior | Interactive? |
|-------|-------|----------------|--------------|
| Header | `.header.bleed` | Full viewport | Intro animation only |
| Byline, paragraphs, credits | `.byline`, `.g-text`, `.credits` | Text column (`--col`) | No |
| Two-up | `.two-up.bleed` | Full viewport, inner padding | No |
| Diagram | `.diagram` | Column → 1200px stage at ≥1024 | Connectors redraw on resize |
| Scrolly A–D | `.runway[data-scrolly]` | Full width, sticky stage | Scroll-driven |

---

## 2. Tokens

```css
:root {
  --gutter: clamp(10px, 12.5vw, 49px);
  --w-body: 600px;
  --col: min(calc(100% - var(--gutter) * 2), var(--w-body));
  --ease-settle: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-fade:   cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-intro:  cubic-bezier(0.25, 1, 0.5, 1);
  --serif-display: "Libre Caslon Condensed", Georgia, serif;   /* stands in for Cheltenham Condensed */
  --serif-body:    "Source Serif 4", Georgia, serif;           /* stands in for Imperial */
  --ink: #313036;  --ink-head: #333;  --bg: #fff;
  --runway-step: 135svh;
}
```

| Token | Value | For designers | For developers |
|-------|-------|---------------|----------------|
| `--gutter` | `clamp(10px, 12.5vw, 49px)` | Side margin on phones grows with the screen, then stops at 49px | 12.5vw reaches 49px at a **392px** viewport. The 10px floor only applies below 80px, so in practice it's never used |
| `--w-body` | `600px` | The longest a line of body text gets | Measured. About 70 characters at 20px serif |
| `--col` | `min(100% − 2·gutter, 600px)` | The text column | One expression gives measure and gutters. Reaches 600px at **≥698px** viewports |
| `--ease-settle` | `(0.22, 1, 0.36, 1)` | A fast start and a long, soft landing, for paintings moving into place | "easeOutQuint"-like |
| `--ease-fade` | `(0.215, 0.61, 0.355, 1)` | A gentle fade for captions | "easeOutCubic" |
| `--ease-intro` | `(0.25, 1, 0.5, 1)` | The headline's rise-in | "easeOutQuart"-like |
| `--runway-step` | `135svh` | **How much scrolling each step takes**, about 1.35 screens | The `svh` unit is the *small* viewport height, which stays stable while mobile URL bars show and hide |
| Fonts | Caslon Condensed / Source Serif 4 | Stand-ins for the Times's proprietary faces | Swap through the two variables |

---

## 3. The text column and gutters

> **For designers:** text sits in a single centered column. On phones the side margins are a fixed *proportion* of
> the screen (12.5% each side), so the text never touches the edges. From about a 700px screen up, the column is
> a fixed 600px.

**For developers:** `.g-text { width: var(--col); margin: 0 auto 12.5px; }`. Each paragraph centers itself. ✔ verified:

| Viewport | Gutter | Column (`--col`) |
|----------|--------|------------------|
| 320 | 40px | **240px** |
| 375 | 46.9px | **281px** |
| 392 | 49px (max) | 294px |
| 698 | 49px | 600px (cap reached) |
| 800 / 1024 / 1440 | 49px | **600px** |

Paragraph spacing is a measured **12.5px** bottom margin. That's tight, because the 30px line-height already does most of the separating.

---

## 4. Full-bleed breakout

```css
.bleed { position: relative; width: 100vw; left: 50%; transform: translateX(-50%); }
body   { overflow-x: clip; }
```

> **For designers:** any block can go edge to edge even though it sits in the same flow as the text. Nothing needs
> to be "outside" the article.

**For developers:**
- `left: 50%` moves the block's left edge to the parent's center, and `translateX(-50%)` pulls it back by half its own
  width (half of `100vw`), so the block is centered on the viewport whatever the parent's width.
- `100vw` **includes the scrollbar** on Windows and Linux, so it's wider than the page. `overflow-x: clip` on `body` stops
  the sideways scroll. `clip` is better than `hidden` because it doesn't create a scroll container, so `position: sticky` inside keeps working.
- ⚠ `transform` makes the element the containing block for any `position: fixed` descendants. Never put a fixed
  element inside a `.bleed`.
- The alternative we use in `layout-system.md` does the same thing without a transform: `margin-inline: calc(50% - 50vw)`.

---

## 5. Visibility twins

```css
.desktop-only { display: none; }
@media screen and (min-width: 1024px) {
  .desktop-only { display: block; }
  .mobile-only  { display: none; }
}
```

> **For designers:** for art that has to *re-compose* rather than just shrink, there are two versions: a
> **mobile artboard** (portrait, e.g. 800×1200) and a **desktop artboard** (landscape, e.g. 1800×1200). The switch is
> at **1024px**. This is the same idea as ai2html artboards.

**For developers:**
- Both twins are in the HTML. `display: none` removes the hidden twin from layout and from the accessibility tree, so
  screen readers announce only one.
- Cost: both twins download (inline SVG is part of the HTML). For raster art, use `<picture>` + `<source media>` so
  only one file downloads.
- The scroll engine skips hidden twins with `el.offsetParent === null` (§15).
- ⚠ **Bug found:** the header's twins **both display at every width** (✔ verified at 375 and 1280: both `display:
  flex`). `.header-art { display: flex }` is declared *after* `.desktop-only` / `.mobile-only` with the same
  specificity (one class), so it wins. Fix: scope the twin rules more strongly (`.header-art.mobile-only`) or
  declare the twin utilities last, in a later `@layer`. The scrub runways (D) are unaffected: ✔ only one runway shows at each width.

---

## 6. The header

```css
.header { height: 675px; margin-top: 90px; overflow: hidden; }        /* fixed, measured */
.header-copy { position: absolute; top: 12%; left: 0; right: 0; z-index: 2; text-align: center; pointer-events: none; }
.headline { max-width: 6ch; font: 700 58px/1 var(--serif-display); text-transform: uppercase; }
.subtitle { max-width: 30ch; font: italic 1.1rem/1.4 var(--serif-body); }
.header-art svg { height: 100% !important; width: auto !important; }   /* height-driven crop */
```

> **For designers:**
> - The opening screen is a **fixed 675px tall**, not "one screen tall". On a tall phone you see the start of the article
>   below it. Small phones (<360px) switch to 67% of the screen height.
> - The headline is **uppercase, condensed and stacked one word per line on phones** (`max-width: 6ch`). On desktop it gets
>   up to 12 characters per line and grows with the window.
> - **Art is cropped, never squashed.** The art fills the header's *height* and is centered, so on narrow screens its
>   sides fall off. Keep important content in the middle ~40% of the artboard.
> - The headline and dek **rise and fade in** once the fonts have loaded (0.8s, with the dek 0.2s behind).

**For developers:**

| Width | Header height | Headline | Subtitle | Copy position |
|-------|---------------|----------|----------|---------------|
| < 360 | `67vh` (✔ 429px at 320×640) | 44px | .85rem | `top: 13%` |
| 360–1023 | 675px | 58px, `max-width: 6ch` (✔ 174px wide) | 1.1rem italic | `top: 12%` |
| ≥ 1024 | 675px | `clamp(72px, 7.2vw, 96px)`, `line-height: .92`, `max-width: 12ch` (✔ 73.7px at 1024, 92.2px at 1280, 96px at 1440) | `clamp(16px, 1.4vw, 20px)` | vertically centered (`top:0; bottom:0; justify-content:center`) |
| ≥ 1024 landscape | — | — | — | byline gets `margin-bottom: 100px` |

- `.header-copy` is absolutely positioned. Its positioning context is `.header`, which only has `position: relative`
  because it also has `.bleed`. That's a hidden coupling: remove `.bleed` and the copy escapes.
- The desktop art wrapper is 80% of the width, capped at 1080px, and centered with the same left/transform trick.
- **Intro:** `document.fonts.ready.then(() => header.classList.add('is-ready'))`. Waiting for fonts means the
  headline doesn't animate in one font and then jump when the web font swaps in.
- `pointer-events: none` on the copy lets clicks reach any interactive art underneath.

---

## 7. Byline and body text

| Element | Phone (< 740) | ≥ 740 |
|---------|---------------|-------|
| `.g-text` | 18px / 27px (marked as an **assumption** in the source) | **20px / 30px** (measured, ✔) |
| `.byline` | 600 14px/1.4 system sans, `margin: 24px auto 32px` | same |

`text-wrap: pretty` is applied inside `@supports`, which evens out the rag and avoids one-word last lines.

> **For designers:** body text is **serif at 20/30** (a 1.5 ratio). Byline and captions are **sans** (system UI), which
> separates "story" from "furniture."

---

## 8. Two-up images

```css
.two-up { margin: 40px 0; padding: 0 20px; }                    /* .bleed: full viewport */
.two-up-grid { display: flex; flex-direction: column; gap: 12px; }
@media (min-width: 640px) {
  .two-up { margin: 70px 0; }
  .two-up-grid { flex-flow: row wrap; }
  .two-up-grid figure { flex: 1 1 0; }
  .group-caption { flex: 0 0 100%; line-height: 30px; }           /* caption forced onto its own row */
}
@media (min-width: 1250px) { .two-up { padding: 0 64px; max-width: 1440px; margin: 100px 0; } }
```

> **For designers:** two images stack on phones and sit side by side from 640px, with **one shared caption** under
> both. On very wide screens the pair stops growing at 1440px. Images are 4:5 portrait.

**For developers:**
- `flex: 1 1 0` (basis 0) makes the two figures exactly equal whatever their content.
- The caption is a flex item with `flex: 0 0 100%`, so `wrap` forces it onto a new line. One caption serves both images
  without a wrapper.
- ⚠ The caption is a `<figcaption>` that isn't the first or last child of a `<figure>` (its parent is a `div`). That's
  invalid HTML. Our version makes the grid a `<figure>` with two nested figures or images.

---

## 9. Connector diagram

> **For designers:** a four-step process (Idea → Draft → Revise → Ship). On phones it's a simple **stacked list of
> boxes**. On desktop (≥1024) it spreads into a **four-column stage up to 1200px wide** with **curved arrows** between
> the boxes. The curves alternate up and down.

**For developers:**
- Layout: `.diagram-inner` is a grid. One column on phones. At ≥1024, `repeat(4, 1fr)` with a 6% gap, breaking out
  to `min(100vw, 1200px)` (✔ 1024px at 1024, 1200px at 1280+).
- Connectors are an absolutely positioned `<svg>` over the grid, `display: none` on phones.
- `drawConnectors()` runs from a **ResizeObserver** on the grid. For each pair of adjacent nodes it measures
  `getBoundingClientRect()` (relative to the SVG's box) and writes:
  ```
  M x1,y1  Q mid,(y1 ± 40)  x2,y2        ← quadratic curve from right edge of node i to left edge of node i+1
  M x2−7,y2−5 L x2,y2 L x2−7,y2+5        ← arrowhead
  ```
  The lift alternates (`i % 2 ? +40 : −40`), so the arrows wave.
- Drawing from live geometry means the arrows always connect, whatever the font size or text wrapping.
- ⚠ The nodes are `div`s. A process should be an **ordered list** (`<ol>`), so screen readers announce "1 of 4."

---

## 10. The scrolly core

This is the heart of the template. **All four scroll sections share one model:**

```
document scroll ─────────────────────────────────────────────────►
            ┌──────────────── RUNWAY (height = steps × 135svh) ────────────────┐
            │┌── STICKY (top:0, height:100svh, overflow:hidden) ──┐             │
viewport →  ││  stage: frames · captions · progress bar            │  pinned    │
            │└────────────────────────────────────────────────────┘  while the  │
            │                                                     runway passes │
            └──────────────────────────────────────────────────────────────────┘
progress p = clamp( −runway.top / (runway.height − innerHeight), 0, 1 )
step       = min(steps − 1, floor(p × steps))
```

```css
.runway { position: relative; height: calc(var(--steps) * var(--runway-step)); }   /* --steps set inline per section */
.sticky { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; }
.frame  { position: absolute; inset: 0; opacity: 0; visibility: hidden; }
.frame.is-active { opacity: 1; visibility: visible; }
```

> **For designers:**
> - A scroll section is a **tall invisible track** (the runway) with **one screen pinned** to the top while you scroll
>   through it. The pinned screen changes as you go.
> - **Each step costs about 1.35 screens of scrolling.** Six steps is about 8 screens. More steps make a longer section.
>   Fewer steps make each change feel more deliberate.
> - A **progress bar** (240px wide, or 60% of a phone screen) sits at the bottom with one dot per step. It appears only while the
>   section is pinned.

**For developers, the math with real numbers** (✔ verified, runway A, 6 steps, 1280×900 viewport):

| Quantity | Formula | Value |
|----------|---------|-------|
| Runway height | 6 × 135svh = 6 × 1215 | **7290px** |
| Pinned distance (span) | runway height − innerHeight | 7290 − 900 = **6390px** |
| Scroll per step | span ÷ steps | **1065px** |
| `p` after scrolling 1000px into the runway | 1000 / 6390 | **0.1565** (✔ fill = 15.66%) |
| Step at 2000px | floor(0.313 × 6) | **1** (✔) |
| At the end | p ≥ 1 | bar hides (✔), last frame stays |

Runway heights at other sizes (✔): A is 5184px at 320×640, 6221px at 1024×768, 7290px at 1280×900. They scale with **viewport height**, not width.

**The progress bar:**
- `.progress` is absolute at the bottom center. `.progress-fill` width = `p × 100%`.
- Markers are created per step at `left: i/(n−1) × 100%`, and a marker turns "on" when `i ≤ step`.
- It hides with `.hidden` (opacity 0) when `p ≤ 0` or `p ≥ 1`, so it appears only while pinned.

**Two motion styles in one engine:**
- **Stepped** (A, B, C): only the integer `step` matters. The DOM changes only when the step changes (`if (step === r.last) continue`).
- **Scrubbed** (D): the continuous `p` drives the animation directly, every frame.

---

## 11. Scene A: hard-cut slides

> **For designers:** six full-screen "slides." Each step **cuts** instantly to the next (no crossfade), with a
> heading near the top (10% down) and a square card in the middle. Arrows point onward. On portrait screens every
> second arrow is hidden and strokes get thinner.

**For developers:**
- Card: `width: min(44.85vw, 250px)`, square (`aspect-ratio: 1`). ✔ 168px at 375, 250px from 557px up. Sized to the viewport *width*.
- Heading: `clamp(22px, 3vw, 34px)`, absolute at `top: 10vh`.
- **The arrow is configured through CSS custom properties**, which is a neat API for designers handing off positions:
  ```css
  .a-arrow { top: var(--arrow-top, 50%); left: var(--arrow-left, 100%); width: var(--arrow-length, 80px); }
  .a-arrow line { stroke-width: var(--arrow-stroke, 2); }
  @media (orientation: portrait) { .a-arrow line { stroke-width: var(--arrow-mobile-stroke, 1.5); }
                                   .a-arrow.hide-portrait { display: none; } }
  ```
  Each arrow can override its position inline (`style="--arrow-length:min(18vw,120px)"`) without new CSS.
- It switches by **orientation, not width**, because a landscape phone and a desktop share the arrow layout.

---

## 12. Scene B: image band with fading captions

> **For designers:**
> - Phones: a caption area at the top (at least 30% of the screen tall), with the image filling the rest.
> - Tablets and desktops (≥768): the pinned screen shows a **centered band 65% of the screen tall** (17.5% empty above
>   and below). The caption sits on top in up to 80px. The image fills the rest of the band.
> - Captions **fade** (0.4s) between steps. Images **cut**.

**For developers:**
```css
@media (min-width: 768px) {
  .b-wrapper { position: absolute; top: 17.5vh; bottom: 17.5vh; left: 40px; right: 40px; display: flex; flex-direction: column; }
  .b-text-overlay { min-height: min(20vh, 80px); }
  .b-content { height: calc(100% - min(20vh, 80px)); }
  .b-text { width: min(545px, 90%); font-size: 1.5rem; line-height: 1.25; }
}
```
- Every caption sits absolutely in the same spot, and only the active one has `.is-visible` (opacity 1). Stacking them avoids
  layout jumps when captions differ in length. The overlay's `min-height` must fit the longest caption.
- Everything is in **vh**, so the composition holds its proportions on any screen height.

---

## 13. Scene C: re-arranging paintings

> **For designers:** three paintings scattered on the stage. **Each step re-composes them**: they move, resize, tilt
> and change emphasis (the focus painting goes to full opacity, the others dim to 15–40%). Moves take **0.95s** with a
> soft landing. On portrait screens the paintings get **1.6× wider** (capped at 70% of the stage), because tall screens have spare height but little width.
>
> **What to hand off:** for each step, each painting's position as **percentages of the stage** (`top`, and `left`
> *or* `right`), its width %, rotation in degrees, opacity and stacking order.

**For developers:**
```js
layouts: [            // one array per step, one object per painting, all in % of the stage
  [{top:25,left:6,width:37.5,rot:0,op:.15,z:2}, {top:10,left:35,width:34,rot:0,op:.15,z:1}, {top:25,right:9,width:30,rot:1,op:.15,z:2}],
  [{top:15,left:4,width:40,rot:-3,op:1,z:3},    {top:12,left:38,width:30,rot:2,op:.4,z:1},  {top:30,right:4,width:28,rot:4,op:.4,z:2}],
  …
]
```
- `applyC(step)` writes `top/left/right/width/zIndex/opacity/transform` inline. CSS transitions on all of them, with
  `--ease-settle`, do the animation.
- Anchoring with `right` for right-side paintings keeps them pinned to the right edge as the stage width changes.
- ⚠ Performance: transitioning `top`, `left`, `right` and `width` triggers **layout on every frame**. With three images that's fine.
  With many, convert each layout to `transform: translate() scale() rotate()` (compositor-only) using a FLIP calculation.

---

## 14. Scene D: scroll-scrubbed animation

> **For designers:** the animation is **tied directly to the scroll position**. Scroll down and it plays forward,
> scroll up and it rewinds, stop and it pauses. There's a **separate desktop asset (landscape) and mobile asset
> (portrait)**. The section is 2.5 steps long (about 3.4 screens of scrolling).

**For developers:**
- Two runways (`.desktop-only` / `.mobile-only`), each with its own SVG. The engine skips the hidden one.
- `--steps: 2.5`: fractional steps just set the runway length. Scrub sections don't use `step`.
- `scrub(el, p)` maps `p` (0→1) straight to an attribute (`cx = 200 + p × 1400`). With **Lottie**, the comment
  shows the real-world version: `anim.goToAndStop(p × (anim.totalFrames − 1), true)`.
- The stage centers an SVG at 80% of the stage height (`height: 80%; width: auto`).

---

## 15. The JavaScript engine

About 130 lines, no dependencies. In order:

| # | Code | What it does | Why |
|---|------|--------------|-----|
| 1 | `const A = [...]; const B = [...]; const C = {captions, layouts, portraitScale}` | **Content as data** | Editors change data, not markup (in production this would be ArchieML) |
| 2 | `qs` / `qa` helpers | `querySelector` shorthands | Brevity |
| 3 | `buildProgress(sec, n)` | Adds `n` markers at `i/(n−1)` | Marker count always matches the data |
| 4 | `secA/B/C … innerHTML = data.map(...)` | **Builds frames and captions in the browser** | ⚠ So without JS there are no frames (§16) |
| 5 | `drawConnectors()` + `new ResizeObserver(...)` | Redraws arrows when the grid resizes | Geometry-true arrows |
| 6 | `runways = qa('.runway').map(el => ({el, kind, steps, last:-1}))` | A registry of every scroll section | One engine drives everything |
| 7 | `progressOf(el)` | `−top / (height − innerHeight)`, clamped | The core formula (§10) |
| 8 | `applyC(sec, step)` | Writes painting layouts, with the portrait scale | Scene C |
| 9 | `update()` | For each visible runway: compute `p`, update the bar, scrub D, or, **if the step changed**, toggle frames, captions and markers | Writes only when needed |
| 10 | `scrub(el, p)` | Continuous animation | Scene D |
| 11 | `onScroll` → `requestAnimationFrame(update)` with a `ticking` flag, `{ passive: true }` | **At most one update per frame**, never blocks scrolling | Standard scroll performance pattern |
| 12 | `resize` and `orientation` change → reset `last = -1` and update | Forces a re-apply after layout changes (portrait scale, twins) | Correct state after rotate |
| 13 | `document.fonts.ready.then(add 'is-ready')` | Starts the header intro | No font-swap jump |
| 14 | `applyC(secC, 0); update();` | The initial state on load | The page is correct before the first scroll |

**Read/write discipline:** each frame, `update()` reads one `getBoundingClientRect()` per runway and then writes classes
and styles. Reads and writes are grouped per runway rather than strictly batched across runways. That's acceptable with four
runways, but our version batches all reads first (§20).

---

## 16. Reduced motion and no-JS

```css
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
@media (scripting: none) {
  .runway { height: auto; }  .sticky { position: static; height: auto; }
  .frame  { position: relative; opacity: 1; visibility: visible; min-height: 60vh; }
  .headline, .subtitle { opacity: 1; transform: none; }
}
```

- **Reduced motion:** every transition is switched off, so steps still change, but instantly. Scroll-scrub (D) still
  moves, because it's driven directly by the reader's own scrolling, which is generally acceptable. Consider a static
  end frame anyway.
- **No JS, the intent:** collapse runways, un-stick stages, and show every frame stacked.
- ⚠ **What actually happens:** frames, captions and markers are created by JavaScript (§15 #4), so with JS off **the
  scroll sections are empty**. ✔ verified: no frame elements exist without JS.
- ⚠ **If JS is enabled but fails** (an error, or a blocked script), `(scripting: none)` doesn't apply. Runways stay many
  screens tall, with hidden frames: the reader scrolls through blank space.
- ⚠ Hidden frames use `visibility: hidden`, which also hides them from screen readers. Only the current frame is
  readable, and a screen-reader user moving through the text never hears the other steps.

---

## 17. Breakpoint matrix

Every threshold in the template, sorted:

| Condition | What changes |
|-----------|--------------|
| `< 360px` | Header 67vh, headline 44px, smaller subtitle |
| `< 392px` | Gutter is fluid (12.5vw). From 392 up it's 49px |
| `≥ 557px` | Scene A card reaches its 250px cap |
| `≥ 640px` | Two-up goes side by side |
| `≥ 698px` | Text column reaches 600px |
| `< 740px` | Body 18/27 (assumed). From 740 up, 20/30 |
| `≥ 768px` | Scene B switches to the 65vh centered band |
| `≥ 1024px` | **Major switch:** desktop twins, header copy centered and headline grows with `vw`, diagram becomes a 4-column stage with connectors |
| `≥ 1024px` + landscape | Byline bottom margin 100px |
| `≥ 1250px` | Two-up padding 64px, capped at 1440px |
| `orientation: portrait` | Scene A arrows thin out and every second one hides. Scene C paintings ×1.6 wider |

> These are **content-driven** breakpoints: each one exists because a specific component needed it, not to match
> device sizes. That matches the guide's "intrinsic sizing and content-driven breakpoints" principle.

---

## 18. Motion spec

| Element | Trigger | Property | Duration | Easing | Delay | Reduced motion |
|---------|---------|----------|----------|--------|-------|----------------|
| Headline | Fonts ready | opacity 0→1, translateY 15px→0 | 0.8s | `--ease-intro` | 0 | Instant |
| Subtitle | Fonts ready | opacity, translateY 10px→0 | 0.8s | `--ease-intro` | 0.2s | Instant |
| Scene A frame | Step change | visibility/opacity (**hard cut**) | 0 | — | — | Same |
| Scene B caption | Step change | opacity | 0.4s | `--ease-fade` | — | Instant |
| Scene B image | Step change | **hard cut** | 0 | — | — | Same |
| Scene C paintings | Step change | top, left, right, width, rotate, opacity | 0.95s | `--ease-settle` | — | Instant |
| Scene D | Every scroll frame | SVG attribute | Continuous (scrubbed) | Linear in `p` | — | Still scrubbed (reader-driven) |
| Progress bar | Pinned / unpinned | opacity | 0.3s | ease | — | Instant |

**Restraint:** one motion idea per scene. Cuts for slides, fades for words, settles for objects, scrub for one hero animation.

---

## 19. Review: bugs and risks

| # | Severity | Issue | Evidence | Fix in our build |
|---|----------|-------|----------|------------------|
| 1 | **High** | Scroll sections are empty without JS (frames built with `innerHTML`) | ✔ No frames in the no-JS DOM | Server-render every frame from ArchieML |
| 2 | **High** | JS failure leaves tall blank runways | Logic. `(scripting: none)` doesn't cover a failed script | Static stacked layout by default. The runway becomes sticky only after JS adds `data-enhanced` |
| 3 | **High** | Header desktop *and* mobile art both display at every width | ✔ Both `display: flex` at 375 and 1280 | Twin utilities in a later cascade layer, or `<picture>` for raster art |
| 4 | Medium | Inactive frames are hidden from screen readers | `visibility: hidden` | All step text in the DOM as an ordered list. Frames are `aria-hidden` art with real alt text |
| 5 | Medium | Font sizes in px, and the desktop headline `clamp(72px, 7.2vw, 96px)` has a px base | CSS | rem-based clamps (`layout-system.md` §2) |
| 6 | Medium | Scene C transitions layout properties | CSS | FLIP to transforms when there are more than ~5 items |
| 7 | Low | `<figcaption>` outside a `<figure>` in the two-up | HTML | Wrap the group in a `<figure>` |
| 8 | Low | Diagram nodes are `div`s, not a list | HTML | `<ol>` |
| 9 | Low | `innerHTML` from data is an XSS risk once copy comes from a CMS or doc | JS | Templates (Svelte) escape by default |
| 10 | Low | Progress uses `innerHeight` while the sticky uses `100svh`, so a slight mismatch while the mobile URL bar moves | JS vs CSS | Measure the sticky element's height instead |
| 11 | Low | `.header-copy` positioning depends on `.bleed` providing `position: relative` | CSS coupling | Explicit `position: relative` on the header |
| 12 | Info | `--gutter`'s 10px floor never applies (12.5vw > 10px above 80px) | Math | Fine as a safety value. Document it |

---

## 20. How we rebuild it

### Where each piece lives

The reference is a **full-page interactive**. At the Times this kind of page is made entirely by the graphics desk,
not the article template. So our project gets **two page types** (see `architecture.md`):

| Page type | App | Built from | Example |
|-----------|-----|-----------|---------|
| **Essay** (standard Opinion article) | `apps/story` (React SSR) | React blocks + embedded graphics | "Three Writers, One Question" |
| **Visual essay** (Birdkit-style full page) | `apps/graphics` (SvelteKit, prerendered) | Svelte blocks, including the scrolly scenes | A demo rebuild of this template |

The scrolly scenes are written once and used both ways: full-page in a visual essay, and as **embeds** inside an essay.

We build it twice: **Phase 1** by hand in one `prototype/index.html` (plain HTML/CSS/JS, one idea per chunk), and
**Phase 2** as production components. See `docs/plan/README.md`.

| Reference piece | Phase 1 chunk (plain JS) | Phase 2 component | Phase 2 chunk |
|-----------------|--------------------------|-------------------|---------------|
| Flat block list / content model | 1 | ArchieML → `VisualEssayRenderer` | 08 |
| Tokens, gutter, `--col`, eases | 2 | `packages/design-system` (`--gutter`, `--col`, `--ease-*`, `--runway-step`) | 01 |
| `.bleed` | 3 | `.bleed` utility (margin-inline version) | 01 / 08 |
| Header (fixed height, crop) | 4 | `VisualHeader.svelte` | 08 |
| Header intro | 5 | `VisualHeader.svelte` (`{@attach}` + `fonts.ready`) | 08 |
| Two-up, visibility twins | 6 | `TwoUp.svelte`, `Twin.svelte`, `ArtImage.svelte` | 08 |
| Connector diagram | 7 | `ProcessDiagram.svelte` (`<ol>` + `{@attach}` ResizeObserver) | 08 |
| Runway + sticky + progress | 8 | `Runway.svelte` + `scroll-engine.ts` | 07 |
| Scenes A, B, C | 9 | `SceneSlides`, `SceneBand`, `SceneArrange` | 07 |
| Scene D + hardening | 10 | `SceneScrub`, enhance-after-hydrate | 07 |
| Svelte port from JSON | 11 (optional) | Everything above, from ArchieML | 07–08 |

### What we keep, and what we change

| Keep (faithful to the reference) | Change (and why) |
|----------------------------------|------------------|
| Runway/sticky model, `steps × 135svh`, the progress formula | **No client-built DOM.** Every frame, caption and marker is server-rendered from ArchieML (fixes #1, #9) |
| One passive, rAF-throttled scroll handler | **IntersectionObserver gates it**: the handler runs only while a runway is in view. It does all reads first, then all writes (fixes the §15 note) |
| Stepped vs scrubbed motion styles | **Enhance-after-hydrate:** `[data-enhanced]` turns on sticky and hidden frames, so it degrades safely when JS fails (fixes #2) |
| Visibility twins at the 1024 switch | Twin rules in `@layer utilities`, declared last (fixes #3). Raster twins use `<picture>` (one download) |
| Eases, durations, hard cuts vs fades | All step text is also an `<ol>` for screen readers (fixes #4) |
| `document.fonts.ready` intro | rem-based type with `clamp()` (fixes #5) |
| `% `-of-stage layout data for Scene C | FLIP transforms behind a flag once there are more than 5 items (#6) |
| Height-driven art crop | Diatour tokens for color and type (see below) |

### Earlier rule, revised

Phase 2 chunk 07 previously said "no scroll listeners at all, IntersectionObserver only." **That rule was too strict.** An
IntersectionObserver can tell you *which* step is active, but not *how far through* the runway you are, and
the progress bar and scrubbed scenes need that continuous number. The revised rule: **IntersectionObserver decides
which runways are live. One passive, rAF-throttled handler measures only those.** That's what the reference does,
made cheaper.

### Visual system: diatour wins

| Reference | Ours |
|-----------|------|
| `--bg #fff`, `--ink #313036` | `--paper`, `--ink` from diatour (dark by default; a story can set `theme: light` in ArchieML) |
| Libre Caslon Condensed, uppercase headline | `--font-display` (Newsreader 550). Uppercase stacked headline offered as `headlineStyle: stacked-caps` |
| Source Serif 4 body 20/30 | diatour body (system sans, `--step-body`, 1.65) by default. `bodyFace: serif` is an option for visual essays (decision recorded in learning log 04) |
| `#666` / `#777` captions | `--soft` / `--faint` |

---

## 21. Designer handoff checklist

For each visual essay, the designer supplies:

**Header**
- [ ] Mobile artboard (portrait, e.g. 800×1200) and desktop artboard (landscape, e.g. 1800×1200). Key content in the middle 40%, because the sides crop.
- [ ] Headline (it stacks one word per line on phones, so check how it breaks) and a dek of about 30 characters per line.

**Each scroll scene**
- [ ] Scene type: **slides** (A), **band** (B), **arrange** (C) or **scrub** (D).
- [ ] Number of steps (each step ≈ 1.35 screens of scrolling).
- [ ] Per-step copy (caption or heading).
- [ ] Per-step art. For slides and band, one image per step. For arrange, a layout table per step (top, left or right, width %, rotation, opacity, z). For scrub, a Lottie or SVG with mobile and desktop versions.
- [ ] Motion intent: cut, fade or settle. Anything else needs a conversation.
- [ ] What the **reduced-motion and no-JS** version shows (default: every step stacked, with its caption).

**Diagrams and two-ups**
- [ ] Node labels in order. Images at 4:5 with one shared caption and credit.

**Tokens**
- [ ] Any new color, ease or spacing value gets a Figma variable with the **same name** as the CSS token.
