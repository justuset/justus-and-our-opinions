// Tiny helpers for writing Lottie JSON by hand (used by make-scrub-lottie.js and make-hero-lottie.js).
//
// A Lottie file is: { w, h (canvas), fr (frame rate), ip/op (first/last frame), layers: [...] }.
// Every animatable property is either still, { a: 0, k: value }, or keyframed, { a: 1, k: [{ t, s, i, o }, …] }:
//   t = frame, s = value at that frame, i/o = the bezier easing into and out of it (like a CSS cubic-bezier).
// Layers are drawn top-down: the FIRST layer in the array is on top.

export const EASE_SETTLE = { i: { x: [0.22], y: [1] }, o: { x: [0.5], y: [0] } }; // close to --ease-settle

export const still = (k) => ({ a: 0, k });

/** A keyframed property from [[frame, value], …]. The last keyframe takes no easing. */
export const animated = (keys, ease = EASE_SETTLE) => ({
  a: 1,
  k: keys.map(([t, s], n) => (n < keys.length - 1 ? { t, s, ...ease } : { t, s }))
});

/** Colors are 0–1 RGBA. The alpha is ignored for fills and strokes: opacity is a separate 0–100 value. */
export const WHITE = [1, 1, 1, 1];
export const INK = [0.93, 0.93, 0.92, 1]; // diatour --ink, #ededeb

export const rect = (w, h, r = 0, p = [0, 0]) => ({ ty: 'rc', d: 1, p: still(p), s: still([w, h]), r: still(r) });
export const ellipse = (d, p = [0, 0]) => ({ ty: 'el', d: 1, p: still(p), s: still([d, d]) });
/** A straight open path from (0,0) to (w,0). */
export const hline = (w) => ({
  ty: 'sh', d: 1, ks: still({ i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], v: [[0, 0], [w, 0]], c: false })
});
export const fill = (color, opacity = 100) => ({ ty: 'fl', c: still(color), o: still(opacity), r: 1 });
/** lc/lj 2 = round caps and joins. */
export const stroke = (color, width, opacity = 100) => ({ ty: 'st', c: still(color), o: still(opacity), w: still(width), lc: 2, lj: 2 });

/** One shape layer. `ks` is its transform: a (anchor), p (position), r (rotation °), s (scale %), o (opacity 0–100). */
export function layer(ind, name, frames, ks, items) {
  return {
    ddd: 0, ind, ty: 4, nm: name, sr: 1, ao: 0, ip: 0, op: frames, st: 0, bm: 0,
    ks: { a: still([0, 0, 0]), p: still([0, 0, 0]), r: still(0), s: still([100, 100, 100]), o: still(100), ...ks },
    shapes: [{
      ty: 'gr', nm: name,
      it: [...items, { ty: 'tr', p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100) }]
    }]
  };
}

export const file = (name, w, h, frames, layers) => ({ v: '5.7.4', fr: 30, ip: 0, op: frames, w, h, nm: name, ddd: 0, assets: [], layers });
