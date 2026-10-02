// One-time migration (NYT sandbox alignment, chunk S1): content/story.json → content/doc.json.
//
//   node scripts/migrations/2026-10-02-story-to-doc.js
//
// story.json held the page as separate keys (header, byline, blocks[], credits) with nested data. doc.json uses the
// shape of the shipped NYT page's payload (docs/reference/nyt-sandbox-blueprint.md §5): one ordered `body` array of
//   { "type": "text",   "value": "…" }
//   { "type": "svelte", "value": { "component": "Name", …flat props } }
// Props are flat key/value pairs, the way doc-converted content arrives. Lists of words become numbered keys
// (heading1, heading2…), which survive commas inside a caption. A srcset becomes the comma-separated string it is in HTML.
//
// This script MOVES words, it never changes them: before writing, it checks that every string in story.json appears
// in doc.json unchanged. The essay is the author's argument, and only a person edits it (CLAUDE.md).
// Kept for the record. story.json was removed in the same commit, so the script can't run again; see learning log 20.
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../../content/', import.meta.url);
const story = JSON.parse(readFileSync(new URL('story.json', ROOT), 'utf8'));

const svelte = (component, props) => ({ type: 'svelte', value: { component, ...props } });

/** [{ heading: 'a' }, { heading: 'b' }] → { heading1: 'a', heading2: 'b' } */
function numbered(items, fields) {
  const out = {};
  items.forEach((item, i) => {
    for (const f of fields) if (item[f] !== undefined) out[`${f}${i + 1}`] = item[f];
  });
  return out;
}

/** { "400w": "images/a-400w.webp", "800w": "images/a.webp" } → "images/a-400w.webp 400w, images/a.webp 800w" */
const srcsetString = (sources) =>
  Object.entries(sources)
    .map(([w, path]) => `${path} ${w}`)
    .join(', ');

function convert(block) {
  switch (block.type === 'scrolly' ? `scrolly:${block.scene}` : block.type) {
    case 'text':
      return { type: 'text', value: block.value };
    case 'two-up': {
      const images = block.images.map((img) => ({ ...img, url: img.src, srcset: srcsetString(img.srcset) }));
      return svelte('TwoUp', {
        label: block.label,
        ...numbered(images, ['url', 'alt', 'width', 'height', 'srcset']),
        sizes: block.sizes,
        groupCaption: block.caption,
        credit: block.credit,
      });
    }
    case 'diagram':
      return svelte('Diagram', { label: block.label, ...numbered(block.nodes.map((n) => ({ label: n })), ['label']) });
    case 'scrolly:slides':
      return svelte('SlidesScrolly', {
        label: block.label,
        ...numbered(block.steps, ['heading', 'card', 'image', 'alt']),
      });
    case 'scrolly:captions': {
      const steps = block.steps.map((s) => ({ ...s, srcset: srcsetString(s.srcset) }));
      return svelte('CaptionScrolly', {
        label: block.label,
        ...numbered(steps, ['image', 'srcset', 'alt', 'caption']),
        sizes: block.sizes,
      });
    }
    case 'scrolly:paintings':
      return svelte('PaintingsScrolly', {
        label: block.label,
        ...numbered(block.items, ['image', 'alt']),
        ...numbered(block.steps, ['caption']),
        portraitScale: block.portraitScale,
        // Per-step layouts have no flat equivalent. They move into the doc's `sheets` data slot in chunk S6.
        layouts: block.steps.map((s) => s.layout),
      });
    case 'lottie':
      return svelte('ScrubLottie', {
        label: block.label,
        steps: block.steps,
        desktop: block.desktop,
        mobile: block.mobile,
        fallback: block.fallback,
      });
    default:
      throw new Error(`No conversion for block type "${block.type}"`);
  }
}

const { header, byline } = story;
const doc = {
  _comment: story._comment,
  slug: story.slug,
  // Picks the page's color theme (chunk S3): "diatour" (dark, the default) or "opinion" (light).
  theme: 'diatour',
  body: [
    svelte('Header', {
      kicker: header.kicker,
      kind: header.kind,
      headline: header.headline,
      dek: header.dek,
      url: header.art.lottie.desktop,
      urlMobile: header.art.lottie.mobile,
    }),
    svelte('Byline', { ...byline }),
    ...story.blocks.map(convert),
    svelte('Credits', { text: story.credits }),
  ],
};

// --- The check: every string in story.json reaches doc.json unchanged ---
// Structural keys aren't words: the old `type`, `scene` and `mode` values are replaced by component names
// (e.g. type "scrolly" + scene "slides" → component "SlidesScrolly"; mode "scrub" is the only mode ScrubLottie has).
const STRUCTURAL = new Set(['type', 'scene', 'mode']);
const strings = (x, out = []) => {
  if (typeof x === 'string') out.push(x);
  else if (x && typeof x === 'object')
    Object.entries(x).forEach(([k, v]) => !STRUCTURAL.has(k) && strings(v, out));
  return out;
};
const docStrings = strings(doc);
// srcset strings are joins of paths, so split them back into their paths for the comparison
const docPieces = new Set(docStrings.flatMap((s) => [s, ...s.split(', ').map((p) => p.replace(/ \d+w$/, ''))]));
const missing = strings(story).filter((s) => !docPieces.has(s));
if (missing.length) {
  console.error('story-to-doc: these strings would be lost or changed:', missing);
  process.exit(1);
}

writeFileSync(new URL('doc.json', ROOT), JSON.stringify(doc, null, 2) + '\n');
console.log(`story-to-doc: wrote content/doc.json (${doc.body.length} body blocks); all ${strings(story).length} strings carried over unchanged`);
