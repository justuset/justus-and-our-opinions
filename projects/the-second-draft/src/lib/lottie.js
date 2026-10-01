// Lottie helper (prototype chunk 10). Motion ships as JSON data files in big_assets/videos/, not as code.
//
//   playOnce(container, path)  → header animation that plays once; resolves when its first frame is drawn (chunk 11)
//   scrubber(container, path)  → resolves to seek(p): the animation's playhead follows a 0–1 progress value
//
// lottie-web is loaded with a dynamic import, so it lands in its own chunk and only downloads when a Lottie is near
// the screen. ✅ playOnce() is used by Header.svelte, scrubber() by ScrubStage.svelte.

async function load(container, path, opts) {
  const { default: lottie } = await import('lottie-web/build/player/lottie_light.js');
  return lottie.loadAnimation({ container, renderer: 'svg', path, ...opts });
}

/** Waits until the animation has built its SVG, or rejects if the JSON can't be loaded. */
function ready(anim, path) {
  return new Promise((resolve, reject) => {
    anim.addEventListener('DOMLoaded', resolve);
    anim.addEventListener('data_failed', () => reject(new Error(`Lottie failed to load: ${path}`)));
  });
}

/** Resolves to the animation once it's drawn and playing, so the caller can swap its poster out at that moment. */
export async function playOnce(container, path) {
  const anim = await load(container, path, { loop: false, autoplay: true });
  await ready(anim, path);
  return anim;
}

/** Rejects if the JSON can't be loaded, so the caller can keep its text fallback on screen. */
export async function scrubber(container, path) {
  const anim = await load(container, path, { loop: false, autoplay: false });
  await ready(anim, path);
  const last = anim.totalFrames - 1;
  // true = the value is a frame number, not milliseconds
  const seek = (p) => anim.goToAndStop(p * last, true);
  seek.destroy = () => anim.destroy();
  return seek;
}
