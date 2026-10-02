# Learning log 24: NYT sandbox S4: `StickyScroller` on ScrollTrigger

**Date:** 2026-10-02  **Chunk:** NYT sandbox alignment · S4  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **use the industry-standard scroll library, behind our own contract.**

The owner checked "In Defense of the Detour" directly. Its scroll sections are custom Svelte components on **GSAP 3.12.5 +
ScrollTrigger**, with no Scrollama or other scrolly library:

- a tall track (900vh, 960svh, 500svh) holds a `position: sticky` panel;
- ScrollTrigger only *reports* how far through the track the reader is;
- the component uses that number to switch frames, fill the bar with `scaleX` and scrub Lottie.

That's the same shape as our chunk 8 engine. So S4 swaps the engine under the hood, and the scenes don't change.

## What I built

### `Scrolly.svelte` → `StickyScroller.svelte`

The blueprint's name (§7.3). The scenes still receive `{ step, progress, enhanced }` through a snippet, so
`SlidesScrolly`, `CaptionScrolly`, `PaintingsScrolly` and `ScrubLottie` changed only their import and one new prop.

```js
function engine(runway) {
  const sticky = runway.querySelector('.sticky');
  let trigger;
  let destroyed = false;
  loadScrollTrigger()
    .then(async (ScrollTrigger) => {
      if (destroyed) return;
      enhanced = true;
      await tick(); // let Svelte write data-enhanced first
      if (destroyed) return;
      const read = (self) => {
        if (runway.offsetParent === null) return; // a hidden twin
        progress = self.progress;
      };
      trigger = ScrollTrigger.create({ trigger: runway, ...trackBounds(sticky), onUpdate: read, onRefresh: read });
    })
    .catch(() => {}); // GSAP didn't load: the readable stack stays
  return () => { destroyed = true; trigger?.kill(); enhanced = false; };
}
```

Four details carry the weight here:

1. **`enhanced` waits for GSAP.** The tall track and sticky panel only apply once the library has loaded, so a blocked or failed download leaves the no-JS stack, not a tall empty track.
2. **`await tick()`** before measuring. Setting `enhanced` doesn't touch the DOM immediately: Svelte batches updates. Without the `tick()`, ScrollTrigger would measure the short stack and get every start and end wrong.
3. **`onRefresh` as well as `onUpdate`.** `onUpdate` only fires when progress changes during a scroll. A page opened halfway down needs the value at the moment the trigger is measured, and `onRefresh` gives it.
4. **`step` is now `$derived`** from `progress` instead of being assigned next to it: derived state over stored state.

### `scroll.js`: load once, measure right

```js
export function loadScrollTrigger() {
  loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    new ResizeObserver(/* at most once per frame: */ () => ScrollTrigger.refresh()).observe(document.body);
    return ScrollTrigger;
  });
  return loading;
}
```

- **One promise for the page.** Five tracks call it, but GSAP downloads once.
- **A dynamic `import()`**, so GSAP isn't on the server and isn't in the first bundle. It builds into two chunks: gsap at 70 KB and ScrollTrigger at 43 KB, or 28 + 18 KB gzipped.
- **The `ResizeObserver` is the important new idea.**
  - The old engine measured every runway on every frame, which was simple but cost a layout per frame.
  - ScrollTrigger measures each track's start and end once, then reads only `scrollY`. That's why it's cheap.
  - The catch: if the page's layout changes later (tracks growing as they enhance, web fonts reflowing text, the scrub twin switching at 740px), its numbers go stale. One observer on `<body>` re-measures every trigger when the page's size changes.

### Where a track starts and ends

The blueprint uses `start: 'top top', end: 'bottom bottom'`. Neither is right for this page:

- **Start.** Since S2 the panel pins at the masthead's height (44px), not at 0. So the track starts when its top reaches *that* line: `top 44px`, read from the panel's computed `top`.
- **End.** The panel stops pinning when the track's bottom reaches the **panel's** bottom edge. That's the viewport's bottom on desktop. On a phone whose toolbar has collapsed, the viewport is taller than the `100svh` panel, so `'bottom bottom'` would end the track late, and the last step would never quite finish.

```js
export function trackBounds(sticky) {
  const pinAt = () => parseFloat(getComputedStyle(sticky).top) || 0;
  return {
    start: () => `top ${pinAt()}px`,
    end: () => `bottom ${pinAt() + sticky.offsetHeight}px`,
  };
}
```

Functions instead of strings, so every `refresh()` re-reads them. This is exactly the chunk 8 formula,
`progress = (pin line − track top) ÷ (track height − panel height)`, written in ScrollTrigger's terms.

### Track height from the doc

Each scene takes an optional `height` (e.g. `"900svh"`, like the shipped page). Without one, the track keeps
`steps × 135svh`:

```css
.runway[data-enhanced] { height: var(--track-h, calc(var(--steps) * var(--runway-step))); }
```

`style:--track-h={height}` writes nothing when `height` is undefined, so the `var()` fallback applies.

### The progress bar, without layout

| Before | After |
|---|---|
| `style:width="{progress * 100}%"` | `style:transform="scaleX({progress})"` with `transform-origin: left` |
| Marker *i* at `i / (steps − 1)` | Marker *i* at `i / steps` |

- **Changing `width` makes the browser lay the box out again** on every frame. `transform` is applied by the compositor after layout, so it costs no layout.
- **The old markers were in the wrong place.** Step *i* begins at progress `i / steps`, but marker *i* sat at `i / (steps − 1)`, a little further right. It lit up before the fill reached it. At `i / steps` it lights exactly as the fill arrives. This is also the blueprint's formula (§9).

## Checkpoint

| Check | Result |
|---|---|
| Step changes every `(height − panel) / steps` | With `"height": "900svh"` on section A (tried in a scratch build): track 8100px, step changes at each boundary ±3px |
| Bar hidden at 0 and 1 | Yes, on all three barred tracks, 2px before and after each |
| Jump to bottom / back to top | Every track reads 1, then 0 |
| Page opened mid-scroll | Progress matches the scroll position on every track |
| Layout from the bar | **0 layouts** while scrolling inside one step, vs 50 with the old engine (below) |
| `npm run parity` | Within 1px at 375 / 1024 / 1440, **step offsets unchanged** |
| GSAP blocked | Nothing enhanced, all text readable |
| JS off | All text renders at 375 / 740 / 1150 |
| Resize 1280 → 375 | The mobile scrub twin takes over and follows scroll |
| `npm test` | 7 pass, including the new `stepOf` tests |

**Measuring "no layout".** Chrome counts layouts and style recalculations (`Performance.getMetrics` over the DevTools
protocol). I scrolled 40 small steps inside one step of track A, then did the same over plain text as a control:

| | Layouts | Style recalcs |
|---|---|---|
| Control (plain text) | 46 | 46 |
| Old engine, `width` bar | 96 (**+50**) | 96 (+50) |
| ScrollTrigger, `scaleX` bar | 46 (**+0**) | 85 (+39) |

The remaining style recalcs come from the inline `transform` value changing. That's cheap, and needs no layout or
paint of anything else.

**Why parity didn't move.** The plan expected new step offsets. But `trackBounds` reproduces the old formula exactly,
and no section sets `height` yet, so the pacing is identical. That's the point of "swap the engine, keep the contract."
If a section gets a `height` later, parity will show the change at once.

## Deviations from the shipped page

- **GSAP from npm, not cdnjs.** Same version (3.12.5), pinned in the lockfile, and loaded only when needed. The shipped page uses a `<script>` tag and a global `gsap`; ours has no global.
- **`start` and `end` aren't `'top top'` / `'bottom bottom'`.** The reasons are above: the masthead, and the collapsed-toolbar case.
- **License.** GSAP is free but not MIT. It's noted in the README's new "Third-party licenses" section.

## Concepts learned

- **Measure once, read cheap, refresh on change.** That's ScrollTrigger's whole performance model, and it's why a `ResizeObserver` matters more than it looks.
- **Svelte batches DOM updates.** After setting state, `await tick()` before measuring anything it affects.
- **Composited properties** (`transform`, `opacity`) skip layout. Animate those, never `width`, `top` or `left`.
- **`svh` versus the real viewport.** A panel sized in `svh` can be shorter than `innerHeight`, so measure the panel instead of assuming the viewport.
- **Swap the engine, keep the contract.** Because scenes only ever saw `{ step, progress }`, a whole library change touched one component.

## Next

[S5: the real component set](../plan/nyt-sandbox-alignment.md#s5-the-real-component-set): renaming and reshaping
the components to the shipped page's names and props.
