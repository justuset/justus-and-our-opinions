// Responsive photo attributes for a photo made by `npm run photos`.
// content/doc.json names the photo without an extension ("images/calf") and gives the original's width and height.
// The browser picks a file from srcset using the slot's `sizes`; width/height on the <img> reserve the space (no CLS).
import { asset } from '$lib/assets.js';
import { renditionWidths, renditionPath } from '$lib/renditions.js';

/** photo('images/calf', 2000) → { src: '…/images/calf-1200w.webp', srcset: '…-600w.webp 600w, …' } */
export function photo(name, width) {
  const widths = renditionWidths(Number(width));
  const fallback = widths.filter((w) => w <= 1200).at(-1) ?? widths[0];
  return {
    src: asset(renditionPath(name, fallback)),
    srcset: widths.map((w) => `${asset(renditionPath(name, w))} ${w}w`).join(', '),
  };
}
