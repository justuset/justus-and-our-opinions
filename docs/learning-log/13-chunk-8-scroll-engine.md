# Learning log 13: Phase 1, chunk 8: The scroll engine

**Date:** 2026-10-01  **Chunk:** Phase 1 · 8  **Branch:** `claude/wonderful-knuth-w43l2c`

> **Later changes (as of 2026-10-02):** In the story project, panels now pin **below the platform masthead** (`top: var(--masthead-h)`), and `progressOf()` measures from the panel's CSS `top` instead of 0 (S2, [log 21](21-s2-platform-shell.md)). Chunk S4 of the [alignment plan](../plan/nyt-sandbox-alignment.md) will move the engine onto GSAP ScrollTrigger behind the same `{ step, progress }` contract. The prototype is unchanged.

## Goal

One new idea: the **runway / sticky** pattern. A tall section (the runway) scrolls past while its first panel stays pinned to the screen. How far you are through the runway becomes a number from 0 to 1 (progress), and that number becomes a step.

```
runway height = steps × 135svh
progress      = how far the runway's top has gone above the screen ÷ (runway height − panel height)
step          = min(steps − 1, floor(progress × steps))
```

## What I did (prototype)

- **Tokens:** `--runway-step: 135svh`, plus the progress bar's size tokens (`--progress-w`, `--progress-bottom`, `--marker`).
- **CSS, section 9:** `.runway { height: calc(var(--steps) * var(--runway-step)) }` and `.sticky { position: sticky; top: 0; height: 100svh; overflow: hidden }`, with `100vh` as a fallback on the line before.
- **Markup:** the `scrolly-a` placeholder became a runway with `style="--steps: 6"`. Inside it:
  - a sticky panel with a grey test background and a live readout of the progress and step;
  - a progress bar with **six hand-written markers** (`left: 0%, 20% … 100%`). Because they're in the HTML, the structure exists without any script.
- **JS:** `progressOf()`, `stepOf()`, a registry of runways (each one's `--steps` is read from CSS), and one `update()`:
  - **Every frame:** set the fill width, and hide the bar when `p ≤ 0` or `p ≥ 1`.
  - **Only when the step changes:** light the markers and log the step. Chunk 9's scene rendering will go here too.
- **Throttle:** a passive scroll listener queues `requestAnimationFrame(update)` only if one isn't already queued (the `ticking` flag).

## The "Watch out" fix: divide by the panel, not the window

The reference computes `span = runway height − innerHeight`, but its panel is `100svh` tall. On a phone, `innerHeight` grows when the URL bar slides away, but `svh` doesn't, so the two numbers disagree and progress drifts (breakdown §19 #10). Here `span = runway height − sticky.offsetHeight`. The panel being pinned is what we're measuring, so it's the panel's height that counts.

## Checkpoint results (prototype at 1280×900)

| Measure | Expected | Got |
|---|---|---|
| Runway height | 6 × 135svh = 7290px | **7290px** |
| Pinned span | 7290 − 900 = 6390px | **6390px** |
| Step boundaries (scanned in 5px steps) | every 1065px | at 1065, 2130, 3195, 4260 and 5325px (±5px scan) |
| Progress bar | hidden before and after | hidden at −200px, shown from 0, hidden again at 6390px |
| Panel while inside the runway | pinned | `top: 0` throughout |
| 50 scroll events fired inside one frame | ≤ 1 update | **1** update |
| Horizontal scroll | none | none |
| Nu HTML Checker | no errors | no errors |

The console logs `runway a: step 0 … step 5`, one line per change. I checked "at most once per frame" with a counter rather than a Performance-panel recording. The counter is the more direct test, and the Performance panel shows the same thing as one `update` per frame.

## Port

- **`scroll.js`:** the math was already there. One fix: `progressOf`'s default panel was `runway.firstElementChild`, but in the component the first child is the **visually hidden step list**, not the sticky. The default is now `runway.querySelector('.sticky')`, and the component passes the panel in explicitly anyway.
- **`Scrolly.svelte`:** an `{@attach engine}` calls `onScrollFrame()`, writes `progress` and `step` into `$state`, and returns the unsubscribe function as its cleanup. Other values are **derived**, not stored: `barHidden = $derived(progress <= 0 || progress >= 1)`. The markers are rendered with `{#each { length: steps }}`, so they're in the server HTML.
- **Two states:**
  - Server and no JS: a readable stack. The runway isn't tall, the panel isn't sticky, and the bar is `display: none`.
  - Enhanced: once the attachment runs, `data-enhanced` is set, and only `[data-enhanced]` gets the tall runway, the pinned panel and the bar.

**Built project, same 1280×900 test:** runway 7290px; steps at exactly **1065 / 2130 / 3195 / 4260 / 5325px**; panel pinned at `top: 0`; bar hidden outside the runway; no horizontal scroll. With JS off, all four runways are short stacks with the bar hidden and the markers still in the HTML.

## What broke and how I fixed it

**Svelte deleted my CSS.** The first port set the attribute with `runway.dataset.enhanced = ''` inside the attachment, and every `[data-enhanced]` rule silently did nothing (the runway was 6651px of stacked content, not 7290px). The cause: Svelte **prunes scoped selectors that match nothing in the template**. `data-enhanced` only appeared at runtime, so as far as the compiler could tell, `.runway[data-enhanced]` matched nothing and was removed. The fix is the Svelte way anyway: `let enhanced = $state(false)`, set it to `true` in the attachment, and write `data-enhanced={enhanced || undefined}` in the markup. (`undefined` removes the attribute.) The compiler now sees the attribute and keeps the rules.

## Concepts learned

- **Why the panel sticks:** `position: sticky; top: 0` pins an element inside its parent until the parent's bottom edge arrives. A tall parent means a long pin. Any ancestor with `overflow: hidden` or `auto` breaks it, which is why chunk 3 used `overflow-x: clip`.
- **rAF throttling:** scroll events can fire several times per frame, but the screen only repaints once. Queuing one `requestAnimationFrame` per frame does the work exactly as often as it can be seen.
- **`{ passive: true }`** promises the listener won't call `preventDefault()`, so the browser can scroll without waiting for JavaScript.
- **`svh` vs `vh`:** `100vh` on phones includes the area behind the URL bar; `100svh` is the smallest visible height and doesn't change as the bar moves.
- **Cheap work every frame, expensive work on change:** a width is cheap to set every frame; re-rendering a scene isn't. The `last` step guard (in Svelte, the fact that `$state` only re-renders when its value changes) keeps the heavy part rare.
- **Prototype vs component:** the prototype runs one listener for all runways. In the project, each `Scrolly` registers its own `onScrollFrame`, so four runways queue four callbacks per frame (measured: 4 for 50 events). Each is tiny, and the component stays self-contained. If a page ever had dozens of sections, a shared registry in `scroll.js` would be the next step.

## Next

[Chunk 9: the three scroll sections](../plan/phase-1/09-three-scroll-sections.md).
