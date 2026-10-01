# Chunk 9: The three scroll sections

**One new idea:** **separate the engine from what each step renders.** The chunk 8 engine stays untouched. Each
section only supplies "what happens on step *n*." Viewport units make layouts that pin to the screen hold their proportions.

**Reference:** breakdown §11 (A), §12 (B), §13 (C), §15 #8–9, §18 (motion spec).

## Build
Refactor `update()` so each runway gets a renderer: `renderers = { a: renderA, b: renderB, c: renderC }`, called **only when
`step !== r.last`**.

### A: hard-cut slides (`--steps: 6`)
- [ ] Write the six frames **in HTML**. The reference builds them with `innerHTML`, so they vanish without JS (breakdown §19 #1).
  ```html
  <div class="frame"><h3 class="a-heading">Slide 1</h3><div class="a-card">One <svg class="a-arrow">…</svg></div></div>
  ```
- [ ] `.frame { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0; visibility: hidden; }`, and `.is-active` makes it visible. It's a **hard cut**, with no transition.
- [ ] Card `width: min(44.85vw, 250px); aspect-ratio: 1`. Heading absolute at `top: 10vh`, `clamp(22px, 3vw, 34px)`.
- [ ] Arrows configured by CSS variables: `top: var(--arrow-top, 50%); left: var(--arrow-left, 100%); width: var(--arrow-length, 80px)`,
      stroke `var(--arrow-stroke, 2)`. `@media (orientation: portrait)`: stroke `var(--arrow-mobile-stroke, 1.5)`, and `.hide-portrait` arrows hidden.
- [ ] `renderA(el, step)`: toggle `.is-active` on frame `step`.

### B: image band with fading captions (`--steps: 5`)
- [ ] Captions stacked in one overlay (`.b-text`, absolutely positioned on top of each other, `opacity 0` → `.is-visible`, `transition: opacity .4s var(--ease-fade)`).
- [ ] Image frames hard-cut, like A.
- [ ] Phones: caption area `min-height: 30vh`, with the image filling the rest.
- [ ] `≥ 768px`: `.b-wrapper { position: absolute; top: 17.5vh; bottom: 17.5vh; left: 40px; right: 40px; }`, which makes a **65vh band**.
      Caption overlay `min-height: min(20vh, 80px)`, text `width: min(545px, 90%); font-size: 1.5rem`.

### C: re-arranging paintings (`--steps: 3`)
- [ ] Three `.c-painting`s in a `.c-stage` (`position: absolute; inset: 0`). Layout data per step, in **% of the stage**:
  ```js
  const C = [ [{top:25,left:6,width:37.5,rot:0,op:.15,z:2}, …], … ];   // copy the reference's three steps
  ```
- [ ] `renderC(el, step)`: write `top`, `left` *or* `right`, `width`, `zIndex`, `opacity` and `transform: rotate()` inline. On portrait screens, `width × 1.6` (max 70%).
- [ ] CSS transitions all of them over `.95s var(--ease-settle)`.
- [ ] A caption (`.c-caption`, top `6vh`) updated with `textContent` per step.
- [ ] Re-apply on `matchMedia('(orientation: portrait)')` change (reset `last = -1`).

## Learn
- The engine knows nothing about slides, captions or paintings. Adding scene D in chunk 10 means **no engine changes**.
- `vh` positions (17.5vh insets, 10vh headings) keep the composition proportional on any screen height. `%` of the stage keeps C's layouts proportional on any screen.
- Hard cut vs fade vs settle: one motion idea per scene (breakdown §18).

## Checkpoint
- [ ] A, B and C work in **portrait and landscape** (rotate in responsive mode) and at **768 and 1024px**.
- [ ] Each step change happens **exactly once**: add `console.count('step')` in each renderer, scroll through slowly, and check the count equals the step count.
- [ ] **No flicker**: Animations panel at 10%, and Performance monitor (layouts/sec) stays low while scrolling *within* a step.
- [ ] Reduced motion emulated: B's captions and C's paintings change instantly.

## Watch out
- C animates `top`/`left`/`width`, which costs layout on every frame. That's fine for three items. Phase 2 switches to FLIP transforms for more (breakdown §19 #6).
- Inactive frames with `visibility: hidden` are hidden from screen readers too. Add a visually hidden `<ol>` with every step's text at the top of each runway (breakdown §19 #4).

## Port (after the checkpoint passes)
Into `projects/the-second-draft/`: `SlidesScrolly.svelte`, `CaptionScrolly.svelte`, `PaintingsScrolly.svelte`: each scene's rules, plus its reaction to `step` (all three already receive it from `Scrolly`). Rebuild with `npm run build`, check JS on and off, and mark the component ✅ (see [`docs/project-structure.md`](../../project-structure.md) §11).
