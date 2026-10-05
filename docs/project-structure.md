# Project structure: how a Birdkit-style story project is organized, built and shipped

This guide explains **every folder and file** in the story project at `projects/interactive/`. That project reproduces the
build output of a Birdkit-style New York Times interactive, following the build spec in
[`reference/birdkit-build-spec.md`](reference/birdkit-build-spec.md). It's written for a **web designer/developer**: each part
says what a thing is, why it exists, and what you'd touch it for.

> **Observed vs. reconstructed.** The *output* folder shape (`index.html`, `_app.<hash>/`, `_big_assets.<hash>/`) was observed
> in a live NYT page's network requests. The *source* side is a reconstruction. Birdkit is private, so the source file names are
> conventions, not copies. Content, artwork and branding here are placeholders.

---

## Contents

1. [The repository at a glance](#1-the-repository-at-a-glance)
2. [Why each story is its own project](#2-why-each-story-is-its-own-project)
3. [Quick start](#3-quick-start)
4. [The source tree, file by file](#4-the-source-tree-file-by-file)
5. [Content: `doc.json`](#5-content-docjson)
6. [Media: `big_assets/`](#6-media-big_assets)
7. [The build pipeline, step by step](#7-the-build-pipeline-step-by-step)
8. [The output tree, file by file](#8-the-output-tree-file-by-file)
9. [Caching and deploying](#9-caching-and-deploying)
10. [Four fixes to the spec](#10-four-fixes-to-the-spec)
11. [How the prototype and the project stay in sync](#11-how-the-prototype-and-the-project-stay-in-sync)
12. [How to…](#12-how-to)
13. [Spec checklist](#13-spec-checklist)
14. [Glossary](#14-glossary)

---

## 1. The repository at a glance

```
justus-and-our-opinions/
├─ README.md                    what this repo is, where to start
├─ CLAUDE.md                    rules for Claude Code (and humans) working here
├─ package.json                 PHASE 2 WORKSPACE root: "workspaces": ["apps/*", "packages/*"], shared lint/format
├─ apps/story/, apps/graphics/  Phase 2 apps (React story page, SvelteKit graphics desk)
├─ packages/                    Phase 2 shared code: design-system (tokens.css), archie (ArchieML → blocks)
├─ tools/learning-log-page/     `npm run log:page`: builds the learning log as one reading page
├─ .claude/skills/              vendored Svelte skills for Claude Code (MIT, see its README)
├─ docs/                        everything you read: plans, references, learning log, this guide
│  ├─ plan/                     Phase 1 (hand-built, 10 chunks) and Phase 2 (Times-shaped stack)
│  ├─ reference/                source material: the scrolly template, its breakdown, the build spec, diatour analysis
│  ├─ learning-log/             one entry per step: what was built, what broke, what it taught
│  ├─ guides/                   how-tos you can follow yourself (e.g. setting up a GitHub repo from scratch)
│  └─ project-structure.md      ← you are here
├─ prototype/
│  └─ index.html                PHASE 1 SANDBOX: plain HTML/CSS/JS, one idea per chunk, checked in DevTools
└─ projects/
   ├─ interactive/              THE INTERACTIVE TEMPLATE: Birdkit-style SvelteKit build of the same page (demo story slug: the-second-draft)
   └─ photo-essay/              THE PHOTO ESSAY TEMPLATE: same pipeline and shell, photo-led blocks, `npm run photos` renditions (demo story slug: photo-essay-demo)
```

| Folder | Role | You work here when… |
|--------|------|---------------------|
| `prototype/` | Learning sandbox. One file, no build step, so every idea is visible in DevTools | Doing a Phase 1 chunk |
| `projects/interactive/` | The production-shaped story. Same page, as components, content data and a real build | Porting a chunk that passed, or editing copy and media |
| `projects/photo-essay/` | A second template on the same pipeline, for photo-led guest essays (see its README) | Building a photo essay |
| `docs/` | The written explanation of all of it | Learning, or deciding what to build next |
| `apps/`, `packages/` | The Phase 2 Times-shaped stack, one npm workspace (see `docs/architecture.md`) | Doing a Phase 2 chunk |

`projects/interactive/` and `projects/photo-essay/` are **not** part of the workspace: each keeps its own `package.json` and lockfile, as each
Birdkit-style story does (§2). CI builds it as a separate job.

---

## 2. Why each story is its own project

At the Times, an immersive story built by the graphics desk is a **self-contained project**: its own source folder, its own build,
deployed to its own path on the CDN:

```
<cdn>/projects/<project-id>/index.html
<cdn>/projects/<project-id>/_app.<build-hash>/…
<cdn>/projects/<project-id>/_big_assets.<content-hash>/…
```

That's why our project lives at `projects/interactive/`. A second story would be `projects/<another-slug>/`, a copy of the
same skeleton with different `content/` and `big_assets/`. Projects share nothing at runtime, so one story's deploy can never break another.

| Benefit | How the structure gives it |
|---------|----------------------------|
| Publish without JavaScript | Prerendering puts every word into `index.html` |
| Cache code and media "forever" | Hashed folder names. A change means a new name, so no stale files |
| Fix a typo without re-uploading 100 images | Code and media are hashed separately |
| Host anywhere | Relative URLs, so `dist/` works at any path on any static host |

---

## 3. Quick start

```bash
cd projects/interactive
npm install            # once
npm run dev            # http://localhost:5173: live reload, media served from big_assets/
npm run build          # writes dist/ (see §7)
npm run preview        # serves dist/ locally, as a reader would get it
npm run deploy         # prints the upload plan with cache headers (dry run, see §9)
npm test               # unit tests (node --test, built into Node)
npm run test:e2e       # Playwright: the platform shell's measured layout at 390 / 800 / 1440 (S4b); builds and serves dist/ itself
npm run parity         # compares dist/ with prototype/index.html at 375/1024/1440 (needs `npx playwright install chromium` once)
```

Requirements: Node 22+. Versions are pinned to the spec's ranges: SvelteKit 2, Svelte 5, Vite 6, adapter-static 3,
vite-plugin-svelte 5, lottie-web 5.

---

## 4. The source tree, file by file

```
projects/interactive/
├─ package.json
├─ package-lock.json
├─ svelte.config.js
├─ vite.config.js
├─ .gitignore
├─ README.md
├─ content/
│  └─ doc.json
├─ big_assets/
│  ├─ images/
│  │  ├─ two-up-draft-1.webp, two-up-draft-4.webp
│  │  ├─ marked-up-1 … 5.webp
│  │  ├─ argument-a, b, c.webp
│  │  └─ slides/slide-1 … slide-6/slide.jpg
│  ├─ videos/
│  │  ├─ hero/hero-desktop.json, hero-mobile.json
│  │  ├─ scrub-desktop.json
│  │  ├─ scrub-mobile.json
│  │  └─ images/diagram/frame-1, 2.webp
│  └─ scripts/                  (empty for now; .gitkeep)
├─ scripts/
│  ├─ lottie-kit.js
│  ├─ make-hero-lottie.js
│  ├─ make-scrub-lottie.js
│  ├─ parity.js
│  └─ deploy.js
├─ playwright.config.js        three projects: mobile 390, tablet 800, desktop 1440 (S4b)
├─ tests/                       e2e specs: masthead, footer (share tools, recirc, ad, footer), responsive + helpers.js (S4b)
├─ static/
│  └─ favicon.png
└─ src/
   ├─ app.html
   ├─ app.css
   ├─ routes/
   │  ├─ +layout.js
   │  ├─ +layout.svelte
   │  ├─ +error.svelte
   │  ├─ +page.js
   │  └─ +page.svelte
   └─ lib/
      ├─ assets.js               (generated)
      ├─ blocks.js             the component registry + docProblems() (S1)
      ├─ scroll.js             loads GSAP ScrollTrigger once; trackBounds(), stepOf(), + .test.js (S4)
      ├─ lottie.js
      ├─ media.js
      └─ components/
         ├─ Header.svelte, Byline.svelte, Credits.svelte
         ├─ TwoUp.svelte, Diagram.svelte
         ├─ StickyScroller.svelte   the shared track + sticky panel (was Scrolly.svelte until S4)
         ├─ SlidesScrolly.svelte, CaptionScrolly.svelte, PaintingsScrolly.svelte
         └─ ScrubLottie.svelte, ScrubStage.svelte

projects/birdkit-kit/           shared by every template, imported as $kit/… (no package.json, no node_modules)
├─ config.js                    kit(adapter): the SvelteKit settings that produce the output tree
├─ hash-assets.js               media hashing + copy + verify, run from the template's folder
├─ Blocks.svelte                the renderer: walks doc.json's body; takes the template's registry as a prop (S1)
├─ Text.svelte                  one paragraph, through the allow-list
├─ doc.js                       series() and list() for flat props (S1)
├─ inline-html.js               the allow-list for inline HTML in text blocks, + .test.js (S1)
└─ shell/                       the mock platform shell (S4b): shell.css (--shell-* tokens), Masthead, ShareTools, Recirc, AdSlot, SiteFooter
```

**Why `birdkit-kit` isn't in `packages/`:** `packages/` belongs to the Phase 2 npm workspace (linted, built and tested by
the root scripts), while each template is a standalone project with its own lockfile (§2). The kit is plain source that
the templates compile with their own Svelte: `svelte.config.js` passes its adapter to `kit()`, the `$kit` alias points at
the folder, and `vite.config.js` allows it (`server.fs.allow`) and dedupes `svelte`, so the page never loads two Svelte runtimes.

### Project root

| File | What it is | Why / what you'd change |
|------|-----------|-------------------------|
| `package.json` | The project's name, scripts and dependencies | `build` runs three steps: `hash-assets` → `vite build` → `hash-assets --copy` (§7). `lottie-web` is the only runtime dependency |
| `package-lock.json` | Exact installed versions | Committed, so everyone builds with the same versions. Never edit by hand |
| `svelte.config.js` | SvelteKit settings: three lines that call `kit(adapter)` from `../birdkit-kit/config.js` | The four settings that *produce the output tree*: `adapter-static` (writes `dist/`), `appDir` (names `_app.<hash>`), `paths.relative` (relative URLs), `prerender` (bakes HTML), plus `bundleStrategy: 'split'` (separate `entry/`, `nodes/`, `chunks/`). Every line is commented |
| `vite.config.js` | Vite settings | Adds the SvelteKit plugin, lets the dev server read `content/`, `big_assets/` and `../birdkit-kit/` (`server.fs.allow`), and dedupes `svelte` |
| `.gitignore` | What Git skips | `dist/`, `.svelte-kit/` and `node_modules/` are all regenerated, never committed |
| `README.md` | The project's front door | Commands and a link back to this guide |

### `content/`: the words

| File | What it is |
|------|-----------|
| `doc.json` | The whole story **as data**: one ordered `body` of text blocks and component blocks, in the shape of the shipped NYT payload. It's the only file an editor needs. See §5 |

### `big_assets/`: the media

Raw images, Lottie animations and helper scripts. It sits **outside `src/` and `static/` on purpose**: Vite never bundles or
renames these files. Instead `../birdkit-kit/hash-assets.js` gives the whole folder one content hash and copies it next to the page. See §6.

### `scripts/`: build helpers (run by Node, never shipped)

| File | What it does |
|------|-------------|
| `../birdkit-kit/hash-assets.js` (shared) | **Before the build:** hashes every file in `big_assets/` (paths + bytes) and writes `src/lib/assets.js` with the media URL. **After the build (`--copy`):** copies the folder to `dist/_big_assets.<hash>/`, then checks that every media URL in `index.html` points at a real file |
| `lottie-kit.js` | Small helpers for writing Lottie JSON by hand: `still()` / `animated()` properties, `rect` / `ellipse` / `hline` shapes, `fill` / `stroke`, `layer()` and `file()`. Its header comment explains the format |
| `make-hero-lottie.js` | Writes the header intro twins (`big_assets/videos/hero/hero-desktop.json`, `hero-mobile.json`) from the **same coordinates as the SVG posters** in `Header.svelte`, so the last frame is the poster (measured: 11 of 540,000 pixels differ, all anti-aliasing). Run by hand: `node scripts/make-hero-lottie.js` |
| `make-scrub-lottie.js` | Writes the two scene D placeholder animations (`big_assets/videos/scrub-desktop.json`, `scrub-mobile.json`): 12 bars of "text" on a page, 7 shrink and fade, 5 close up. Self-authored, so no license to record. A readable example of what's inside a Lottie file (canvas, frame range, layers, keyframes). Run it by hand: `node scripts/make-scrub-lottie.js` |
| `parity.js` | `npm run parity`: measures the prototype and `dist/` side by side at three widths and fails on any difference over 1px (§11). Switches the platform shell off first, since parity is about the story. Uses the `playwright` dev dependency |
| `deploy.js` | Prints the upload plan: every file in `dist/` with its `Cache-Control` header, hashed folders first and `index.html` last. Swap its `upload()` function for your host's CLI to deploy for real (§9) |

### `static/`

| File | What it is |
|------|-----------|
| `favicon.png` | Copied to `dist/` unchanged. `static/` is for the few files that must keep their exact name and path. Story media does **not** go here |

### `src/`: the code

| File | What it is | Becomes in `dist/` |
|------|-----------|--------------------|
| `app.html` | The document shell around every page. Holds `<html lang>`, the viewport meta, the **chunk 5 `<head>` script** (`.js` class + 2.5s failsafe), the Google Fonts link, and the `%sveltekit.head%` / `%sveltekit.body%` slots SvelteKit fills | The outside of `index.html` |
| `app.css` | **Global** tokens and base rules, including `--masthead-h` (S2; `0px` since S4b, because the measured masthead isn't sticky): gutter, column, type, color (diatour), easing, header sizes, `overflow-x: clip`, the `.bleed` and `.visually-hidden` utilities, and the **twin utilities** (`.mobile-only` / `.desktop-only`, deliberately the last rules in the file). Since S3: the NYT tier tokens `--bp-tablet: 740px` / `--bp-desktop: 1150px` (documentation, since custom properties can't be used in `@media`), and the **theme blocks** `.g-theme-diatour` / `.g-theme-opinion`, which only redefine color tokens. Ported from the prototype's chunks 2–6. Story-wide rules are scoped with `:where(.birdkit-body)`, which keeps them out of the shell without changing their specificity | `assets/0.<hash>.css` |
| `routes/+layout.js` | `prerender = true` (render to HTML at build time) and `trailingSlash = 'never'` (so `/` becomes `index.html`) | Build settings, no file of its own |
| `routes/+layout.svelte` | **The mock platform shell.** S2 made it a sticky bar and a footer note. Since S4b it's a replica measured from the shipped page, composed from `$kit/shell/` (`projects/birdkit-kit/shell/`):<br>• `Masthead`: transparent, `position: absolute`, 6px from the top; it floats over the story's header and scrolls away. 47px tall on phones, 42px from 740px. It holds the skip link, and the wordmark is light over a dark (diatour) header;<br>• `<main id="site-content">`, then `#standalone-footer`: `ShareTools` (comment button + share pills), `Recirc` (placeholder related-content grid), `AdSlot` (`#bottom-wrapper`, "Advertisement") and `SiteFooter`.<br>The platform's tokens live in `shell.css` as `--shell-*`, apart from the story's: **widths, heights and type sizes are measured**, while **colors and fonts are diatour dark** (aliases of `--paper`, `--ink`, `--faint`, `--line`, `--surface`, plus `--surface-2` `#1b1b1a`; Newsreader and the system sans). The shell owns the page background (`--paper`) and everything outside the story's `<article>` | `nodes/0.<hash>.js` |
| `routes/+error.svelte` | Shown if a route fails | `nodes/1.<hash>.js` + `assets/1.<hash>.css` |
| `routes/+page.js` | Runs at build time: imports `content/doc.json`, stops a production build if a block can't be rendered, and hands the doc to the page as `data.doc` | Inlined into `index.html` |
| `routes/+page.svelte` | **The story page.** Hands the doc's `body` to `<Blocks>` and sets the title from the Header block | `nodes/2.<hash>.js` + `assets/2.<hash>.css` |
| `lib/assets.js` | **Generated.** `ASSET_BASE` is `/big_assets` in dev and `./_big_assets.<hash>` in production, plus an `asset(path)` helper. Committed, so `npm run dev` works on a fresh clone | Bundled into a chunk |
| `lib/scroll.js` | The shared scroll engine. Since S4 it's **GSAP ScrollTrigger 3.12.5**, the shipped page's library:<br>• `loadScrollTrigger()` dynamic-imports `gsap` + `gsap/ScrollTrigger` once for the page, and sets up one `ResizeObserver` that calls `ScrollTrigger.refresh()` when the layout changes;<br>• `trackBounds(sticky)` gives a track's `start` (its top meets the panel's CSS `top`, the masthead) and `end` (its bottom meets the panel's bottom), so progress is the same formula the chunk 8 engine used;<br>• `stepOf()` is unchanged and unit-tested.<br>ScrollTrigger only reads progress; CSS `position: sticky` does the pinning. Chunk 8's hand-written `progressOf()` / `onScrollFrame()` engine was removed | Two chunks (gsap 70 KB, ScrollTrigger 43 KB; 28 + 18 KB gzipped), loaded after hydration |
| `lib/lottie.js` | Loads `lottie-web` on demand (its own chunk). `playOnce()` for the header (chunk 11). `scrubber()` resolves to `seek(p)` once the animation is ready, and **rejects** if the JSON fails, so the caller can keep its text fallback. ✅ Used by `ScrubStage` | A lazy chunk, once imported |
| `lib/media.js` | `srcset(value)` turns a doc srcset (`"images/a-400w.webp 400w, images/a.webp 800w"`) into hashed media URLs (chunk 10, string form since S1) | Bundled into the components |
| `$kit/Blocks.svelte` | **The renderer** (S1), shared; `+page.svelte` passes it this template's `registry`: walks the doc's `body`. A text block becomes `Text`, a svelte block becomes its registered component with the flat props spread on. Unknown names show a placeholder in dev | Bundled into the page |
| `lib/blocks.js` | **The registry** (S1): component name → component, plus `docProblems(body)`, which `+page.js` uses to stop a production build on an unknown block | Bundled into the page |
| `$kit/doc.js` | `series(props, fields)` rebuilds a list from numbered keys (`heading1`, `heading2`…); `list(str)` splits a comma-separated string (S1) | Bundled into the components |
| `$kit/inline-html.js` | The **allow-list** for inline HTML in text blocks: `<em>`, `<strong>`, safe `<a href>`; everything else is escaped. Tested by `inline-html.test.js` (`npm test`) (S1) | Bundled into `Text` |

### `src/lib/components/`: one component per block type

Each component owns its markup and a **scoped** `<style>` (Svelte adds a unique class, so styles can't leak). The **Status** column
shows which prototype chunk each one mirrors (see §11).

| Component | Renders | Status |
|-----------|---------|--------|
| `Header.svelte` | Kicker, headline, dek and the art stage. A fixed 675px box, height-scaled **twin** art (portrait for phones, landscape for desktop), and the intro fade-up after `document.fonts.ready` (via an `{@attach}`) | ✅ Ported (chunks 4–6). Hero Lottie twins play once over the SVG poster, which stays for no JS and reduced motion (chunk 11) |
| `Byline.svelte` | "By … · `<time>`" in the text column | ✅ Ported (chunks 1–2) |
| `$kit/Text.svelte` (shared, in `projects/birdkit-kit/`) | One `<p class="g-text">` at `width: var(--col)` | ✅ Ported (chunk 2) |
| `Credits.svelte` | The footer line | ✅ Ported (chunk 2) |
| `TwoUp.svelte` | Two images + one shared caption, full bleed. The `<figure>` is the flex container: stacked, then a row at the 740px tablet tier, capped at 1440px with 64px padding from the 1150px desktop tier (S3) | ✅ Ported (chunk 6) |
| `Diagram.svelte` | The process as an `<ol>`. At ≥740px (the tablet tier, since S3) a 4-column stage (≤1200px), with curved SVG arrows drawn from the boxes' live positions by an `{@attach}` ResizeObserver | ✅ Ported (chunk 7) |
| `StickyScroller.svelte` | The shared track + sticky panel, named like the blueprint's (was `Scrolly.svelte` until S4). Passes `{ step, progress, enhanced }` to its content through a **snippet**. Includes a visually hidden list of every step for screen readers. The panel pins at `top: var(--masthead-h)` (S2), which is 0 since S4b: the measured masthead scrolls away, so panels pin to the top of the screen as on the shipped page. Track height is the doc's `height`, or `steps × 135svh`. Props: `label`, `steps`, `height`, `stepTexts`, `class`, `showProgress` | ✅ One ScrollTrigger per track in an `{@attach}`, killed on destroy (S4). The bar is `transform: scaleX(progress)`, with markers at `i / steps`. `data-enhanced` is set only after GSAP loads; if it never loads, the no-JS stack stays |
| `SlidesScrolly.svelte` | Section A: six frames, server-rendered (never `innerHTML`) | ✅ Hard cuts, vw card, arrow custom-property API (chunk 9) |
| `CaptionScrolly.svelte` | Section B: images + captions | ✅ 30vh caption area on phones, 65vh band from 740px (S3), 0.4s caption fades, hard-cut images (chunk 9) |
| `PaintingsScrolly.svelte` | Section C: items + per-step layouts from `doc.json` | ✅ Per-step `%` layouts, 0.95s settle, ×1.6 in portrait via a `matchMedia` `{@attach}` (chunk 9) |
| `ScrubLottie.svelte` | Section D: two `Scrolly` runways, one per twin (`class="desktop-only"` / `"mobile-only"`, `bar={false}`) | ✅ Scrubbing (chunk 10) |
| `ScrubStage.svelte` | One twin's stage. An `{@attach}` **loads** the Lottie when the stage is within 200px (a hidden twin never loads); an `$effect` **feeds** it `progress`. Reduced motion holds the end frame. Text fallback stays visible if loading fails | ✅ (chunk 10) |

"⏳" components already render the **readable, no-JS version** of their block, which is the base state every enhancement builds on.

---

## 5. Content: `doc.json`

Since NYT sandbox chunk S1, the story is one **content document** in the shape of the shipped NYT page's payload
([`reference/nyt-sandbox-blueprint.md`](reference/nyt-sandbox-blueprint.md) §5): an ordered **`body`** of two kinds of block.

```jsonc
{
  "slug": "the-second-draft",
  "theme": "diatour",                                   // color theme (chunk S3): "diatour" (dark) or "opinion" (light)
  "body": [
    { "type": "svelte", "value": { "component": "Header", "kicker": "Our Opinions", "kind": "Guest Essay · Demo",
        "headline": "The Second Draft", "dek": "…",
        "url": "videos/hero/hero-desktop.json", "urlMobile": "videos/hero/hero-mobile.json" } },
    { "type": "svelte", "value": { "component": "Byline", "author": "A. Writer", "date": "2026-10-01", "dateText": "Oct. 1, 2026" } },
    { "type": "text", "value": "Every essay you have read…" },
    { "type": "svelte", "value": { "component": "TwoUp", "label": "…",
        "url1": "images/two-up-draft-1.webp", "alt1": "…", "width1": 800, "height1": 1000,
        "srcset1": "images/two-up-draft-1-400w.webp 400w, images/two-up-draft-1.webp 800w",
        "url2": "…", "alt2": "…", "width2": 800, "height2": 1000, "srcset2": "…",
        "sizes": "(min-width: 1150px) 656px, (min-width: 740px) 50vw, 100vw", "groupCaption": "…", "credit": "…" } },
    { "type": "svelte", "value": { "component": "Diagram", "label": "…", "label1": "Idea", "label2": "Draft", "label3": "Revise", "label4": "Ship" } },
    { "type": "svelte", "value": { "component": "SlidesScrolly", "label": "…",
        "heading1": "Version 1", "card1": "Explains", "image1": "images/slides/slide-1/slide.jpg", "alt1": "…", "heading2": "…" } },
    { "type": "svelte", "value": { "component": "CaptionScrolly", "label": "…", "image1": "…", "srcset1": "…", "alt1": "…", "caption1": "…", "sizes": "…" } },
    { "type": "svelte", "value": { "component": "PaintingsScrolly", "label": "…", "image1": "…", "alt1": "…", "caption1": "…",
        "portraitScale": 1.6, "layouts": [[{ "top": 25, "left": 6, "width": 37.5, "rot": 0, "op": 0.15, "z": 2 }, …], …] } },
    { "type": "svelte", "value": { "component": "ScrubLottie", "label": "…", "steps": 2.5,
        "desktop": "videos/scrub-desktop.json", "mobile": "videos/scrub-mobile.json", "fallback": "…" } },
    { "type": "svelte", "value": { "component": "Credits", "text": "Demo content. …" } }
  ]
}
```

**The rules, as on the real page:**

- **Text blocks** are one paragraph each. They may carry a little inline HTML: `<em>`, `<strong>` and `<a href>` (http, https, `/path` or `#anchor`). Anything else is shown as text, never run ([`$lib/inline-html.js`](../projects/interactive/src/lib/inline-html.js), with tests).
- **Svelte blocks** name a component, and every setting is a **flat key/value pair**: that's how doc-converted content arrives. A list of things becomes **numbered keys** (`heading1`, `card1`, `heading2`…); components rebuild the list with `series()` from `$lib/doc.js`. Numbered keys survive commas inside a caption, which a comma-separated list wouldn't.
- **Comma-separated strings** are used only where the value already is one in HTML (`srcset`).
- **Order is the page.** The renderer walks `body` top to bottom. Header, byline and credits are blocks like any other.
- **One exception, for now:** `PaintingsScrolly`'s per-step `layouts` are nested numbers with no flat form. They move to the doc's `sheets` data slot in chunk S6.

| Component | Props | Notes for designers |
|-----------|-------|---------------------|
| `Header` | `kicker`, `kind`, `headline`, `dek`, `url`, `urlMobile` | `url` / `urlMobile` are the hero Lottie twins; the SVG in the component is their poster |
| `Byline` | `author`, `date` (ISO), `dateText` | |
| `TwoUp` | `url1`/`url2`, `alt1`/`alt2`, `width1`… `height1`…, `srcset1`/`srcset2`, `sizes`, `groupCaption`, `credit`, `label` | Images at **4:5**. `width`/`height` reserve space so nothing jumps. `srcset` lists each file with its width, `sizes` describes the slot |
| `Diagram` | `label` (the section's name), `label1`… (the boxes, in order) | 3–6 short labels |
| `SlidesScrolly` | `label`, `height` (optional), then per slide `headingN`, `cardN`, `imageN`, `altN` | One square image per step. Each step ≈ 1.35 screens of scrolling, unless `height` sets the whole track (e.g. `"900svh"`, as on the shipped page) |
| `CaptionScrolly` | `label`, `height` (optional), `sizes`, then per page `imageN`, `srcsetN`, `altN`, `captionN` | Write captions to fit about 80px. The longest one sets the overlay height |
| `PaintingsScrolly` | `label`, `height` (optional), `imageN`/`altN` (the cards), `captionN` (the steps), `layouts`, `portraitScale` | One layout per step per card: `top`, `left` *or* `right`, `width` in **% of the stage**, `rot` in degrees, `op` 0–1, `z` |
| `ScrubLottie` | `label`, `steps` (runway length), `height` (optional, overrides `steps × 135svh`), `desktop`, `mobile`, `fallback` | Landscape and portrait exports. `fallback` is the sentence shown without JS, and read by screen readers once the animation shows |
| `Credits` | `text` | |

**A name the renderer doesn't know** (a typo, or a component that isn't registered) shows a dashed
"Missing component: X" placeholder in `npm run dev`, and **stops `npm run build`** with the block's position, e.g.
`body[8]: missing component "Diagramm"`. A missing section can't ship silently.

**Media paths in `doc.json` are relative to `big_assets/`** (`images/…`, `videos/…`). Components turn them into full URLs with
`asset(path)`, so the same file works in dev and production.

At the Times, editors write this in a Google Doc using **ArchieML**, and a build step converts it. Chunk S7 adds that step here.

**History:** until chunk S1 the same words lived in `content/story.json`, with typed blocks and nested lists. A one-time
migration (`scripts/migrations/2026-10-02-story-to-doc.js`, removed once it had run; it's in git history)
moved them, checking that all 105 strings arrived unchanged. The rendered page was identical before and after.

---

## 6. Media: `big_assets/`

| Folder | Holds | Rule |
|--------|-------|------|
| `images/` | Photos and illustrations as `.webp`, plus scroll section A's slides as `slides/slide-N/*.jpg` | One file per use. Size images close to their display size |
| `videos/` | **Lottie JSON** (motion as data): `hero/hero-desktop.json` / `hero-mobile.json` (header intro, plays once, ends on the SVG poster), `scrub-desktop.json` / `scrub-mobile.json` (section D) | Twins: landscape for desktop, portrait for mobile |
| `videos/images/diagram/` | Image frames that a Lottie file references by path | Keep them beside their Lottie |
| `scripts/` | Small standalone helper scripts loaded by URL | Hashed and copied like any media |

**How a media URL is built:**

```
doc.json:        "url1": "images/two-up-draft-1.webp"
component:       asset(img.url)
dev:             /big_assets/images/two-up-draft-1.webp                 (served raw by Vite, no build needed)
production:      ./_big_assets.d09a166288/images/two-up-draft-1.webp    (next to index.html, cached forever)
```

The hash (`d09a166288` here) is computed from **every file's path and bytes**. Change one pixel and the hash changes, so the folder gets a
new name and no reader ever sees a stale cached image. Files starting with `.` (like `.gitkeep`) are skipped.

All media in this repo is **placeholder**: canvas-drawn images labelled "PLACEHOLDER," and three tiny hand-written Lottie files (a dot moving across the frame).

---

## 7. The build pipeline, step by step

`npm run build` runs three commands in order:

```
npm run build
│
├─ 1. node ../birdkit-kit/hash-assets.js
│     hash big_assets/ → d09a166288
│     write src/lib/assets.js  (ASSET_BASE = dev ? '/big_assets' : './_big_assets.d09a166288')
│
├─ 2. vite build
│     ├─ client build   src/ → .svelte-kit/output/client/_app.<build-hash>/immutable/{entry,nodes,chunks,assets}
│     ├─ server build   src/ → .svelte-kit/output/server/   (used only to render HTML, never shipped)
│     ├─ prerender      runs the server build on "/", crawling every link → index.html with the full story inside
│     └─ adapter-static EMPTIES dist/, then writes index.html + _app.<build-hash>/ + static files into it
│
└─ 3. node ../birdkit-kit/hash-assets.js --copy
      copy big_assets/ → dist/_big_assets.d09a166288/
      verify: every _big_assets URL in index.html exists → "verified 16 media URLs"
```

**Why the build hash must be computed once.** SvelteKit loads `svelte.config.js` several times per build (client build,
server build, and a separate process for prerendering). If each load made its own hash, the client and server would disagree on the
folder name. See fix 1 in §10.

---

## 8. The output tree, file by file

Measured from an actual `npm run build`:

```
dist/                                              total ≈ 465 KB
├─ index.html                                      16 KB  the whole story, readable with JavaScript off
├─ favicon.png                                            from static/
├─ _app.<build-hash>/                              172 KB new name every build
│  ├─ version.json                                        {"version":"<timestamp>"}, lets a long-open page detect a new deploy
│  └─ immutable/
│     ├─ entry/start.<hash>.js                            SvelteKit client runtime (boots hydration)
│     ├─ entry/app.<hash>.js                              app manifest and router
│     ├─ nodes/0.<hash>.js                                +layout.svelte
│     ├─ nodes/1.<hash>.js                                +error.svelte
│     ├─ nodes/2.<hash>.js                                +page.svelte (the story)
│     ├─ chunks/<hash>.js ×9                              shared code: Svelte runtime, components, helpers
│     ├─ assets/0.<hash>.css                              app.css (global tokens), via the layout
│     ├─ assets/1.<hash>.css                              error page styles
│     └─ assets/2.<hash>.css                              every story component's scoped CSS, merged
└─ _big_assets.<content-hash>/                     276 KB new name only when media changes
   ├─ images/ …                                           16 images (two-up, marked-up pages, arguments, 6 slides)
   └─ videos/ …                                           3 Lottie files + 2 diagram frames
```

### Source → output map

| Source | Output |
|--------|--------|
| `src/routes/+layout.svelte` (+ `app.css`) | `nodes/0.<hash>.js` + `assets/0.<hash>.css` |
| `src/routes/+error.svelte` | `nodes/1.<hash>.js` + `assets/1.<hash>.css` |
| `src/routes/+page.svelte` + every component | `nodes/2.<hash>.js` + `assets/2.<hash>.css` |
| Svelte runtime, `$lib/*`, shared component code | `chunks/<hash>.js` |
| `src/app.html` + prerendered page + `doc.json` | `index.html` |
| `static/*` | `dist/*`, unchanged |
| `big_assets/**` | `_big_assets.<content-hash>/**`, unchanged |

**Where it differs from the spec:** the spec lists only `assets/2.<hash>.css`. Ours also has `0.css` (the global `app.css`
imported by the layout) and `1.css` (the error page). Same mechanism, one CSS file per node that has styles.

### What a reader's browser does

1. Downloads `index.html` and paints the full story immediately. No JavaScript needed to read.
2. Downloads `_app.…/entry/start.js` and the node and chunk files it imports, then **hydrates**: Svelte attaches behavior to the
   existing HTML without re-rendering it. The header intro starts here.
3. Downloads media from `_big_assets.…/` as images come near the screen (`loading="lazy"`).

---

## 9. Caching and deploying

| Path | `Cache-Control` | Why it's safe |
|------|-----------------|---------------|
| `_app.<build-hash>/**` | `public, max-age=31536000, immutable` | A new build has a new folder name. Old URLs never change content |
| `_big_assets.<content-hash>/**` | `public, max-age=31536000, immutable` | New media gives a new hash, so a new folder name |
| `index.html` | `public, max-age=60` (or purge on deploy) | Changes in place. It points at the current folders |
| `favicon.png` and anything else from `static/` | `public, max-age=60` | Unhashed, so it must stay short-lived. The spec says `index.html` is the only unhashed file, which holds only while `static/` is empty |

**Upload order:** hashed folders first, other unhashed files next, `index.html` last. Until the new `index.html` lands, readers get the old page, which
points at old folders that are still present. Nobody ever gets HTML whose files aren't uploaded yet.

`npm run deploy` prints exactly this plan (path, size, header, order). It's a dry run. Replace `upload()` in
`scripts/deploy.js` with your host's CLI or SDK (S3, GCS, Netlify, Cloudflare Pages, GitHub Pages) to deploy for real.

---

## 10. Four fixes to the spec

Building the spec exactly as written turned up four problems. Each is fixed in the code with a comment and listed here.

| # | Spec said | What went wrong | Fix |
|---|-----------|-----------------|-----|
| 1 | `buildHash = hash(Date.now())` at the top of `svelte.config.js` | The config is loaded several times per build. The client build went to `_app.eJHU…` and the server build to `_app.dcTc…` | Compute once, keep it in `process.env.BUILD_HASH`, and reuse it in later loads and child processes. Verified: one hash across the client, server and `dist/` |
| 2 | `build: npm run assets && vite build`, with `hash-assets.js` copying media into `dist/` | adapter-static **empties `dist/`** when it writes, so media copied before the build gets deleted | Split the script: hash + write `assets.js` **before**, copy **after** (`--copy`) |
| 3 | `prerender: { entries: ['*'] }` | The prerender crawler follows every `<img src>`. The media folder doesn't exist yet at crawl time, so the build fails with 404s | `handleHttpError` skips `/_big_assets.` URLs only, and `--copy` then verifies every media URL in `index.html` exists (the build fails if one doesn't) |
| 4 | `ASSET_BASE = '<cdn>/_big_assets.<hash>'`, swapped to the hashed folder only for production | An absolute CDN URL breaks local preview and any host move, and a committed production value would break `npm run dev` | The generated `assets.js` contains **both** values, `dev ? '/big_assets' : './_big_assets.<hash>'`, relative so `dist/` works under any path. Verified served from `/projects/interactive/` |

Also found by running the deploy plan: the first `deploy.js` marked every file except `index.html` as immutable, including the
unhashed `favicon.png`, so a new favicon would never reach readers. Now only `_app.*` and `_big_assets.*` are immutable.

Smaller notes: `vite.config.js` also lists `src`, `node_modules` and `.svelte-kit` in `fs.allow` (harmless, and it keeps defaults
explicit). `lottie.js` imports the **light** player (`lottie_light.js`), which is smaller and covers shape-based animations like ours.

---

## 11. How the prototype and the project stay in sync

```
Phase 1 chunk N:  build it in prototype/index.html  →  checkpoint passes in DevTools  →  port it into projects/interactive/
```

| Prototype (plain HTML/CSS/JS) | Story project (SvelteKit) |
|-------------------------------|---------------------------|
| `:root` tokens in `<style>` | `src/app.css` |
| A block's CSS rules | That component's `<style>` (scoped) |
| A block's HTML | That component's markup, fed by `doc.json` |
| `<script>` behavior | An `{@attach}` function in the component (runs in the browser only, after the element exists) |
| `<head>` script (`.js`, failsafe) | `src/app.html` |
| `.js .headline` | `:global(.js) .headline` (the class lives on `<html>`, outside the component) |

Each ⏳ component's top comment said which chunk finishes it. When that chunk's checkpoint passed in the prototype, its rules
and behavior were ported, and the comment and the §4 table changed to ✅. As of chunk 11, every component is ✅.

**Proving they match: `npm run parity`** (`scripts/parity.js`). It serves `prototype/` and `dist/` with a tiny static server,
opens both in headless Chromium at 375, 1024 and 1440px, and compares column width, header height, headline size, two-up
direction and image widths, diagram width, every runway's height, page height, and the scroll offsets where runway A's
steps change. It exits with code 1 if anything differs by more than 1px. Its first run found a real bug: enhanced runways
in the project kept the no-JS stack's 40px margins, which made the page 270px taller (fixed in `Scrolly.svelte`, now `StickyScroller.svelte`).

Since NYT sandbox S2, the project renders inside a mock platform shell the prototype never had. Parity switches the shell
off before measuring (no `.masthead-container` or `#standalone-footer`, `--masthead-h: 0`), so it still answers the question it was built for: is the
*story* the Phase 1 page? The shell is checked separately (learning log 21).

Since S3 the project switches layout at the NYT tiers (740 and 1150) while the prototype keeps its original 640 / 768 /
1024 / 1250 breakpoints. Parity's three widths sit on the same side of both sets (375 is a phone in both, 1024 is landscape
in both, 1440 is desktop in both), so it still compares like with like. Widths between the two sets (for example 800) now
differ **on purpose**. The tier switches themselves are checked by the breakpoint matrix in learning log 23.

Three things exist only in the project: the header's intro Lottie, `srcset` driven by `doc.json`, and the platform shell. The prototype stays
as the hand-built reference.

---

## 12. How to…

**Edit copy.** Change the text in `content/doc.json`, and `npm run dev` reloads. No component changes.

**Replace an image.** Drop the new file into `big_assets/images/` (the same name, or update the path in `doc.json`) and keep its
aspect ratio, or update `width`/`height`. The next build gets a new `_big_assets` hash automatically.

**Add a new kind of block.**
1. Add it to `doc.json`'s `body`: `{ "type": "svelte", "value": { "component": "PullQuote", "text": "…", "cite": "…" } }`.
2. Create `src/lib/components/PullQuote.svelte`: markup from flat props, a scoped `<style>`, tokens only.
3. Register it in `src/lib/blocks.js`: add `PullQuote` to `registry`. (Until you do, dev shows "Missing component: PullQuote" and the build stops.)
4. Check it reads correctly **with JavaScript off** (`npm run build && npm run preview`, then disable JS in DevTools).

**Add another scroll section.** Only `doc.json` changes. Insert a block naming an existing scene component, and the runway,
step list, progress markers and scene come from the components. For example, a second `PaintingsScrolly`:
```json
{ "type": "svelte", "value": { "component": "PaintingsScrolly", "label": "…",
  "image1": "images/argument-a.webp", "alt1": "…", "image2": "images/argument-b.webp", "alt2": "…",
  "caption1": "…", "caption2": "…",
  "layouts": [
    [{ "top": 20, "left": 10, "width": 35, "rot": -2, "op": 1, "z": 2 }, { "top": 20, "right": 10, "width": 35, "rot": 2, "op": 0.4, "z": 1 }],
    [{ "top": 25, "left": 30, "width": 30, "rot": 0, "op": 0.4, "z": 1 }, { "top": 15, "right": 25, "width": 40, "rot": -3, "op": 1, "z": 2 }]
  ] } }
```
Chunk 11 tested the same section (in the old `story.json` form) in a scratch copy: a 2-step runway (2430px at 900px tall),
2 markers, captions following the scroll, and no component edits (learning log 16).

**Start a second story.** Copy the folder to `projects/<new-slug>/`, change `name` in `package.json`, replace `content/doc.json` and
`big_assets/`, then `npm install && npm run dev`.

**Check the production build like a reader.**
```bash
npm run build && npm run preview
# DevTools: Network tab (only hashed files + index.html), Disable JavaScript (story still reads), Lighthouse
```

**See exactly what the build produced.**
```bash
find dist -type f | sort
```

---

## 13. Spec checklist

| Spec item | Status |
|-----------|--------|
| Source tree: every file and folder in the spec | ✅ Present (plus `package-lock.json`) |
| `npm run dev / assets / build / preview / deploy` | ✅ All run (`build` gains the `--copy` step) |
| Output: `index.html` prerendered, readable without JS | ✅ Verified (headline, 10 paragraphs, 16 images, diagram list, all frames) |
| Output: `_app.<build-hash>/version.json` + `immutable/{entry,nodes,chunks,assets}` | ✅ `start`/`app` entries, nodes 0/1/2, 9 chunks, CSS per node |
| Output: `_big_assets.<content-hash>/{images,videos,scripts}` | ✅ The hash is stable across builds until media changes |
| Relative paths: works under `<cdn>/projects/<project-id>/` | ✅ Verified from `/projects/interactive/`: all files load, the page hydrates |
| Dev serves media from `/big_assets` without a build | ✅ Verified |
| Scroll mechanics from `scrolly-template.html` | ✅ All four scenes ported (chunks 8–10). `npm run parity` matches the prototype within 1px at 375 / 1024 / 1440 |
| Header Lottie | ✅ Twins (`hero-desktop.json` / `hero-mobile.json`) play once (chunk 11). The SVG art is the poster: no JS, reduced motion, and the animation's last frame |

---

## 14. Glossary

| Term | Meaning here |
|------|-------------|
| **Adapter** | The SvelteKit plugin that decides the output format. `adapter-static` writes plain files, with no server needed |
| **`appDir`** | The name of the folder holding the app's code. We set it to `_app.<build-hash>` |
| **Attachment (`{@attach}`)** | A Svelte 5 function that runs on an element in the browser after it's created, the safe place for DOM work (observers, fonts, Lottie) |
| **Build hash / content hash** | A short fingerprint. *Build* hash: new every build. *Content* hash: changes only when the files change |
| **Chunk** | A JavaScript file of code shared between pages or components, split out by Vite |
| **Hydration** | Svelte attaching behavior to HTML that was already rendered at build time, without re-drawing it |
| **Immutable cache** | Telling browsers and CDNs a URL's content will never change, so they keep it for a year without checking |
| **Lottie** | An animation format (JSON exported from After Effects) played by `lottie-web` in the browser |
| **Node** | SvelteKit's compiled file for one layout, page or error page (`nodes/0`, `1`, `2`) |
| **Prerender** | Running the page at build time and saving the resulting HTML, so readers get finished markup |
| **Scoped CSS** | Styles in a component's `<style>` apply only to that component. Svelte adds a unique class to enforce it |
| **Snippet (`{#snippet}` / `{@render}`)** | Svelte 5's way to pass markup *with arguments* into a component. `Scrolly` passes `{ step, progress }` to its content |
| **`svh`** | "Small viewport height": the screen height with phone browser bars showing. Stable while those bars hide and show |
| **Twins** | Separate mobile and desktop versions of a visual, one hidden by CSS, like ai2html artboards |
