# Learning log 21: NYT sandbox S2: the platform shell

**Date:** 2026-10-02  **Chunk:** NYT sandbox alignment · S2  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **the story lives inside a page it doesn't own.** On the real site, a graphics-desk story is dropped into
the platform's page, which supplies the masthead, ads, comments, recirculation and footer. The story must work under a
sticky masthead and must never style anything outside itself. Until now our page was the whole document, so we'd never
tested either constraint.

## What I built

- **The mock shell** (`src/routes/+layout.svelte`):
  - a **skip link**;
  - a sticky, semi-transparent **masthead** ("Our Opinions", plus a "Mock shell · demo" note);
  - `<main id="site-content">`;
  - a **footer** saying where comments, ads and recommended stories would go.

  It styles only itself.
- **The story's root** is now `<article id="g-bk-the-second-draft" class="birdkit-body g-theme-diatour">`, named like a Birdkit embed. The id comes from the doc's `slug`, the theme class from its `theme` (S3 makes that class do something).
- **Scoping.** Story-wide rules in `app.css` (the image reset, `.bleed`, `.visually-hidden`, the twin utilities) are now scoped to the article with `:where(.birdkit-body)`.
- **One token, `--masthead-h: 44px`,** used in three places:
  - the masthead's exact height;
  - the sticky panels' `top`, with their height reduced to match (`100svh − 44px`);
  - `scroll-padding-top`, so `#anchor` jumps land below the masthead, not under it.

## The scroll math had to learn about the offset

A panel with `top: 44px` starts pinning when the runway's top reaches 44px, not 0. The old formula,
`progress = −top ÷ (runway − panel)`, would have been 44px late at the start and reached 1 early. `progressOf()` now
reads the panel's computed `top` and measures from there:

```
progress = (panel's sticky top − runway's top) ÷ (runway height − panel height)
```

It reads the CSS rather than importing a constant, so the math can't drift from the layout. With the shell off
(`top: 0`), it reduces exactly to the old formula, which parity confirms.

## Two lessons about CSS scoping

1. **Scoping can change who wins.** Prefixing `.bleed` with `.birdkit-body ` raises its specificity from one class to two, so it would silently start beating component rules it used to lose to. `:where(.birdkit-body) .bleed` adds the scope with **zero** specificity, so every rule keeps the exact weight it had. The scope is a boundary, not a power-up.
2. **Svelte's scoping fences the other direction.** The shell's styles live in `+layout.svelte`, so Svelte scopes them to the layout's own elements, and they can't reach into the story. With `:where(.birdkit-body)` on the story side, both directions are fenced.

## Keeping parity meaningful

The shell changes the page on purpose: page height grows by the masthead and footer, and every step boundary moves by
the offset. Rather than loosening parity's tolerance, `scripts/parity.js` **switches the shell off** before measuring
(`--masthead-h: 0`, masthead and footer hidden). It still answers the question it was built for, "is the story the
Phase 1 page?", and the answer is yes: everything within 1px at 375, 1024 and 1440. The shell gets its own check.

## Checkpoint (with the shell on)

| Check | 375×812 | 768×1024 | 1280×900 |
|---|---|---|---|
| Masthead height = token | 44 = 44px | 44 = 44px | 44 = 44px |
| Masthead covering a pinned panel, worst case over every step of every visible runway | **0px** | **0px** | **0px** |
| Step text or progress bar above its panel's top edge | 0px | 0px | 0px |
| Steps beginning where the new formula predicts (all runways, middle of each step) | 15/15 | 15/15 | 15/15 |
| Header copy below the masthead at load | header starts at 134px | 134px | 134px |
| Skip link: first Tab stop, and where Enter lands the story | ✅ at 44px | ✅ at 44px | ✅ at 44px |
| Horizontal scroll, console errors | none | none | none |

- **Landmarks:** the page now has `banner`, `main` and `contentinfo` landmarks (it had none), plus the skip link.
- **JS off:** the shell renders, and the story is its readable stack, with 0 hidden frames.
- **Also passing:** `npm run parity` (shell off) within 1px; `npm test`; "verified 23 media URLs".

## What broke

**The masthead wrapped at 375px.** The first screenshot showed "OUR / OPINIONS" on two lines, with the note wrapping
too, all crammed into the fixed 44px bar. The numbers hadn't caught it, because the bar's *height* was still 44px; only
looking did. The fix:
- `white-space: nowrap` on both items;
- the wordmark never shrinks;
- the note (shortened to "Mock shell · demo") truncates with an ellipsis if it must, which happens only at 320px.

Measured afterwards, each item is one 14px line at 320, 375, 768 and 1280.

## Concepts learned

- **Ownership boundaries are a CSS design problem.** Platform and story are different teams on different release schedules. A scope class plus `:where()` lets each style its own side without touching the other.
- **A sticky header changes every sticky thing below it:** `top`, available height, scroll math and anchor jumps. One token keeps all four in agreement.
- **Measure, then look.** The checks proved the geometry; a screenshot caught the wrapped wordmark.

## Next

[S3: NYT breakpoints and themes](../plan/nyt-sandbox-alignment.md#s3-nyt-breakpoints-and-themes).
