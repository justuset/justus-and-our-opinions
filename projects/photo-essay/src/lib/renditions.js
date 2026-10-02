// Rendition naming (the photo prep step, `npm run photos`). Shared by scripts/make-renditions.js, which writes the files,
// and $lib/media.js, which writes the srcset, so the two can never disagree about which files exist.
// No imports: it runs in Node (the script, `node --test`) and in SvelteKit.

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
