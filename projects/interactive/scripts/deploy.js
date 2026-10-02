// scripts/deploy.js
//
// Optional. Any static host works (GitHub Pages, Netlify, S3 + CloudFront, Cloudflare Pages): upload dist/ as is.
// What matters is the CACHE POLICY, because it is the reason the folders have hashes in their names:
//
//   _app.<build-hash>/...        Cache-Control: public, max-age=31536000, immutable   (new build = new folder name)
//   _big_assets.<hash>/...       Cache-Control: public, max-age=31536000, immutable   (new media = new folder name)
//   index.html (+ static/ files)  Cache-Control: public, max-age=60                    (unhashed: they change in place)
//
// Rule: only the two HASHED folders are immutable. Anything else (index.html, favicon.png from static/) keeps its name across
// deploys, so it must stay short-lived or readers would never see a new version.
//
// Upload order matters too: hashed folders FIRST, index.html LAST. Until the new index.html lands, readers keep getting
// the old page, which still points at the old (still present) folders. Nobody gets a page whose files aren't there yet.
//
// This script prints the upload plan (a dry run). To deploy for real, replace `upload()` with your host's CLI or SDK,
// e.g. `aws s3 cp <file> s3://bucket/interactive/<slug>/<path> --cache-control "<policy>"`.

import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname;
// Where the files go on the host. Like the shipped page (nytimes.com/interactive/…/<slug>.html), the path is the article
// type plus the story's slug, not the repo folder.
const PROJECT_PATH = process.env.PROJECT_PATH ?? 'interactive/the-second-draft';

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

const isHashed = (path) => /^_(app|big_assets)\./.test(path);
const policy = (path) => (isHashed(path) ? 'public, max-age=31536000, immutable' : 'public, max-age=60');

function upload(path, cacheControl, bytes) {
  console.log(`${cacheControl.padEnd(40)} ${String(bytes).padStart(8)}  ${PROJECT_PATH}/${path}`);
}

let files;
try {
  files = listFiles(DIST).map((f) => relative(DIST, f).split(sep).join('/'));
} catch {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

// Hashed folders first, then other unhashed files, index.html very last.
const rank = (p) => (isHashed(p) ? 0 : p === 'index.html' ? 2 : 1);
files.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

console.log(`Upload plan (dry run), ${files.length} files:\n`);
for (const path of files) upload(path, policy(path), statSync(join(DIST, path)).size);
