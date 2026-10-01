# Chunk 04: Vanilla JavaScript enhancements

**Goal:** Add the small behaviors every story gets, in **plain JavaScript**, with no framework. Each one must be
progressive: the page from chunk 02 still works if the script never runs.

**Reference:** diatour-nyt §VIII.V (event loop, delegation, observers, rAF), §VIII.IV (popover, dialog, view
transitions, Custom Highlight API), and the diatour artifacts' own TOC drawer and read-progress dots.

## Learn first
- [What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ) (talk)
- [MDN: IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Astro: scripts and event handling](https://docs.astro.build/en/guides/client-side-scripts/)

## Tasks
- [ ] `src/lib/motion.ts`: `prefersReducedMotion()` plus a `matchMedia` change listener. Every animation in the project imports this.
- [ ] **Reading progress bar:** a thin top bar, scroll handler throttled with `requestAnimationFrame`, `{ passive: true }`. Decorative, so `aria-hidden`. It tracks position rather than animating, so it stays on under reduced motion. Note that decision in the log.
- [ ] **TOC drawer:** `details`/`summary` built from the story's `h2`s at build time. The script marks the current section (IntersectionObserver) and adds a "read" dot (saved in `localStorage` inside try/catch).
- [ ] **Share:** `navigator.share` when it's available. Otherwise copy the link to the clipboard and announce "Link copied" in an `aria-live="polite"` region.
- [ ] **Method note:** a "How we did this" `popover` button. No JS needed, just the feature.
- [ ] **Footnotes:** anchor links with `:target` styling. Then try [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) for side notes on wide screens, with plain footnotes as the fallback.
- [ ] Wire each behavior as `<script>` inside its Astro component (Astro bundles and dedupes it).

## Done when
- Disabling JavaScript (DevTools → Run command → "Disable JavaScript") leaves a fully readable page with working anchor links.
- The Performance panel shows no long tasks (over 50ms) while scrolling.
- Share works on a phone (native sheet) and on desktop (copy + announcement read by VoiceOver/NVDA).

## Concepts to write about
- Event delegation with `closest()`
- Why `requestAnimationFrame` beats `setInterval` for visual updates
- What "progressive enhancement" bought you when the script failed
