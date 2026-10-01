// The shared scroll engine (prototype chunk 8). One engine, many scroll sections.
//
//   runway height = steps × 135svh   (CSS: --steps × --runway-step)
//   progress      = scrolled into the runway ÷ (runway height − sticky panel height), clamped 0..1
//   step          = min(steps − 1, floor(progress × steps))
//
// STATUS: the math is here so components can import it; Scrolly.svelte wires it up when prototype chunk 8 passes.

/** How far through a runway the reader is, 0 → 1. Divides by the sticky panel's height, not innerHeight (breakdown §19 #10). */
export function progressOf(runway, sticky = runway.firstElementChild) {
  const r = runway.getBoundingClientRect();
  const span = r.height - (sticky?.getBoundingClientRect().height ?? window.innerHeight);
  return span <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / span));
}

/** Which step a progress value falls in. */
export function stepOf(progress, steps) {
  return Math.min(Math.ceil(steps) - 1, Math.floor(progress * steps));
}

/** Call `fn` at most once per animation frame while the page scrolls or resizes. Returns an unsubscribe function. */
export function onScrollFrame(fn) {
  let queued = false;
  const tick = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(); });
  };
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  tick();
  return () => { removeEventListener('scroll', tick); removeEventListener('resize', tick); };
}
