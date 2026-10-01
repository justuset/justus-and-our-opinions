// Writes the header's intro animation, as twins:
//
//   node scripts/make-hero-lottie.js   → big_assets/videos/hero/hero-desktop.json (1800×1200, landscape)
//                                         big_assets/videos/hero/hero-mobile.json  (800×1200, portrait)
//
// The animation plays ONCE and ENDS on exactly the picture the header's SVG poster shows. The coordinates below are
// copied from the two <svg> artboards in src/lib/components/Header.svelte, so the poster can stay on screen without JS
// or with reduced motion, and the swap from poster to animation never changes the final composition.
// Self-authored placeholder art: no third-party license to record.
//
// 60 frames at 30fps (2s): the pages drop in and settle (staggered), the text lines draw left to right, the rings
// grow in last.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { still, animated, WHITE, rect, ellipse, hline, fill, stroke, layer, file } from './lottie-kit.js';

const OUT = fileURLToPath(new URL('../big_assets/videos/hero/', import.meta.url));
const FRAMES = 60;
// The poster's tokens: --surface = white at 5%, --line = white at 14%.
const SURFACE = 5;
const LINE = 14;

// Copied from Header.svelte. Pages are [x, y, w, h, rotation°] (each rotates about its own center).
const ART = {
  'hero-desktop': {
    w: 1800, h: 1200,
    pages: [[250, 260, 520, 680, -6], [1030, 230, 520, 680, 5], [640, 330, 520, 680, 0]],
    lines: [[700, 420, 400], [700, 470, 400], [700, 520, 340], [700, 600, 400], [700, 650, 380], [700, 700, 400], [700, 750, 220], [700, 830, 400], [700, 880, 300]],
    rings: [[1380, 900, 120], [430, 300, 90]]
  },
  'hero-mobile': {
    w: 800, h: 1200,
    pages: [[120, 760, 460, 560, -7], [240, 720, 460, 560, 0]],
    lines: [[300, 820, 340], [300, 870, 340], [300, 920, 280], [300, 1000, 340], [300, 1050, 300]],
    rings: [[660, 1080, 90], [110, 130, 60]]
  }
};

function build(name, { w, h, pages, lines, rings }) {
  const layers = [];
  let ind = 1;

  // Rings: on top, so first. Grow from 70% and fade in, frames 30–54.
  for (const [cx, cy, r] of rings) {
    layers.push(layer(ind++, `ring-${ind}`, FRAMES, {
      p: still([cx, cy, 0]),
      s: animated([[30, [70, 70, 100]], [54, [100, 100, 100]]]),
      o: animated([[30, [0]], [54, [100]]])
    }, [ellipse(r * 2), stroke(WHITE, 14, LINE)]));
  }

  // Lines: drawn left to right (scale X from 0, anchored at the line's start), staggered 3 frames from frame 22.
  lines.forEach(([x, y, len], n) => {
    const start = 22 + n * 3;
    layers.push(layer(ind++, `line-${n + 1}`, FRAMES, {
      p: still([x, y, 0]),
      s: animated([[start, [0, 100, 100]], [start + 14, [100, 100, 100]]])
    }, [hline(len), stroke(WHITE, 10, LINE)]));
  });

  // Pages: drop 60px and un-rotate into place, staggered 6 frames. Reversed so the last SVG rect is on top, as in SVG.
  [...pages].reverse().forEach(([x, y, pw, ph, rot], n) => {
    const cx = x + pw / 2;
    const cy = y + ph / 2;
    const start = (pages.length - 1 - n) * 6;
    layers.push(layer(ind++, `page-${pages.length - n}`, FRAMES, {
      p: animated([[start, [cx, cy - 60, 0]], [start + 30, [cx, cy, 0]]]),
      r: animated([[start, [rot * 2.5]], [start + 30, [rot]]]),
      o: animated([[start, [0]], [start + 12, [100]]])
    }, [rect(pw, ph), stroke(WHITE, 3, LINE), fill(WHITE, SURFACE)]));
  });

  return file(name, w, h, FRAMES, layers);
}

mkdirSync(OUT, { recursive: true });
for (const [name, art] of Object.entries(ART)) {
  writeFileSync(`${OUT}${name}.json`, JSON.stringify(build(name, art)));
  console.log(`make-hero-lottie: wrote big_assets/videos/hero/${name}.json`);
}
