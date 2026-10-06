// Responsive photo attributes. WIDTHS matches projects/photo-essay/scripts/renditions.js, so the page asks for the
// files that script makes. `npm run photos` (in projects/photo-essay) makes them; scripts/copy-photos.mjs copies them
// into public/images for this app.
//
// The reference picks ONE file in JavaScript (a `mobile` state from matchMedia, then src = mobile ? mobileUrl : url).
// Here the browser picks from srcset + sizes: nothing to store, nothing to recompute on resize, and it works with JS off.

export const WIDTHS = [600, 1200, 2000];

/** 1335 → [600, 1200, 1335]. Never upscales. */
export function renditionWidths(original: number): number[] {
  const top = Math.min(original, WIDTHS[WIDTHS.length - 1]);
  return [...WIDTHS.filter((w) => w < top), top];
}

export const renditionPath = (name: string, width: number) => `/${name}-${width}w.webp`;

export function photo(name: string, width: number) {
  const widths = renditionWidths(width);
  const fallback = widths.filter((w) => w <= 1200).at(-1) ?? widths[0];
  return {
    src: renditionPath(name, fallback),
    srcSet: widths.map((w) => `${renditionPath(name, w)} ${w}w`).join(', '),
  };
}

/** The `sizes` for each slot the reference has. */
export const SIZES = {
  large: '(min-width: 945px) 945px, 100vw',
  medium: '(min-width: 640px) 600px, calc(100vw - 40px)',
  half: '(min-width: 945px) 465px, (min-width: 740px) 50vw, 100vw',
  screen: '100vw',
} as const;
