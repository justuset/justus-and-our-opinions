# Chunk 07: Graphic: Scrollytelling

**Goal:** The signature visual-essay pattern: a sticky graphic that changes state as text steps cross the middle of
the screen. It's built by the graphics desk and embedded full-bleed in the React story.

**Reference:** diatour-nyt-frontend §VIII.VI (step engine, `rootMargin: "-50% 0px -50% 0px"`, declarative states,
ResizeObserver, mobile layout), and its quiz on why not to call `getBoundingClientRect()` on every scroll. diatour-nyt §III.III (restraint).
**Skills:** `svelte-runes`, `svelte-template-directives` (`{@attach}`, `{@render}` snippets), `svelte-styling`.

## Learn first
- [Scrollama](https://github.com/russellsamora/scrollama) (understand it, then build without it)
- [The Pudding: responsive scrollytelling](https://pudding.cool/process/responsive-scrollytelling/), [Mike Bostock: How to Scroll](https://bost.ocks.org/mike/scroll/)
- [Svelte snippets](https://svelte.dev/docs/svelte/snippet)

## Tasks
- [ ] ArchieML: `{.graphic} graphic: scrolly`, with `visual` (which graphic to drive) and `[.steps]` (`text`, `state`).
- [ ] `Scrolly.svelte`:
  - [ ] Steps are real `<p>`s. Server render: steps in order, then the visual's final state as a static figure, which is the no-JS story.
  - [ ] Visual wrapper: `position: sticky; inset-block-start: 0; block-size: 100svh`.
  - [ ] One IntersectionObserver for all steps, attached with `{@attach}`. `active` is `$state`, and `visualState = $derived(states[active])` (declarative).
  - [ ] The visual is passed as a **snippet** (`{@render visual(visualState)}`), so StatChart, a map or an image sequence can plug in.
  - [ ] Phones (<48em): visual full-bleed, with text cards on a solid `--paper` backing.
  - [ ] Reduced motion: jump between states without tweening.
- [ ] Embed it as `bleed` in the story. The `<Embed>` wrapper must not cut off `position: sticky` (no `overflow` on ancestors; check `contain` too).
- [ ] A demo that drives StatChart, highlighting one bar per step.

## Done when
- The code has no scroll listeners.
- Works in iOS Safari or Playwright WebKit (URL bar resizing, momentum scroll, `svh`).
- Fast flicks never leave a mixed state. Space, Page Down and the arrow keys step through it correctly.

## Concepts to write about
- IntersectionObserver vs measuring on scroll
- Three ways `sticky` breaks, and the one the embed wrapper almost caused
- Snippets as "slots with arguments"
