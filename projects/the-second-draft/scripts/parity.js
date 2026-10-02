// Parity check: is the built project the same page as the hand-built prototype? (Phase 1, chunk 11)
//
//   npm run build && npm run parity
//
// Serves ../../prototype and ./dist with a tiny static server (both are plain static files), opens each in headless
// Chromium at 375, 1024 and 1440px wide, measures the same things on both, and prints a table. Exits with code 1 if
// any measurement differs by more than 1px.
//
// Needs Playwright's Chromium once: `npx playwright install chromium`.
// Google Fonts requests are blocked on both pages, so both measure with the same fallback font; font loading
// timing can't make the two differ.
//
// Since NYT sandbox S2 the project renders inside a mock platform shell (a sticky masthead and a footer) that the
// prototype never had. Parity is about the STORY, so the shell is switched off before measuring (SHELL_OFF below):
// with the shell removed, the story must still be the Phase 1 page. The shell has its own check (learning log 21).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITES = { prototype: join(ROOT, '../../prototype'), project: join(ROOT, 'dist') };
const WIDTHS = [375, 1024, 1440];
const HEIGHT = 900;
const TOLERANCE = 1; // px
// Removes the platform shell: no masthead, no footer, and panels pin at the very top again.
const SHELL_OFF = ':root { --masthead-h: 0px } .masthead-container, #standalone-footer { display: none }';
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml'
};

/** A static file server on a free port. Returns its base URL. */
function serve(dir) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = join(dir, path.endsWith('/') ? `${path}index.html` : path);
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(0, () => resolve({ server, url: `http://localhost:${server.address().port}/` })));
}

/** Everything measured on one page, at one width. Runs in the browser. */
function measure() {
  const $ = (s) => document.querySelector(s);
  const px = (n) => Math.round(n * 10) / 10;
  const visible = [...document.querySelectorAll('.runway')].filter((r) => r.offsetParent);
  const twoUpImgs = [...document.querySelectorAll('.two-up img')].map((i) => px(i.getBoundingClientRect().width));
  return {
    'column width': px($('.g-text').getBoundingClientRect().width),
    'header height': px($('.header').getBoundingClientRect().height),
    'headline size': parseFloat(getComputedStyle($('.headline')).fontSize),
    'two-up direction': getComputedStyle($('.two-up')).flexDirection,
    'two-up image widths': twoUpImgs.join(' / '),
    'diagram width': px($('.diagram').getBoundingClientRect().width),
    'runway heights': visible.map((r) => r.offsetHeight).join(' / '),
    'page height': document.documentElement.scrollHeight
  };
}

/** Scroll offsets (into runway A) where each step begins, found by binary search on the lit progress markers. */
async function stepOffsets(page) {
  const top = await page.evaluate(() => {
    const r = document.querySelector('.runway');
    return r.getBoundingClientRect().top + scrollY;
  });
  const n = await page.evaluate(() => document.querySelector('.runway').querySelectorAll('.progress-marker').length);
  const litAt = async (y) => {
    await page.evaluate((y) => scrollTo(0, y), top + y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    return page.evaluate(() => document.querySelector('.runway').querySelectorAll('.progress-marker.on').length);
  };
  const offsets = [];
  for (let step = 1; step < n; step++) {
    let lo = 0;
    let hi = 20000;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if ((await litAt(mid)) > step) hi = mid;
      else lo = mid;
    }
    offsets.push(hi);
  }
  return offsets.join(' / ');
}

const servers = Object.fromEntries(await Promise.all(Object.entries(SITES).map(async ([k, dir]) => [k, await serve(dir)])));
const browser = await chromium.launch();
let failures = 0;

for (const width of WIDTHS) {
  const results = {};
  for (const [name, { url }] of Object.entries(servers)) {
    const page = await browser.newPage({ viewport: { width, height: HEIGHT } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await page.route(/cdnjs\.cloudflare\.com/, (r) => r.abort()); // not needed for layout; keeps the run offline
    await page.goto(url);
    await page.addStyleTag({ content: SHELL_OFF }); // no-op on the prototype, which has no shell
    await page.waitForTimeout(300);
    results[name] = { ...(await page.evaluate(measure)), 'step offsets (runway A)': await stepOffsets(page) };
    await page.close();
  }
  console.log(`\n${width}×${HEIGHT}`);
  const rows = Object.keys(results.prototype).map((key) => {
    const a = String(results.prototype[key]);
    const b = String(results.project[key]);
    const na = a.split(' / ').map(Number);
    const nb = b.split(' / ').map(Number);
    const numeric = na.every((v) => !Number.isNaN(v)) && na.length === nb.length;
    const ok = a === b || (numeric && na.every((v, i) => Math.abs(v - nb[i]) <= TOLERANCE));
    if (!ok) failures++;
    return { measure: key, prototype: a, project: b, match: ok ? '✅' : '❌' };
  });
  console.table(rows);
}

await browser.close();
Object.values(servers).forEach(({ server }) => server.close());
console.log(failures ? `\nparity: ${failures} difference(s) over ${TOLERANCE}px` : `\nparity: everything matches within ${TOLERANCE}px`);
process.exit(failures ? 1 : 0);
