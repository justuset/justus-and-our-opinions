# Layout system: fluid type, rails and breakpoint choreography

This is the spec Phase 2 chunks 01 and 02 build (Phase 1 uses the reference's measured px values on purpose; see `plan/README.md`). It combines two references:

- [`reference/nyt-layout-and-fluid-css-guide.md`](reference/nyt-layout-and-fluid-css-guide.md) (the "guide"):
  the asymmetric three-track grid, the breakpoint choreography, `clamp()` math, rem-based tokens, defensive
  layout and Figma handoff.
- [`reference/diatour-nyt-analysis.md`](reference/diatour-nyt-analysis.md): the 68ch text column, full-bleed breakouts, and
  "accessible by default, restraint, performance first."

> **Treat the guide's grid as a model, not a measured spec.** It describes how an Opinion page *could* be
> organized. Before you copy its numbers, check them against a live Opinion page with DevTools (Layout panel →
> Grid overlays) and record what you find in the learning log.

---

## 1. Units: rem everywhere, px only in Figma

| Rule | Why |
|------|-----|
| Font sizes, spacing and breakpoints use **rem** or **em** | They respect the reader's browser font-size setting (WCAG 1.4.4, Resize Text) |
| Never `font-size: 4vw` on its own | Zooming doesn't change the viewport width, so pure `vw` text won't grow. Always use `rem + vw` |
| Media queries in **em** (`48em`, not `768px`) | Em queries follow the user's default font size, so layouts collapse earlier for people who use large text |
| `rem = px / 16` | The Figma value is written in the token's description, e.g. `--space-4: 1.5rem; /* 24px */` |

## 2. Fluid type with `clamp()`, and how to derive it

`clamp(MIN, INTERCEPT + SLOPE·vw, MAX)` grows linearly between two viewport widths.

```
slope (in vw)   = (maxSize − minSize) / (maxViewport − minViewport) × 100
intercept (rem) = minSize − slope/100 × minViewport        (all sizes in rem, viewports in rem)
```

**Worked example: the diatour headline.** Its source is `clamp(42px, 4.4vw + 22px, 76px)`.

| | px | rem |
|---|---|---|
| Min | 42 | 2.625 |
| Max | 76 | 4.75 |
| Intercept | 22 | 1.375 |

→ `font-size: clamp(2.625rem, 1.375rem + 4.4vw, 4.75rem);`. It stops growing at a ~455px viewport and reaches its maximum at ~1227px.

Check any clamp by plugging in widths, as the guide does (`1.375rem + 4.4vw` at 800px = 22 + 35.2 = **57.2px**).

### The fluid type scale (tokens)

| Token | Min → max (px) | Value |
|-------|----------------|-------|
| `--step-headline` | 42 → 76 | `clamp(2.625rem, 1.375rem + 4.4vw, 4.75rem)` |
| `--step-part` | 38 → 54 | `clamp(2.375rem, 1.25rem + 3vw, 3.375rem)` |
| `--step-section` | 28 → 36 | `clamp(1.75rem, 1.5rem + 1.1vw, 2.25rem)` |
| `--step-dek` | 18 → 21 | `clamp(1.125rem, 1.03rem + 0.4vw, 1.3125rem)` |
| `--step-body` | 17 → 20 | `clamp(1.0625rem, 0.98rem + 0.35vw, 1.25rem)` |
| `--step-meta` | 13 → 14.5 | `clamp(0.8125rem, 0.78rem + 0.15vw, 0.906rem)` |

Recompute exact intercepts with [utopia.fyi](https://utopia.fyi/type/calculator) (viewports 320–1440). The values above are rounded.

### The rag and the line-height budget

The guide's point: as the measure narrows, the leading must change too.

```css
.story-text p {
  font-size: var(--step-body);
  line-height: clamp(1.55, 1.45 + 0.25vw, 1.7); /* tighter on phones, airier on desktop (unitless ratios) */
  text-wrap: pretty;                            /* fewer orphans and a cleaner rag */
  hyphens: manual;                              /* editorial copy: no auto-hyphenation */
}
h1, h2, h3 { text-wrap: balance; line-height: 1.04; }
```

## 3. The asymmetric grid: three tracks, four tiers

Desktop has three functional tracks (guide §2): **left rail** (author metadata, contents), **center**
(essay body, 68ch max) and **right rail** (side notes, contextual callouts).

### Breakpoint choreography

| Tier | Width (em / px) | Left rail | Right rail | Where the moved content goes |
|------|-----------------|-----------|------------|------------------------------|
| **Desktop** | ≥ 75em / 1200px | Shown, sticky | Shown | — |
| **Laptop / landscape tablet** | 60–74.99em / 960–1199px | Shown | **Collapses** | Callouts become inline cards between paragraphs |
| **Portrait tablet** | 48–59.99em / 768–959px | **Collapses** | Collapsed | Author bio and avatar become a horizontal strip next to the headline block |
| **Phone** | < 48em / 768px | — | — | One balanced text column |

**Deviation from the guide (a decision to record):** the guide moves the author strip *above* the headline.
We put it **after the dek, before the body**, which is where readers expect a byline and how the essay skeleton
in diatour §VIII.II orders it. Revisit this if a live check of an Opinion page shows otherwise.

### Source order rule

**The HTML is written in single-column reading order.** Each callout sits right after the paragraph it relates
to. Wider tiers *move things visually* with CSS. They never reorder meaning. This keeps keyboard, screen-reader
and no-CSS order correct.

### The CSS

```html
<article class="story">
  <header class="story-header">…kicker, h1, dek…</header>
  <div class="story-body">
    <aside class="story-meta" aria-label="About the author">…avatar, bio, date, contents…</aside>
    <div class="story-text">
      <p>…</p>
      <aside class="callout">…related to the paragraph above…</aside>
      <p>…</p>
      <figure class="bleed">…</figure>
    </div>
  </div>
</article>
```

```css
@layer components {
  .story-body {
    --rail-l: minmax(10rem, 14rem);
    --rail-r: minmax(12rem, 18rem);
    --gap: var(--space-6);
    display: grid;
    grid-template-columns: [text-start] minmax(0, var(--measure)) [text-end];
    justify-content: center;
    padding-inline: var(--gutter);              /* logical properties throughout */
  }

  /* Phone + portrait tablet: meta is a horizontal strip above the text */
  .story-meta { display: flex; gap: var(--space-3); align-items: center;
                padding-block-end: var(--space-4); border-block-end: var(--rule); }

  /* Laptop (≥ 60em): left rail appears; callouts stay inline as cards */
  @media (min-width: 60em) {
    .story-body {
      grid-template-columns: [rail-l-start] var(--rail-l) [rail-l-end text-start]
                             minmax(0, var(--measure)) [text-end];
      column-gap: var(--gap);
    }
    .story-meta { display: block; border: 0; }
    .story-meta > .sticky { position: sticky; top: calc(var(--header-h) + var(--space-4)); }
  }

  /* Desktop (≥ 75em): right rail appears; callouts float into it */
  @media (min-width: 75em) {
    .story-body {
      grid-template-columns: [rail-l-start] var(--rail-l) [rail-l-end text-start]
                             minmax(0, var(--measure)) [text-end rail-r-start]
                             var(--rail-r) [rail-r-end];
    }
    .callout {
      float: inline-end;
      clear: inline-end;
      inline-size: 16rem;
      margin-inline-end: calc(-16rem - var(--gap));   /* hang it in the right rail */
    }
  }

  /* Full-bleed media at every tier */
  .story-text > .bleed { inline-size: 100vw; margin-inline: calc(50% - 50vw); }
}
html { overflow-x: clip; } /* stop 100vw from causing horizontal scroll */
```

- **Why a float for callouts?** Grid rows can't line a rail item up with "the paragraph above" without
  hard-coding rows. The float-into-margin technique (as in Tufte CSS) keeps callouts next to their paragraph
  and falls back to an inline card at narrower tiers. A stretch goal in Phase 2 chunk 04 tries **CSS anchor positioning** instead.
- **Why the sticky element sits inside the meta rail.** A sticky grid item can only stick within its grid area.
  The rail stretches the full height of `.story-body`, so its inner `.sticky` element can travel the length of the essay.

## 4. Container queries for components

Layout tiers use **media queries** (they're about the page). Components use **container queries** (they're
about their slot). The same card looks like a compact list item in a rail and like a feature in the text column:

```css
.card-slot { container: card / inline-size; }
.card { display: grid; gap: var(--space-3); }
@container card (min-width: 28rem) {
  .card { grid-template-columns: 1fr 2fr; }
  .card h3 { font-size: var(--step-section); }
}
```

## 5. Defensive layout (guide §4)

| Risk | Defense |
|------|---------|
| Media pops in and shoves text (CLS) | `width`/`height` on every `img`/`video`. `aspect-ratio` on every placeholder and embed wrapper |
| An embed's or hydrated component's height changes after hydration | The wrapper reserves space: `min-block-size` or `aspect-ratio` matching the server render |
| An expensive embed re-lays out the page | `contain: layout paint` on embed wrappers (never on a scrolly embed, because it breaks `sticky`), `content-visibility: auto` on far-below-the-fold sections, with `contain-intrinsic-size` |
| Long words or URLs break the column | `overflow-wrap: anywhere` on `.story-text a, code`. `min-width: 0` on grid children |
| Unknown content length (headlines, AI or user text) | `minmax()` tracks, `text-wrap: balance`, `line-clamp` only for previews (never for the essay) |
| Right-to-left or vertical text | Logical properties only (`margin-inline-start`, `padding-block-end`, `inset-inline-end`, `float: inline-end`) |

Lint for it: add [stylelint-use-logical](https://github.com/csstools/stylelint-use-logical) in Phase 2 chunk 11, so
`margin-left` and its relatives get flagged.

## 6. Figma → code handoff (guide §5)

```
Figma Variables (px, with rem in each description)
      │  export (Tokens Studio or the Figma Variables REST API) → tokens/*.json  (W3C Design Tokens format)
      ▼
Style Dictionary  ── transform: size/pxToRem ──►  src/styles/tokens.css  (custom properties, rem)
```

- Figma's `base-root = 16` number variable. Every size variable's description shows its rem value.
- The same names on both sides: Figma `space/4` ⇄ `--space-4`. No translation table.
- The pipeline is a **stretch task in Phase 2 chunk 01**. Start with a hand-written `tokens.css`, then automate it once the names have settled.
