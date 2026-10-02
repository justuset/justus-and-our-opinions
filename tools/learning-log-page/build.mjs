// Builds the learning log as one reading page (NYT sandbox era, 2026-10-02).
//
//   npm run log:page                       → tools/learning-log-page/dist/learning-log.html
//   LOG_PAGE_BRANCH=main npm run log:page  → GitHub links point at another branch
//
// Input: docs/learning-log/NN-*.md (every entry) and docs/guides/github-repo-from-scratch.md (the last part).
// Layout: the "diatour-nyt-frontend" artifact's design. template.css is that artifact's CSS, extracted WITHOUT its
// embedded commercial display font (Newsreader from Google Fonts stands in) and without its image marks.
// extra.css adds what log entries need; page.js is the page's small script (running head, read dots, resume link).
//
// The output is a single self-contained HTML file. It's what gets published as the "Our Opinions Learning Log"
// artifact (https://claude.ai/artifact/Tr7wUETfCzxzzhmcgtJVD7); it also opens straight from disk in a browser.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { marked } from 'marked';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = normalize(join(HERE, '../..'));
const OUT = join(HERE, 'dist');
const GH = 'https://github.com/justuset/justus-and-our-opinions';
// GitHub links go to this branch: LOG_PAGE_BRANCH if set, else the branch checked out, else main.
const BRANCH =
  process.env.LOG_PAGE_BRANCH ||
  (() => {
    try {
      const b = execSync('git rev-parse --abbrev-ref HEAD', { cwd: REPO }).toString().trim();
      return b && b !== 'HEAD' ? b : 'main';
    } catch {
      return 'main';
    }
  })();
const today = new Date().toISOString().slice(0, 10);

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (iso) => {
  const d = new Date(iso + 'T12:00:00Z');
  const m = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'][
    d.getUTCMonth()
  ];
  return `${m} ${d.getUTCDate()}`;
};

// ---------- parts ----------
// Each part holds the entries numbered from `from` up to the next part's `from`, so a new entry lands in the last
// part automatically. When a new phase starts, add a part here with the entry number it starts at.
const PARTS = [
  {
    id: 'part-setup',
    short: 'Setup',
    title: 'Setting Up and Planning',
    from: 1,
    intro:
      'An empty GitHub repo, a first commit, and the research that turned a reference page into a two-phase plan. Everything later rests on the decisions made here.',
  },
  {
    id: 'part-phase1',
    short: 'Phase 1',
    title: 'Phase 1, Built by Hand',
    from: 5,
    intro:
      'The NYT-style scrolly essay, rebuilt in one plain HTML file, ten chunks with a measured checkpoint each, then ported into a Birdkit-style SvelteKit project and proven equal to within a pixel.',
  },
  {
    id: 'part-phase2',
    short: 'Phase 2',
    title: 'Phase 2, the Foundation',
    from: 18,
    intro:
      'One npm workspace shaped like the Times’s two front-end worlds: a server-rendered React story app, a SvelteKit graphics desk, and the packages they share.',
  },
  {
    id: 'part-sandbox',
    short: 'NYT sandbox',
    title: 'Aligning With the Shipped Page',
    from: 19,
    intro:
      'A blueprint read from the shipped page’s source, checked against the build, then applied chunk by chunk: the content document first, then the platform shell around the story.',
  },
  {
    id: 'part-house',
    short: 'Housekeeping',
    title: 'Repository Housekeeping',
    from: 22,
    intro: 'The first pull request, and the cleanup that came from starting a repo on a feature branch.',
  },
  {
    id: 'part-diy',
    short: 'Do it yourself',
    title: 'Set Up a Repo Yourself',
    guide: true,
    intro:
      'The manual walkthrough: from installing Git to a protected main branch with CI, written so you can do every step by hand next time. Part 9 retells this repo’s own detour.',
  },
];

// ---------- links ----------
const guideAnchor = (a) => {
  const m = a.match(/^(\d+)-/);
  return m ? `#g${m[1]}` : '#part-diy';
};
function rewriteHref(href, srcFile) {
  if (/^(https?:|mailto:)/.test(href)) return { href, external: true };
  if (href.startsWith('#')) {
    if (srcFile.includes('/guides/')) return { href: guideAnchor(href.slice(1)) };
    return { href: '#' + href.slice(1) };
  }
  const [p, anchor = ''] = href.split('#');
  const abs = normalize(join(dirname(srcFile), p));
  const rel = abs.replace(REPO + '/', '');
  const log = rel.match(/^docs\/learning-log\/(\d+)-.*\.md$/);
  if (log) return { href: `#e${log[1]}` };
  if (rel === 'docs/guides/github-repo-from-scratch.md') return { href: anchor ? guideAnchor(anchor) : '#part-diy' };
  const isDir = existsSync(abs) && statSync(abs).isDirectory();
  return { href: `${GH}/${isDir ? 'tree' : 'blob'}/${BRANCH}/${rel}${anchor ? '#' + anchor : ''}`, external: true };
}

function mdToHtml(md, srcFile) {
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens);
    return depth <= 2 ? `<h4>${text}</h4>\n` : `<h5>${text}</h5>\n`;
  };
  renderer.table = function (token) {
    const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('');
    const rows = token.rows
      .map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`)
      .join('');
    return `<div class="tw"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
  };
  renderer.code = ({ text, lang }) =>
    `<div class="cw"><pre class="code"${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(text)}</code></pre></div>\n`;
  renderer.link = function ({ href, tokens }) {
    const { href: h, external } = rewriteHref(href, srcFile);
    return `<a href="${esc(h)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${this.parser.parseInline(tokens)}</a>`;
  };
  return marked.parse(md, { renderer, gfm: true });
}
const inline = (md, src) =>
  mdToHtml(md, src)
    .trim()
    .replace(/^<p>|<\/p>$/g, '');

// ---------- log entries ----------
const LOGDIR = join(REPO, 'docs/learning-log');
const entries = Object.fromEntries(
  readdirSync(LOGDIR)
    .filter((f) => /^\d\d-.*\.md$/.test(f))
    .map((f) => {
      const src = join(LOGDIR, f);
      const n = parseInt(f, 10);
      let md = readFileSync(src, 'utf8');
      const title = md.match(/^# (.*)$/m)[1].replace(/^Learning log \d+:\s*/, '');
      md = md.replace(/^# .*\n/, '');
      // meta lines (Date / Chunk / Step / Goal…) up to the first blank-line-separated block that isn't **Key:**
      const date = (md.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/) || [])[1];
      let goalLine = (md.match(/^\*\*Goal:\*\*\s*(.*)$/m) || [])[1];
      md = md.replace(/^\*\*(Date|Goal|Chunk|Step|PR|Covers|Branch)[^\n]*\n/gm, '');
      // "Later changes" / update callouts: the leading blockquote(s) before the first heading
      const callouts = [];
      md = md.replace(/^\s*((?:>.*\n?)+)/, (m, q) => {
        callouts.push(q.replace(/^> ?/gm, ''));
        return '';
      });
      // dek: the Goal section's first paragraph, else the **Goal:** line, else the first paragraph
      let dek = goalLine;
      if (!dek) {
        const g = md.match(/^## Goal\n+([\s\S]*?)\n\n/m);
        if (g && !g[1].trim().endsWith(':')) {
          dek = g[1];
          md = md.replace(/^## Goal\n+[\s\S]*?\n\n/m, '## Goal\n\n');
          md = md.replace(/^## Goal\n\n(?=##|\s*$)/m, '');
        }
      }
      if (!dek) {
        const p = md.match(/^\s*([^#>|\-`\n][^\n]*(?:\n[^\n#>|\-`][^\n]*)*)\n/);
        if (p && !p[1].trim().endsWith(':')) {
          dek = p[1];
          md = md.replace(p[0], '');
        }
      }
      // split "Phase 1, chunk 8: The scroll engine" into a kind and a title
      let kind = '';
      let h3 = title;
      const k = title.match(/^(Phase \d, chunk \d+|NYT sandbox S\d+|Phase 2, chunk \d+):\s*(.*)$/);
      if (k) {
        kind = k[1].replace(', chunk', ' · chunk').replace('NYT sandbox ', 'NYT sandbox · ');
        h3 = k[2];
      }
      h3 = h3.charAt(0).toUpperCase() + h3.slice(1);
      return [n, { n, f, src, title: h3, kind, date, dek, callouts, body: md }];
    }),
);

// ---------- guide sections ----------
const GUIDE = join(REPO, 'docs/guides/github-repo-from-scratch.md');
const guideMd = readFileSync(GUIDE, 'utf8');
const guideIntro = guideMd.split(/\n---\n/)[0];
const guideSections = [...guideMd.matchAll(/^## (\d+)\. (.*)\n([\s\S]*?)(?=\n## \d+\. |\s*$)/gm)].map((m) => ({
  n: +m[1],
  title: m[2],
  body: m[3].replace(/\n---\s*$/, ''),
}));

// Fill each part's entry list from the `from` ranges
const numbers = Object.keys(entries)
  .map(Number)
  .sort((a, b) => a - b);
const ranged = PARTS.filter((p) => !p.guide);
ranged.forEach((p, i) => {
  const next = ranged[i + 1]?.from ?? Infinity;
  p.entries = numbers.filter((n) => n >= p.from && n < next);
});
const unplaced = numbers.filter((n) => n < ranged[0].from);
if (unplaced.length) throw new Error(`log entries ${unplaced.join(', ')} come before the first part`);

// ---------- render ----------
let cards = '';
let toc = '';
let bar = '';
let rh = '';
let total = 0;
PARTS.forEach((part, pi) => {
  const R = ROMAN[pi + 1];
  const label = `${R}. ${part.title}`;
  bar += `<a href="#${part.id}"><span class="sb-n">${R}.</span>${esc(part.short)}</a>`;
  rh += `<a class="rh-link" data-part="${esc(label)}" href="#${part.id}"><span class="sb-n">${R}.</span>${esc(part.short)}</a>`;
  cards += `
  <div class="part" id="${part.id}" data-part="${esc(label)}">
    <div class="part-rule" aria-hidden="true"></div>
    <div class="part-num">Part ${R}</div>
    <h2>${esc(part.title)}</h2>
    <p class="part-intro">${esc(part.intro)}</p>
  </div>`;
  let tocItems = '';
  const items = part.guide
    ? guideSections.map((s) => ({
        id: `g${s.n}`,
        enum: `${R}.${ROMAN[s.n]}`,
        kind: `Step ${s.n} of ${guideSections.length}`,
        title: s.title.replace(/`/g, ''),
        titleHtml: inline(s.title, GUIDE),
        dek: '',
        callouts: [],
        bodyHtml: mdToHtml(s.body, GUIDE),
        src: GUIDE,
      }))
    : part.entries.map((n) => {
        const e = entries[n];
        return {
          id: `e${String(n).padStart(2, '0')}`,
          enum: `Log ${String(n).padStart(2, '0')}`,
          kind: [e.kind, e.date && fmtDate(e.date)].filter(Boolean).join(' · '),
          title: e.title.replace(/`/g, ''),
          titleHtml: inline(e.title, e.src),
          dek: e.dek ? inline(e.dek, e.src) : '',
          callouts: e.callouts.map((c) => mdToHtml(c, e.src)),
          bodyHtml: mdToHtml(e.body, e.src),
          src: e.src,
        };
      });
  if (part.guide) {
    cards += `
  <section class="card no-shot guide-lead" id="g0" data-part="${esc(label)}">
    <div class="body">${mdToHtml(guideIntro.replace(/^# .*\n/, '').replace(/\*\*Contents\*\*[\s\S]*$/, ''), GUIDE)}</div>
  </section>`;
  }
  for (const it of items) {
    total++;
    tocItems += `<li><a href="#${it.id}"><span class="n">${it.enum.replace('Log ', '')}</span><span class="t">${esc(it.title)}</span><span class="t-done" data-for="${it.id}" aria-hidden="true"></span></a></li>`;
    const repoPath = it.src.replace(REPO + '/', '');
    cards += `
  <section class="card no-shot" id="${it.id}" data-part="${esc(label)}">
    <div class="eyebrow"><span><span class="enum">${esc(it.enum)}</span>${it.kind ? `<span class="kind">${esc(it.kind)}</span>` : ''}</span></div>
    <h3>${it.titleHtml}</h3>
    ${it.dek ? `<p class="dek">${it.dek}</p>` : ''}
    ${it.callouts.map((c) => `<aside class="note">${c}</aside>`).join('')}
    <div class="body">${it.bodyHtml}</div>
    <div class="refs"><span class="refs-label">In the repo</span><ul><li><a href="${GH}/blob/${BRANCH}/${repoPath}${
      part.guide
        ? `#${it.id.slice(1)}-` +
          it.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/ /g, '-')
        : ''
    }" target="_blank" rel="noopener noreferrer">${esc(repoPath)}</a></li></ul></div>
    <a class="back" href="#contents">Back to contents</a>
  </section>`;
  }
  toc += `<li class="toc-sec"><a class="sec" href="#${part.id}"><span class="n">${R}.</span><span class="t">${esc(part.title)}</span></a><ol>${tocItems}</ol></li>`;
});

const css = readFileSync(join(HERE, 'template.css'), 'utf8').replace(
  /--font-display: 'Exposure VAR', Georgia, 'Times New Roman', serif;/,
  "--font-display: 'Newsreader', Georgia, 'Times New Roman', serif;",
);
const extra = readFileSync(join(HERE, 'extra.css'), 'utf8');
const script = readFileSync(join(HERE, 'page.js'), 'utf8');
const entryCount = Object.keys(entries).length;

const html = `<title>Our Opinions Learning Log</title>
<meta name="description" content="Every step of building an Opinion-style interactive template, from an empty repo to the platform shell, plus a manual GitHub setup walkthrough.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&display=swap">
<style>${css}
${extra}</style>

<div class="runhead" id="runhead" aria-hidden="true" inert>
  <div class="in">
    <nav class="rh-nav" aria-label="Parts">
      <a class="rh-home" href="#contents">Contents</a>
      <span class="rh-div" aria-hidden="true"></span>
      <div class="rh-slider" id="rh-slider">${rh}</div>
    </nav>
  </div>
</div>

<div class="wrap">
  <header class="masthead">
    <div class="lockup-bar">
      <div class="lockup"><span class="word">Our Opinions</span><span class="cross" aria-hidden="true">·</span><span class="word word-soft">Learning Log</span></div>
    </div>
    <nav class="sectionbar" aria-label="Parts">
      <a class="sb-home" href="#contents">Contents</a>
      <span class="sb-div" aria-hidden="true"></span>
      <div class="sb-links">${bar}</div>
    </nav>

    <div class="lead">
      <h1 class="title">${entryCount} Entries, From an Empty Repo to the Platform Shell</h1>
      <p class="deck">How an Opinion-style interactive template got built, one step at a time: the plan, ten hand-built chunks, a Birdkit-style port proven to the pixel, a Times-shaped monorepo, and the first steps toward the shipped page’s architecture. Each entry records what was planned, what actually happened, what broke and what it taught. The last part is a walkthrough for setting up a GitHub repo yourself.</p>
      <a class="resume" id="resume" href="#e01">
        <span class="resume-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span class="resume-text" id="resume-text">Start reading &nbsp;·&nbsp; ${entryCount} entries and a setup guide</span>
      </a>
    </div>

    <div class="byline">
      <div>
        <div class="who">Prepared for Justus Riley</div>
        <div class="dateline">Diatour &nbsp;·&nbsp; Learning log for justus-and-our-opinions</div>
      </div>
    </div>
    <p class="pubdate"><time datetime="${today}">${fmtDate(today)}, ${today.slice(0, 4)}</time></p>

    <details class="toc" id="contents">
      <summary>
        <span class="toc-title">Contents</span>
        <span class="toc-meta">${PARTS.length} parts, ${total} chapters<span class="progress" id="progress"></span></span>
        <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </summary>
      <div class="toc-body">
        <p class="toc-note">Entries are a record of each day, not a manual: when a later step replaced something, the entry carries a note pointing to what replaced it. A dot marks each chapter you have read to the end, saved in this browser.</p>
        <ol class="toc-list">${toc}</ol>
      </div>
    </details>
  </header>
${cards}
  <footer class="colophon">
    <p>Built from <a href="${GH}/tree/${BRANCH}/docs/learning-log" target="_blank" rel="noopener noreferrer">docs/learning-log</a> and <a href="${GH}/blob/${BRANCH}/docs/guides/github-repo-from-scratch.md" target="_blank" rel="noopener noreferrer">docs/guides/github-repo-from-scratch.md</a> as of ${fmtDate(today)}, ${today.slice(0, 4)}. Demo project; no Times branding or proprietary fonts.</p>
  </footer>
</div>
<script>${script}</script>
`;
// Every in-page link must land on something: a log link to a missing entry fails the build instead of shipping dead.
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const dead = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))].filter((id) => !ids.has(id));
if (dead.length) throw new Error(`in-page links with no target: ${dead.map((d) => '#' + d).join(', ')}`);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'learning-log.html'), html);
console.log(
  `log:page → ${join(OUT, 'learning-log.html').replace(REPO + '/', '')}: ${entryCount} entries in ${ranged.length} parts + ${guideSections.length} guide steps, ` +
    `${(html.length / 1024).toFixed(0)} KB, GitHub links → ${BRANCH}`,
);
