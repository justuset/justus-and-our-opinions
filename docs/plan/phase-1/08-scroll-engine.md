# Chunk 8: The scroll engine, built once

**One new idea:** the **runway / sticky** pattern, the core of the whole page. A tall runway scrolls past while a
screen-sized panel stays pinned.

```
progress = how far you've scrolled into the runway ÷ (runway height − viewport height)
step     = floor(progress × steps)
```

**Reference:** breakdown §10 (the math, with verified numbers) and §15 #6–7, #11.

## Build
- [ ] CSS:
  ```css
  :root { --runway-step: 135svh; }
  .runway { position: relative; height: calc(var(--steps) * var(--runway-step)); }
  .sticky { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; }
  ```
- [ ] Turn the `scrolly-a` placeholder into `<section class="runway" data-scrolly="a" style="--steps: 6"><div class="sticky">…</div></section>`.
      Give the sticky a visible test background for now.
- [ ] JS:
  ```js
  function progressOf(el) {
    const r = el.getBoundingClientRect();
    const span = r.height - window.innerHeight;     // the distance the panel stays pinned
    return Math.min(1, Math.max(0, -r.top / span));
  }
  const runways = [...document.querySelectorAll('.runway')].map(el => ({
    el, steps: parseFloat(getComputedStyle(el).getPropertyValue('--steps')), last: -1 }));

  let ticking = false;
  function update() {
    ticking = false;
    for (const r of runways) {
      if (r.el.offsetParent === null) continue;      // hidden twin, skip it
      const p = progressOf(r.el);
      const step = Math.min(Math.ceil(r.steps) - 1, Math.floor(p * r.steps));
      console.log(r.el.dataset.scrolly, p.toFixed(3), step);
      // chunk 9: render the step here, only when step !== r.last
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', () => { runways.forEach(r => r.last = -1); update(); });
  update();
  ```
- [ ] Progress bar inside each sticky: `.progress` (absolute, bottom 24px, centered, `width: min(240px, 60vw)`, 3px tall, `--line` background)
      → `.progress-fill` (width `p × 100%`, `--ink`). Plus **one marker per step** at `left: i/(n−1) × 100%`, turned on when `i ≤ step`.
- [ ] Hide the bar when `p ≤ 0 || p ≥ 1` (`.hidden { opacity: 0 }`, `transition: opacity .3s`).
- [ ] Build markers in HTML (write the six `<span class="progress-marker">` by hand) rather than in JS, so the structure exists without scripting.

## Learn
- Why the panel sticks: `sticky; top: 0` inside a parent much taller than the screen. It's pinned until the parent's bottom edge arrives.
- **Work the numbers** at 1280×900 (breakdown §10): runway = 6 × 135svh = **7290px**. The pinned span = 7290 − 900 = **6390px**, so
  **1065px of scrolling per step**.
- The rAF throttle: scroll events can fire many times per frame. The `ticking` flag means at most one `update()` per frame.
  `{ passive: true }` promises you won't call `preventDefault`, so scrolling never waits on you.
- `svh` vs `vh`: on phones `100vh` includes the area behind the URL bar, while `svh` is the smallest visible height and doesn't jump.

## Checkpoint
- [ ] The console logs progress climbing **0 → 1** and the step **0 → 5** as you scroll through runway A.
- [ ] At 1280×900, the step changes at about every **1065px** of scroll (use `scrollTo(0, …)` in the console to test exact offsets).
- [ ] The progress bar fills smoothly, markers light up one at a time, and the bar **hides** before and after the runway.
- [ ] Performance panel, a 5s scroll recording: no long tasks, and `update` runs at most once per frame.

## Watch out
- An ancestor with `overflow: hidden | auto` breaks `sticky` (that's why chunk 3 used `clip`).
- The reference divides by `innerHeight` while the panel is `100svh`. On phones with a moving URL bar they differ slightly
  (breakdown §19 #10). Try measuring the `.sticky` element's height instead and note the difference.

## Port (after the checkpoint passes)
Into `projects/the-second-draft/`: `src/lib/scroll.js` (already holds `progressOf`, `stepOf`, `onScrollFrame`) and `src/lib/components/Scrolly.svelte`: an `{@attach}` registers the runway, sets `step`/`progress`, and adds `data-enhanced`. The tall-runway and sticky rules apply only under `[data-enhanced]`. Add the progress bar and markers. Rebuild with `npm run build`, check JS on and off, and mark the component ✅ (see [`docs/project-structure.md`](../../project-structure.md) §11).
