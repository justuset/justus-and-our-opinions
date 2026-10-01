# Chunk 07: Svelte island, part 3: Scrollytelling

**Goal:** A reusable scroll-driven section: a sticky graphic that changes state as text steps cross the middle
of the screen. This is the signature "interactive story" pattern.

**Reference:** diatour-nyt-frontend §VIII.VI (step engine, `rootMargin: "-50% 0px -50% 0px"`, declarative states,
ResizeObserver, mobile layout), its quiz Q (why not `getBoundingClientRect()` on every scroll), and diatour-nyt
§III.III (restraint: one motion idea, everything can switch off).

## Learn first
- [Scrollama](https://github.com/russellsamora/scrollama) README (understand it, then build without it)
- [The Pudding: Responsive scrollytelling best practices](https://pudding.cool/process/responsive-scrollytelling/)
- [Mike Bostock: How to Scroll](https://bost.ocks.org/mike/scroll/)
- [Svelte: snippets](https://svelte.dev/docs/svelte/snippet) (for passing the graphic into the scroller)

## Tasks
- [ ] ArchieML block: `{.scrolly}` with a `graphic` key (which visual to use) and a `[.steps]` list (`text`, `state`).
- [ ] `src/components/svelte/Scrolly.svelte`:
  - [ ] Steps are real `<p>`s in normal flow. With no JS, the story reads top to bottom, and the graphic shows its final state once as a static figure.
  - [ ] Graphic wrapper: `position: sticky; top: 0; height: 100svh`.
  - [ ] One IntersectionObserver for all steps, using `rootMargin: "-50% 0px -50% 0px"`. Set `active = Number(el.dataset.step)`.
  - [ ] States are **declarative**: `graphicState = states[active]`. Step 3 looks the same whether you came from 2 or from 4.
  - [ ] Render the graphic through a snippet prop, so any visual (the StatChart from chunk 06, a map, an image sequence) can plug in.
  - [ ] Phones: one column, graphic full-bleed behind text cards with a solid `--paper` backing for contrast.
  - [ ] Reduced motion: jump between states without tweening.
- [ ] A demo graphic: the chart from chunk 06, highlighting one bar per step.
- [ ] Keyboard check: scrolling with Space, Page Down and arrow keys changes the state at each step, and Tab reaches any links inside the steps.

## Done when
- No scroll event listeners at all (search the code for `addEventListener('scroll'`, which should return nothing).
- Works on iOS Safari (real device or Playwright WebKit). Watch the URL bar resize, momentum scroll and `100svh`.
- Fast-flicking up and down never leaves the graphic in a mixed state.

## Concepts to write about
- Why IntersectionObserver beats measuring every scroll event
- The three ways sticky breaks (overflow on an ancestor, no `top`, a parent too short)
- Declarative vs imperative state for animations
