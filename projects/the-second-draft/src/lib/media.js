// Responsive-image helper (prototype chunk 10).
//
// story.json lists an image's files by width: { "400w": "images/a-400w.webp", "800w": "images/a.webp" }.
// srcset() turns that into the attribute string, and the browser picks the smallest file that is sharp enough for the
// slot the `sizes` attribute describes. Always keep width/height on the <img> too: they reserve the space (no CLS).
import { asset } from '$lib/assets.js';

/** { "400w": path, "800w": path } → "…/a-400w.webp 400w, …/a.webp 800w" */
export const srcset = (sources) =>
  Object.entries(sources ?? {})
    .map(([w, path]) => `${asset(path)} ${w}`)
    .join(', ') || undefined; // undefined = leave the attribute off
