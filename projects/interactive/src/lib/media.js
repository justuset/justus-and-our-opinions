// Responsive-image helper (prototype chunk 10; string form since NYT sandbox chunk S1).
//
// content/doc.json writes a srcset the way HTML does, with paths relative to big_assets/:
//   "srcset1": "images/a-400w.webp 400w, images/a.webp 800w"
// srcset() turns each path into its hashed media URL. The browser then picks the smallest file that's sharp enough for
// the slot the `sizes` attribute describes. Always keep width/height on the <img> too: they reserve the space (no CLS).
import { asset } from '$lib/assets.js';
import { list } from '$kit/doc.js';

/** "images/a-400w.webp 400w, images/a.webp 800w" → "./_big_assets.<hash>/images/a-400w.webp 400w, …" */
export const srcset = (value) =>
  list(value)
    .map((candidate) => {
      const [path, width] = candidate.split(/\s+/);
      return `${asset(path)} ${width}`;
    })
    .join(', ') || undefined; // undefined = leave the attribute off
