// Rendition naming (the photo prep step, `npm run photos`), used by scripts/make-renditions.js to write the files.
// apps/story/app/article/media.ts writes the srcset with the same widths: change both together.

/** Target widths: phones, the 600px column at 2×, the 945px lead and full-screen scroller at 2×. */
export const WIDTHS = [600, 1200, 2000];

/**
 * The widths made for a photo `original` px wide. Never upscales: a narrower original gets its own width as the top
 * size instead of a file that claims to be 2000w but isn't.
 *   1335 → [600, 1200, 1335]   2000 → [600, 1200, 2000]   4000 → [600, 1200, 2000]   500 → [500]
 * @param {number} original
 */
export function renditionWidths(original) {
  const top = Math.min(original, WIDTHS.at(-1));
  return [...WIDTHS.filter((w) => w < top), top];
}

/** 'images/calf' + 1200 → 'images/calf-1200w.webp' */
export const renditionPath = (name, width) => `${name}-${width}w.webp`;
