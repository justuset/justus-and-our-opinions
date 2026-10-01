// Lottie helper (prototype chunk 10). Motion ships as JSON data files in big_assets/videos/, not as code.
//
//   playOnce(container, path)  → header animation that plays once
//   scrubber(container, path)  → returns setProgress(p): the animation's playhead follows the scroll position
//
// lottie-web is loaded with a dynamic import, so it lands in its own chunk and only downloads when a Lottie is on screen.
// STATUS: wired up by ScrubLottie.svelte when prototype chunk 10 passes.

async function load(container, path, opts) {
  const { default: lottie } = await import('lottie-web/build/player/lottie_light.js');
  return lottie.loadAnimation({ container, renderer: 'svg', path, ...opts });
}

export async function playOnce(container, path) {
  return load(container, path, { loop: false, autoplay: true });
}

export async function scrubber(container, path) {
  const anim = await load(container, path, { loop: false, autoplay: false });
  await new Promise((resolve) => anim.addEventListener('DOMLoaded', resolve));
  // true = the value is a frame number, not milliseconds
  return (p) => anim.goToAndStop(p * (anim.totalFrames - 1), true);
}
