// The shared scroll engine: GSAP ScrollTrigger, as on the shipped NYT page (NYT sandbox S4).
//
//   track height = the doc's `height` (e.g. "900svh"), or steps × 135svh   (CSS, in StickyScroller.svelte)
//   progress     = ScrollTrigger's progress through the track, 0 → 1
//   step         = min(steps − 1, floor(progress × steps))
//
// ScrollTrigger only READS scroll progress. The panel is pinned by CSS `position: sticky`, not by GSAP's `pin`,
// which is what the shipped page does too (lighter: no pin-spacer elements, no inline transforms).
//
// The shipped page loads GSAP from cdnjs as a global <script>. Here it's an npm dependency pinned to the same version
// (3.12.5), loaded with a dynamic import() so it lands in its own chunk, the way lottie.js loads Lottie. If the
// chunk never arrives, nothing is enhanced and the reader keeps the readable stack.

let loading;

/** Load GSAP + ScrollTrigger once for the whole page. Resolves to ScrollTrigger. Browser only. */
export function loadScrollTrigger() {
  loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    // ScrollTrigger measures each track's start and end once, then reads only the scroll position. So when the page's
    // layout changes after that (tracks becoming tall as they enhance, web fonts reflowing text, a twin switching at
    // 740px), every trigger must re-measure. One observer for the page does it, at most once per frame.
    let queued = false;
    new ResizeObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        ScrollTrigger.refresh();
      });
    }).observe(document.body);
    return ScrollTrigger;
  });
  return loading;
}

/**
 * Where a track starts and ends, as ScrollTrigger positions. The panel pins at its CSS `top` (the masthead's height
 * since NYT sandbox S2), so the track starts when its top reaches that line. It ends when its bottom reaches the panel's
 * bottom edge. That's the viewport's bottom on most screens, but not on mobile browsers whose toolbar has collapsed
 * (the viewport is then taller than the 100svh panel), so it's measured, not assumed ('bottom bottom').
 */
export function trackBounds(sticky) {
  const pinAt = () => parseFloat(getComputedStyle(sticky).top) || 0;
  return {
    start: () => `top ${pinAt()}px`,
    end: () => `bottom ${pinAt() + sticky.offsetHeight}px`,
  };
}

/** Which step a progress value falls in. */
export function stepOf(progress, steps) {
  return Math.min(Math.ceil(steps) - 1, Math.floor(progress * steps));
}
