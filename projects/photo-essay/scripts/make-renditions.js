// scripts/make-renditions.js (`npm run photos`): the photo prep step.
//
// Like a newsroom CMS making renditions when a photo is uploaded, this runs BEFORE media enters the project, not during
// the build. Drop full-size originals (JPEG, PNG, WebP, TIFF, or an SVG placeholder) into photos/, run `npm run photos`, and commit what
// lands in big_assets/images/. photos/ never ships; big_assets/ still holds exactly what does.
//
// For each original it writes WebP files at the widths in src/lib/renditions.js, and prints the original's size for
// the photo's width/height in content/doc.json. A rendition is remade only when its original is newer.
// ponytail: WebP only, no crops. Every current browser reads WebP; add AVIF or art-directed crops if a story needs them.
import sharp from 'sharp';
import { readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, parse } from 'node:path';
import { renditionWidths, renditionPath } from './renditions.js';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'photos');
const OUT = join(ROOT, 'big_assets');
const QUALITY = 75; // the quality NYT asks its image CDN for (?quality=75)

const originals = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|tiff?|svg)$/i.test(f)).sort();
if (!originals.length) console.log('photos: no originals in photos/');

mkdirSync(join(OUT, 'images'), { recursive: true });
for (const file of originals) {
  const src = join(SRC, file);
  const name = `images/${parse(file).name}`;
  // .rotate() applies the camera's EXIF orientation, so the width/height printed match what the reader sees.
  const { width, height } = await sharp(src).rotate().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  let made = 0;
  for (const w of renditionWidths(width)) {
    const out = join(OUT, renditionPath(name, w));
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue;
    await sharp(src).rotate().resize({ width: w }).webp({ quality: QUALITY }).toFile(out);
    made++;
  }
  console.log(`photos: ${name}  "width": ${width}, "height": ${height}  (${made ? `${made} made` : 'up to date'})`);
}
