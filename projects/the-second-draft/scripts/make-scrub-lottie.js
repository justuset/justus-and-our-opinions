// Writes the two scene D animations: a long draft condensing into a short final paragraph.
//
//   node scripts/make-scrub-lottie.js   → big_assets/videos/scrub-desktop.json (1800×1200, landscape)
//                                          big_assets/videos/scrub-mobile.json  (800×1200, portrait)
//
// These are placeholders we author ourselves, so there's no third-party license to record. In a real project the
// files come from After Effects via Bodymovin, and this script is just a readable example of what a Lottie file
// contains: a canvas size, a frame range, and layers whose properties have keyframes.
//
// The animation (60 frames, 30fps, meant to be scrubbed rather than played):
//   - A page holds 12 lines of "text" (rounded bars).
//   - Lines that get cut shrink to zero width and fade, a few at a time (staggered), from frame 6 to frame 40.
//   - The surviving 5 lines slide up to close the gaps, from frame 30 to frame 54.
//   - The page shortens to fit what's left.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { still, animated, INK, WHITE, file } from './lottie-kit.js';

const OUT = fileURLToPath(new URL('../big_assets/videos/', import.meta.url));
const FRAMES = 60;
const PAGE = WHITE; // drawn at 6% opacity (below) ≈ diatour --surface. A fill's color alpha is ignored.

/** One shape layer: a rounded rectangle, drawn from its left-middle point so scaling X shrinks it toward the left. */
function bar(ind, name, { w, h, r, color, opacity = 100, ks, size = still([w, h]) }) {
  return {
    ddd: 0, ind, ty: 4, nm: name, sr: 1, ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
    ks: { a: still([0, 0, 0]), r: still(0), ...ks },
    shapes: [{
      ty: 'gr', nm: name,
      it: [
        { ty: 'rc', d: 1, p: still([w / 2, 0]), s: size, r: still(r) },
        { ty: 'fl', c: still(color), o: still(opacity), r: 1 },
        { ty: 'tr', p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100) }
      ]
    }]
  };
}

function build(name, W, H) {
  const pageW = Math.min(W * 0.62, 900);
  const left = (W - pageW) / 2;
  const pad = pageW * 0.1;
  const lineH = 18;
  const gap = 46;
  const lines = 12;
  const keep = new Set([0, 3, 5, 8, 11]); // the five lines that survive the edit
  const top = (H - (lines - 1) * gap) / 2;
  const widths = [0.95, 0.8, 0.9, 0.7, 0.92, 0.85, 0.6, 0.88, 0.94, 0.75, 0.83, 0.5];

  const layers = [];
  let ind = 1;
  let kept = 0;
  let cut = 0;
  for (let i = 0; i < lines; i++) {
    const w = (pageW - pad * 2) * widths[i];
    const y = top + i * gap;
    let ks;
    if (keep.has(i)) {
      // survivors close the gaps: move up to a compact stack centered on the page
      const finalY = H / 2 - ((keep.size - 1) * gap) / 2 + kept * gap;
      ks = { p: animated([[30, [left + pad, y, 0]], [54, [left + pad, finalY, 0]]]), s: still([100, 100, 100]), o: still(100) };
      kept++;
    } else {
      // cuts shrink and fade, staggered 4 frames apart
      const start = 6 + cut * 4;
      ks = {
        p: still([left + pad, y, 0]),
        s: animated([[start, [100, 100, 100]], [start + 10, [0, 100, 100]]]),
        o: animated([[start, [100]], [start + 10, [0]]])
      };
      cut++;
    }
    layers.push(bar(ind++, `line-${i + 1}`, { w, h: lineH, r: lineH / 2, color: INK, ks }));
  }

  // the page: drawn last so it sits underneath (Lottie draws the first layer on top)
  const fullH = (lines - 1) * gap + pad * 2;
  const finalH = (keep.size - 1) * gap + pad * 2;
  const page = bar(ind++, 'page', {
    w: pageW, h: fullH, r: 12, color: PAGE, opacity: 6,
    size: animated([[30, [pageW, fullH]], [54, [pageW, finalH]]]), // animate the rectangle itself, so corners stay round
    ks: { p: still([left, H / 2, 0]), s: still([100, 100, 100]), o: still(100) }
  });
  layers.push(page);

  return file(name, W, H, FRAMES, layers);
}

for (const [name, W, H] of [['scrub-desktop', 1800, 1200], ['scrub-mobile', 800, 1200]]) {
  writeFileSync(`${OUT}${name}.json`, JSON.stringify(build(name, W, H)));
  console.log(`make-scrub-lottie: wrote big_assets/videos/${name}.json`);
}
