# Project structure: how a Birdkit-style story project is organized, built and shipped

This guide explains **every folder and file** in the story project at `projects/the-second-draft/`. That project reproduces the
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
5. [Content: `story.json`](#5-content-storyjson)
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
├─ .claude/skills/              vendored Svelte skills for Claude Code (MIT, see its README)
├─ docs/                        everything you read: plans, references, learning log, this guide
│  ├─ plan/                     Phase 1 (hand-built, 10 chunks) and Phase 2 (Times-shaped stack)
│  ├─ reference/                source material: the scrolly template, its breakdown, the build spec, diatour analysis
│  ├─ learning-log/             one entry per step: what was built, what broke, what it taught
│  └─ project-structure.md      ← you are here
├─ prototype/
│  └─ index.html                PHASE 1 SANDBOX: plain HTML/CSS/JS, one idea per chunk, checked in DevTools
└─ projects/
   └─ the-second-draft/         THE STORY PROJECT: Birdkit-style SvelteKit build of the same page
```

| Folder | Role | You work here when… |
|--------|------|---------------------|
| `prototype/` | Learning sandbox. One file, no build step, so every idea is visible in DevTools | Doing a Phase 1 chunk |
| `projects/the-second-draft/` | The production-shaped story. Same page, as components, content data and a real build | Porting a chunk that passed, or editing copy and media |
| `docs/` | The written explanation of all of it | Learning, or deciding what to build next |

---

## 2. Why each story is its own project

At the Times, an immersive story built by the graphics desk is a **self-contained project**: its own source folder, its own build,
deployed to its own path on the CDN:

```
<cdn>/projects/<project-id>/index.html
<cdn>/projects/<project-id>/_app.<build-hash>/…
<cdn>/projects/<project-id>/_big_assets.<content-hash>/…
```

That's why our project lives at `projects/the-second-draft/`. A second story would be `projects/<another-slug>/`, a copy of the
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
cd projects/the-second-draft
npm install            # once
npm run dev            # http://localhost:5173: live reload, media served from big_assets/
npm run build          # writes dist/ (see §7)
npm run preview        # serves dist/ locally, as a reader would get it
npm run deploy         # prints the upload plan with cache headers (dry run, see §9)
```

Requirements: Node 22+. Versions are pinned to the spec's ranges: SvelteKit 2, Svelte 5, Vite 6, adapter-static 3,
vite-plugin-svelte 5, lottie-web 5.

---

## 4. The source tree, file by file

```
projects/the-second-draft/
├─ package.json
├─ package-lock.json
├─ svelte.config.js
├─ vite.config.js
├─ .gitignore
├─ README.md
├─ content/
│  └─ story.json
├─ big_assets/
│  ├─ images/
│  │  ├─ two-up-draft-1.webp, two-up-draft-4.webp
│  │  ├─ marked-up-1 … 5.webp
│  │  ├─ argument-a, b, c.webp
│  │  └─ slides/slide-1 … slide-6/slide.jpg
│  ├─ videos/
│  │  ├─ hero/hero.json
│  │  ├─ scrub-desktop.json
│  │  ├─ scrub-mobile.json
│  │  └─ images/diagram/frame-1, 2.webp
│  └─ scripts/                  (empty for now; .gitkeep)
├─ scripts/
│  ├─ hash-assets.js
│  └─ deploy.js
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
      ├─ scroll.js
      ├─ lottie.js
      └─ components/
         ├─ Header.svelte, Byline.svelte, Text.svelte, Credits.svelte
         ├─ TwoUp.svelte, Diagram.svelte
         ├─ Scrolly.svelte
         ├─ SlidesScrolly.svelte, CaptionScrolly.svelte, PaintingsScrolly.svelte
         └─ ScrubLottie.svelte
```

### Project root

| File | What it is | Why / what you'd change |
|------|-----------|-------------------------|
| `package.json` | The project's name, scripts and dependencies | `build` runs three steps: `hash-assets` → `vite build` → `hash-assets --copy` (§7). `lottie-web` is the only runtime dependency |
| `package-lock.json` | Exact installed versions | Committed, so everyone builds with the same versions. Never edit by hand |
| `svelte.config.js` | SvelteKit settings | The four settings that *produce the output tree*: `adapter-static` (writes `dist/`), `appDir` (names `_app.<hash>`), `paths.relative` (relative URLs), `prerender` (bakes HTML), plus `bundleStrategy: 'split'` (separate `entry/`, `nodes/`, `chunks/`). Every line is commented |
| `vite.config.js` | Vite settings | Adds the SvelteKit plugin and lets the dev server read `content/` and `big_assets/` (`server.fs.allow`) |
| `.gitignore` | What Git skips | `dist/`, `.svelte-kit/` and `node_modules/` are all regenerated, never committed |
| `README.md` | The project's front door | Commands and a link back to this guide |

### `content/`: the words

| File | What it is |
|------|-----------|
| `story.json` | The whole story **as data**: header, byline, an ordered list of `blocks`, and credits. It's the only file an editor needs. See §5 |

### `big_assets/`: the media

Raw images, Lottie animations and helper scripts. It sits **outside `src/` and `static/` on purpose**: Vite never bundles or
renames these files. Instead `scripts/hash-assets.js` gives the whole folder one content hash and copies it next to the page. See §6.

### `scripts/`: build helpers (run by Node, never shipped)

| File | What it does |
|------|-------------|
| `hash-assets.js` | **Before the build:** hashes every file in `big_assets/` (paths + bytes) and writes `src/lib/assets.js` with the media URL. **After the build (`--copy`):** copies the folder to `dist/_big_assets.<hash>/`, then checks that every media URL in `index.html` points at a real file |
| `deploy.js` | Prints the upload plan: every file in `dist/` with its `Cache-Control` header, hashed folders first and `index.html` last. Swap its `upload()` function for your host's CLI to deploy for real (§9) |

### `static/`

| File | What it is |
|------|-----------|
| `favicon.png` | Copied to `dist/` unchanged. `static/` is for the few files that must keep their exact name and path. Story media does **not** go here |

### `src/`: the code

| File | What it is | Becomes in `dist/` |
|------|-----------|--------------------|
| `app.html` | The document shell around every page. Holds `<html lang>`, the viewport meta, the **chunk 5 `<head>` script** (`.js` class + 2.5s failsafe), the Google Fonts link, and the `%sveltekit.head%` / `%sveltekit.body%` slots SvelteKit fills | The outside of `index.html` |
| `app.css` | **Global** tokens and base rules: gutter, column, type, color (diatour), easing, header sizes, `overflow-x: clip`, the `.bleed` and `.visually-hidden` utilities, and the **twin utilities** (`.mobile-only` / `.desktop-only`, deliberately the last rules in the file). Ported from the prototype's chunks 2–6 | `assets/0.<hash>.css` |
| `routes/+layout.js` | `prerender = true` (render to HTML at build time) and `trailingSlash = 'never'` (so `/` becomes `index.html`) | Build settings, no file of its own |
| `routes/+layout.svelte` | The root layout: imports `app.css` once and renders the page inside it | `nodes/0.<hash>.js` |
| `routes/+error.svelte` | Shown if a route fails | `nodes/1.<hash>.js` + `assets/1.<hash>.css` |
| `routes/+page.js` | Runs at build time: imports `content/story.json` and hands it to the page as `data.story` | Inlined into `index.html` |
| `routes/+page.svelte` | **The story page.** A loop over `story.blocks`, where each block's `type` (and `scene` for scroll sections) picks a component from the `BLOCKS` map | `nodes/2.<hash>.js` + `assets/2.<hash>.css` |
| `lib/assets.js` | **Generated.** `ASSET_BASE` is `/big_assets` in dev and `./_big_assets.<hash>` in production, plus an `asset(path)` helper. Committed, so `npm run dev` works on a fresh clone | Bundled into a chunk |
| `lib/scroll.js` | The shared scroll engine: `progressOf()`, `stepOf()`, `onScrollFrame()` (rAF-throttled). ✅ Wired up by `Scrolly.svelte` (chunk 8). `progressOf` defaults to the runway's `.sticky`, not its first child (the first child is the hidden step list) | A chunk, once imported |
| `lib/lottie.js` | Loads `lottie-web` on demand (its own chunk). `playOnce()` for the header, `scrubber()` returns `setProgress(p)` for scroll-scrubbing. Wired up when chunk 10 passes | A lazy chunk, once imported |

### `src/lib/components/`: one component per block type

Each component owns its markup and a **scoped** `<style>` (Svelte adds a unique class, so styles can't leak). The **Status** column
shows which prototype chunk each one mirrors (see §11).

| Component | Renders | Status |
|-----------|---------|--------|
| `Header.svelte` | Kicker, headline, dek and the art stage. A fixed 675px box, height-scaled **twin** art (portrait for phones, landscape for desktop), and the intro fade-up after `document.fonts.ready` (via an `{@attach}`) | ✅ Ported (chunks 4–6) |
| `Byline.svelte` | "By … · `<time>`" in the text column | ✅ Ported (chunks 1–2) |
| `Text.svelte` | One `<p class="g-text">` at `width: var(--col)` | ✅ Ported (chunk 2) |
| `Credits.svelte` | The footer line | ✅ Ported (chunk 2) |
| `TwoUp.svelte` | Two images + one shared caption, full bleed. The `<figure>` is the flex container: stacked, then a row at 640px, capped at 1440px from 1250px | ✅ Ported (chunk 6) |
| `Diagram.svelte` | The process as an `<ol>`. At ≥1024px a 4-column stage (≤1200px), with curved SVG arrows drawn from the boxes' live positions by an `{@attach}` ResizeObserver | ✅ Ported (chunk 7) |
| `Scrolly.svelte` | The shared runway + sticky panel. Passes `{ step, progress }` to its content through a **snippet**. Includes a visually hidden list of every step for screen readers | ✅ Engine ported (chunk 8): `{@attach}` + `data-enhanced`, progress bar and markers. Passes `enhanced` to scenes (chunk 9). No-JS = readable stack |
| `SlidesScrolly.svelte` | Section A: six frames, server-rendered (never `innerHTML`) | ✅ Hard cuts, vw card, arrow custom-property API (chunk 9) |
| `CaptionScrolly.svelte` | Section B: images + captions | ✅ 30vh caption area on phones, 65vh band from 768px, 0.4s caption fades, hard-cut images (chunk 9) |
| `PaintingsScrolly.svelte` | Section C: items + per-step layouts from `story.json` | ✅ Per-step `%` layouts, 0.95s settle, ×1.6 in portrait via a `matchMedia` `{@attach}` (chunk 9) |
| `ScrubLottie.svelte` | Section D: text fallback, with the desktop and mobile Lottie paths ready | ⏳ Scrubbing at chunk 10 |

"⏳" components already render the **readable, no-JS version** of their block, which is the base state every enhancement builds on.

---

## 5. Content: `story.json`

```jsonc
{
  "slug": "the-second-draft",
  "header":  { "kicker": "Our Opinions", "kind": "Guest Essay · Demo", "headline": "The Second Draft", "dek": "…",
               "art": { "lottie": "videos/hero/hero.json" } },
  "byline":  { "author": "A. Writer", "date": "2026-10-01", "dateText": "Oct. 1, 2026" },
  "blocks": [
    { "type": "text", "value": "Every essay you have read…" },
    { "type": "two-up", "label": "…", "images": [{ "src": "images/two-up-draft-1.webp", "alt": "…", "width": 800, "height": 1000 }, …],
      "caption": "…", "credit": "…" },
    { "type": "diagram", "label": "…", "nodes": ["Idea", "Draft", "Revise", "Ship"] },
    { "type": "scrolly", "scene": "slides",    "label": "…", "steps": [{ "heading": "Version 1", "card": "Explains", "image": "images/slides/slide-1/slide.jpg", "alt": "…" }, …] },
    { "type": "scrolly", "scene": "captions",  "label": "…", "steps": [{ "image": "…", "alt": "…", "caption": "…" }, …] },
    { "type": "scrolly", "scene": "paintings", "label": "…", "items": [{ "image": "…", "alt": "…" }, …],
      "steps": [{ "caption": "…", "layout": [{ "top": 25, "left": 6, "width": 37.5, "rot": 0, "op": 0.15, "z": 2 }, …] }, …],
      "portraitScale": 1.6 },
    { "type": "lottie", "mode": "scrub", "label": "…", "steps": 2.5, "desktop": "videos/scrub-desktop.json",
      "mobile": "videos/scrub-mobile.json", "fallback": "…" }
  ],
  "credits": "Demo content. …"
}
```

| Block | Component | Required fields | Notes for designers |
|-------|-----------|-----------------|---------------------|
| `text` | `Text` | `value` | One paragraph. Plain text, so no HTML is injected |
| `two-up` | `TwoUp` | `images[2]` (`src`, `alt`, `width`, `height`), `caption`, `credit`, `label` | Images at **4:5**. `width`/`height` reserve space so nothing jumps |
| `diagram` | `Diagram` | `nodes[]`, `label` | 3–6 short labels, in order |
| `scrolly` + `scene: "slides"` | `SlidesScrolly` | `steps[]` (`heading`, `card`, `image`, `alt`) | One square image per step. Each step ≈ 1.35 screens of scrolling |
| `scrolly` + `scene: "captions"` | `CaptionScrolly` | `steps[]` (`image`, `alt`, `caption`) | Write captions to fit about 80px. The longest one sets the overlay height |
| `scrolly` + `scene: "paintings"` | `PaintingsScrolly` | `items[]`, `steps[]` (`caption`, `layout[]` with `top`, `left` *or* `right`, `width` in **% of the stage**, `rot` in degrees, `op` 0–1, `z`) | One layout per step per item. `portraitScale` widens items on tall screens |
| `lottie` + `mode: "scrub"` | `ScrubLottie` | `desktop`, `mobile` (JSON paths), `steps` (runway length), `fallback` | Landscape and portrait exports. `fallback` is the sentence shown without JS |

**Media paths in `story.json` are relative to `big_assets/`** (`images/…`, `videos/…`). Components turn them into full URLs with
`asset(path)`, so the same file works in dev and production.

At the Times, editors write this in a Google Doc using **ArchieML**. JSON is the same data in a stricter syntax. Phase 2 adds the ArchieML step.

---

## 6. Media: `big_assets/`

| Folder | Holds | Rule |
|--------|-------|------|
| `images/` | Photos and illustrations as `.webp`, plus scroll section A's slides as `slides/slide-N/*.jpg` | One file per use. Size images close to their display size |
| `videos/` | **Lottie JSON** (motion as data): `hero/hero.json` (header), `scrub-desktop.json` / `scrub-mobile.json` (section D) | Twins: landscape for desktop, portrait for mobile |
| `videos/images/diagram/` | Image frames that a Lottie file references by path | Keep them beside their Lottie |
| `scripts/` | Small standalone helper scripts loaded by URL | Hashed and copied like any media |

**How a media URL is built:**

```
story.json:      "src": "images/two-up-draft-1.webp"
component:       asset(img.src)
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
├─ 1. node scripts/hash-assets.js
│     hash big_assets/ → d09a166288
│     write src/lib/assets.js  (ASSET_BASE = dev ? '/big_assets' : './_big_assets.d09a166288')
│
├─ 2. vite build
│     ├─ client build   src/ → .svelte-kit/output/client/_app.<build-hash>/immutable/{entry,nodes,chunks,assets}
│     ├─ server build   src/ → .svelte-kit/output/server/   (used only to render HTML, never shipped)
│     ├─ prerender      runs the server build on "/", crawling every link → index.html with the full story inside
│     └─ adapter-static EMPTIES dist/, then writes index.html + _app.<build-hash>/ + static files into it
│
└─ 3. node scripts/hash-assets.js --copy
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
| `src/app.html` + prerendered page + `story.json` | `index.html` |
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
| 4 | `ASSET_BASE = '<cdn>/_big_assets.<hash>'`, swapped to the hashed folder only for production | An absolute CDN URL breaks local preview and any host move, and a committed production value would break `npm run dev` | The generated `assets.js` contains **both** values, `dev ? '/big_assets' : './_big_assets.<hash>'`, relative so `dist/` works under any path. Verified served from `/projects/the-second-draft/` |

Also found by running the deploy plan: the first `deploy.js` marked every file except `index.html` as immutable, including the
unhashed `favicon.png`, so a new favicon would never reach readers. Now only `_app.*` and `_big_assets.*` are immutable.

Smaller notes: `vite.config.js` also lists `src`, `node_modules` and `.svelte-kit` in `fs.allow` (harmless, and it keeps defaults
explicit). `lottie.js` imports the **light** player (`lottie_light.js`), which is smaller and covers shape-based animations like ours.

---

## 11. How the prototype and the project stay in sync

```
Phase 1 chunk N:  build it in prototype/index.html  →  checkpoint passes in DevTools  →  port it into projects/the-second-draft/
```

| Prototype (plain HTML/CSS/JS) | Story project (SvelteKit) |
|-------------------------------|---------------------------|
| `:root` tokens in `<style>` | `src/app.css` |
| A block's CSS rules | That component's `<style>` (scoped) |
| A block's HTML | That component's markup, fed by `story.json` |
| `<script>` behavior | An `{@attach}` function in the component (runs in the browser only, after the element exists) |
| `<head>` script (`.js`, failsafe) | `src/app.html` |
| `.js .headline` | `:global(.js) .headline` (the class lives on `<html>`, outside the component) |

Each ⏳ component's top comment says which chunk finishes it. When that chunk's checkpoint passes in the prototype, port the
rules and behavior, update the comment to ✅, and update the status table in §4.

---

## 12. How to…

**Edit copy.** Change the text in `content/story.json`, and `npm run dev` reloads. No component changes.

**Replace an image.** Drop the new file into `big_assets/images/` (the same name, or update the path in `story.json`) and keep its
aspect ratio, or update `width`/`height`. The next build gets a new `_big_assets` hash automatically.

**Add a new block type.**
1. Add the data to `story.json`: `{ "type": "pull-quote", "text": "…", "cite": "…" }`.
2. Create `src/lib/components/PullQuote.svelte`: markup from props, a scoped `<style>`, tokens only.
3. Register it in `src/routes/+page.svelte`: `'pull-quote': PullQuote` in `BLOCKS`.
4. Check it reads correctly **with JavaScript off** (`npm run build && npm run preview`, then disable JS in DevTools).

**Start a second story.** Copy the folder to `projects/<new-slug>/`, change `name` in `package.json`, replace `content/story.json` and
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
| Relative paths: works under `<cdn>/projects/<project-id>/` | ✅ Verified from `/projects/the-second-draft/`: all files load, the page hydrates |
| Dev serves media from `/big_assets` without a build | ✅ Verified |
| Scroll mechanics from `scrolly-template.html` | ⏳ Arrive with Phase 1 chunks 6–10, one component at a time (§11) |
| Header Lottie (`hero.json`) | ⏳ The file is in place. The SVG art stays as the poster until chunk 10 |

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
