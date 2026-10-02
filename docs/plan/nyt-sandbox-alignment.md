# Aligning the build with the NYT Opinion sandbox blueprint

**Date:** 2026-10-02  **Source:** [`../reference/nyt-sandbox-blueprint.md`](../reference/nyt-sandbox-blueprint.md) (the
"In Defense of the Detour" architecture blueprint, supplied 2026-10-02)  **Status:** decisions made 2026-10-02 (§2); S1 and S2 done

## Why this plan exists

Phase 1 was built from [`scrolly-template.html`](../reference/scrolly-template.html), a **recreation** of a Birdkit
page whose "measured" values we never re-checked against the live page (breakdown, top note). The blueprint is a
better source for architecture: its left column was read from the **shipped page source**:
- the `body` array of blocks;
- the eight component names;
- GSAP ScrollTrigger and Lottie;
- the `_big_assets/` layout;
- the real track heights.

Where the two disagree on architecture, this plan follows the blueprint.

The good news: the recreation was a faithful one. Our page already has the real page's shape: a header, a two-up, a
process diagram, three sticky scroll sections, a scrubbed Lottie and credits. Most of this plan is *reshaping* what
exists, not building from scratch.

---

## 1. Verification: current build vs. blueprint

✅ matches · 🟡 partly · ❌ missing. "Project" means `projects/the-second-draft/`, the Birdkit-shaped build. The
blueprint describes a single SvelteKit project, so that's the right thing to compare.

### Build and stack (blueprint §2–3)

| Blueprint | Current build | |
|---|---|---|
| SvelteKit 2 + Svelte 5 + `adapter-static`, `prerender = true` | Exactly that (`svelte.config.js`, `src/routes/+layout.js`) | ✅ |
| JavaScript with JSDoc, no TypeScript | Plain JS | ✅ |
| `paths.base` from `BASE_PATH` for GitHub Pages | `paths.relative: true`: works under *any* path with no env var (verified from `/projects/the-second-draft/`) | ✅ ours is stronger |
| `prerender.handleHttpError: 'warn'` | A handler that skips `_big_assets` during prerender, then **verifies every media URL** after the build ("verified 23 media URLs") | ✅ ours is stricter |
| `gsap` (ScrollTrigger) for scroll | A hand-written rAF engine (`src/lib/scroll.js`). **The real page ships GSAP 3.12.5 + ScrollTrigger** | ❌ |
| `lottie-web` | `lottie-web` **5.13.0**; the real page ships **5.12.2** | 🟡 version |
| `archieml` (optional) | Not used. ArchieML is planned in `packages/archie` (Phase 2 chunk 03), currently a stub | ❌ (optional) |

### Content document (blueprint §5)

| Blueprint | Current build | |
|---|---|---|
| One ordered **`body`** array: `{ type: "text", value }` and `{ type: "svelte", value: { component, …props } }` | `content/story.json` has `header`, `byline`, `blocks[]` and `credits` as **separate keys**, with our own types (`two-up`, `diagram`, `scrolly` + `scene`, `lottie`) | 🟡 same idea, different shape |
| Header and Credits are **blocks in `body`** like any other | Rendered outside the loop, from fixed keys | ❌ |
| Component settings are **flat key/value pairs** (`label1`, `label2`…); lists are **comma-separated strings** | Nested arrays and objects (`steps[]`, `layout[]`, `images[]`) | ❌ |
| `theme` key (`"opinion"`) | None | ❌ |
| `sheets` data slot, with data JSON fetched by components | None (`big_assets/scripts/` exists but is empty) | ❌ |
| Text blocks allow inline HTML (`<a>`, `<em>`) | Plain text only | ❌ |

### Renderer and shell (blueprint §6, §7.1–7.2)

| Blueprint | Current build | |
|---|---|---|
| `Blocks.svelte`: a registry of component name → component | A `BLOCKS` map inside `+page.svelte` | 🟡 move it out |
| A visible **"Missing component"** fallback | Unknown blocks are **silently dropped** | ❌ |
| `<article id="g-…" class="birdkit-body g-theme-…">` wrapper; the platform owns everything outside it | `<article class="story">` | ❌ |
| A **mock platform shell**: a sticky, semi-transparent masthead and a footer, so sticky panels are tested under it | No shell at all | ❌ |
| `g-text g-body-text` paragraph classes | `g-text` | 🟡 |
| `asset()` and `list()` helpers | `asset()` in a generated `$lib/assets.js`, with content-hashed `_big_assets.<hash>/` | ✅ (`list()` arrives with flat props) |

### Tokens and breakpoints (blueprint §6)

| Blueprint | Current build | |
|---|---|---|
| NYT tiers: **smartphone < 740, tablet 740–1149, desktop ≥ 1150** | Body type switches at **740** ✅. But the twins and the diagram stage switch at **1024**, two-up at 640, band at 768, and two-up padding at 1250 (from the recreation) | 🟡 |
| Body 20px (18px under 740), 600px column, line height 1.5 | 20/30 (18/27 under 740), 600px column | ✅ |
| Free substitutes for NYT fonts | Newsreader (free) and system sans; no Times fonts (CLAUDE.md) | ✅ |
| White page, `#313036` text | **diatour dark** (`--paper #121211`), because CLAUDE.md says "diatour wins visual conflicts" | ⚠ decision, see §2 |
| Reduced motion turns transitions and animations off | A global rule, plus scene-level handling | ✅ |

### Components (blueprint §0, §7.3–7.8). The real page has eight.

| Real component | Our equivalent | Gaps |
|---|---|---|
| `Header` (hero Lottie, headline, byline, bio, date) | `Header` + `Byline` (hero Lottie twins, SVG poster, fonts-ready intro) | 🟡 Byline is a separate block. No `bio`. Lottie props are named `art.lottie.desktop/mobile`, not `url`/`urlMobile` |
| `ImageTwoUpWide` (video **or** image pair, group caption) | `TwoUp` (images, `srcset`, one `figcaption`) | 🟡 No MP4 support. Different name |
| `Shortcut` (flow diagram, labels, **draw-on animation + replay**, dashed re-prompt loops) | `Diagram` (an `<ol>` + SVG curved connectors redrawn by a ResizeObserver: already the blueprint's stretch goal) | 🟡 No draw-on, no replay button, no dashed loop. Labels aren't flat `label1…` keys |
| `AiStudy` (900vh, 6 frames) | `SlidesScrolly` (810svh, 6 frames, hard cuts) | 🟡 Same frame count, 150 vs 135 per frame. No square cloud (blueprint stretch) |
| `OrganicChart` (960svh, 8 frames) | `CaptionScrolly` (675svh, 5 frames) | 🟡 Different content and frame count |
| `PaintingScroll` (500svh, 4 steps) | `PaintingsScrolly` (405svh, 3 steps) | 🟡 Animates `top`/`left`/`width`, but the blueprint rule is **transforms and opacity only** |
| `LottieScrub` (DESKTOP / TABLET / MOBILE files) | `ScrubLottie` + `ScrubStage` (desktop and mobile twins, lazy, end frame under reduced motion) | 🟡 No tablet tier. Files named `scrub-desktop.json`, not `name_DESKTOP.json` |
| `Credits` | `Credits` | ✅ (becomes a `body` block) |
| `StickyScroller` (the shared track) | `Scrolly` (shared runway, `{ step, progress }` via a snippet) | 🟡 Same contract. Our engine, not ScrollTrigger. Height comes from steps, not set in the doc |
| `DataScrolly` (your earlier `data.json` demo) | — | ❌ That demo **isn't in this repo**, see §2 |

### Scroll conventions (blueprint §9)

| Blueprint | Current build | |
|---|---|---|
| Track height set **per section in the doc** (`"height": "900vh"`) | Computed: steps × 135svh | 🟡 |
| `svh` for tracks and sticky panels | `135svh` steps, `100svh` panels | ✅ |
| Progress bar is a **`scaleX(progress)`** transform; markers at **`(i / steps) × 100%`** | The bar animates **`width`** (causes layout); markers at `i / (n − 1)` | ❌ |
| Animate transforms and opacity only | Scenes A and B are fine. Scene C animates layout properties | 🟡 |
| `aria-live="polite"` on text that changes per step; decorative stages `aria-hidden` | Stages are `aria-hidden` ✅. Step text is a **visually hidden `<ol>`** of every step (a screen reader gets all of it, without waiting on scroll) | ✅ different, and stronger |
| Reduced motion: jump to end states, no scrubbing | Yes, including the Lottie end frame | ✅ |
| ScrollTriggers killed on destroy | Every attachment cleans up | ✅ |

### Where our build already goes further (keep these)

These are deliberate fixes from Phase 1, and the blueprint's sample code would undo several of them:

- **No-JS reading.** Every frame and caption is server-rendered and readable with JS off. The blueprint's `DataScrolly` renders *nothing* until a fetch finishes, which breaks CLAUDE.md's "text must render without JS."
- **Enhance-after-hydrate gating** (`data-enhanced`). A crashed script leaves a readable stack, not tall blank tracks.
- **`{@attach}` for DOM work** (CLAUDE.md), where the blueprint snippets use `onMount` + `bind:this`.
- **Twins loaded only when visible**, via IntersectionObserver. The blueprint picks one file with a one-time `matchMedia` check, so a resize or rotation never switches files.
- **Content-hashed media**, verified after every build, plus an upload plan with immutable caching.
- **`npm run parity`**, which checks the project against the prototype within 1px.

**Rule for the work below:** adopt the blueprint's *architecture and conventions*; don't paste its snippets verbatim.
Where a snippet conflicts with CLAUDE.md (`onMount`, unsanitized `{@html}`, JS-only content, hard-coded colors), the
CLAUDE.md version wins.

---

## 2. Decisions

**Decided 2026-10-02:** the owner went with every recommendation below. For D4, which had no recommendation, the
default is (b): build `DataScrolly` fresh from the blueprint's `stages.json`.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | **Visual theme.** The blueprint uses NYT's white page; CLAUDE.md says diatour wins visual conflicts | (a) keep diatour dark only, (b) switch to light, (c) support both via the doc's `theme` key | **(c)**: `theme: "opinion"` is a light theme using diatour's light values (`--paper #fbfbf8`, `--ink #121212`, already in `docs/design-system.md`); `theme: "diatour"` stays the default. That keeps the architecture NYT-shaped without overruling CLAUDE.md |
| D2 | **Where the work happens** | (a) evolve `projects/the-second-draft/`, (b) start a new `projects/<slug>/` | **(a)**: it already matches about 70% of the blueprint, and the parity script and CI guard it |
| D3 | **Adopt GSAP ScrollTrigger** for the scroll engine | (a) yes, pinned to **3.12.5** like the shipped page, (b) keep our rAF engine | **(a)**, kept behind `Scrolly`'s existing `{ step, progress }` contract so no scene changes. Note: GSAP is free but **not MIT** ("Standard no-charge license"), which is fine for a learning project. Record it in the README |
| D4 | **The `DataScrolly` demo.** The blueprint ports "your original `data.json` demo," which isn't in this repo | (a) send me the old `index.html` / `app.js` / `data.json`, (b) build it fresh from the blueprint's `stages.json` | Your call: (a) keeps your history, (b) is fine for learning |
| D5 | **Masthead and byline text.** The blueprint's sample says "The Sandbox Times" and "By Justus Riley" | CLAUDE.md requires the masthead "Our Opinions" and invented demo content | Use **"Our Opinions"**. Keep the invented byline (A. Writer) unless you want your own name on a demo essay |

---

## 3. The plan: eight chunks in `projects/the-second-draft/`

Same rules as Phase 1: one new idea per chunk, a checkpoint that must pass before the next starts, a learning-log entry,
and CI green. **The essay's words don't change**: every content move is a mechanical conversion done by a script and
checked by a diff, since AI doesn't write or edit the argument.

| # | Chunk | The one new idea | Blueprint § |
|---|---|---|---|
| S1 | **The `body` document** | Content as one ordered `body` of `text` and `svelte` blocks | §5a, §7.1–7.2 |
| S2 | **The platform shell** | The page lives inside a shell it doesn't own | §1, §6 |
| S3 | **NYT breakpoints and themes** | Three device tiers (740 / 1150) and a `theme` switch | §6 |
| S4 | **StickyScroller on ScrollTrigger** | The industry-standard scroll library behind our own contract | §7.3, §9 |
| S5 | **The real component set** | Components named and shaped like the shipped page | §0, §7.5–7.8 |
| S6 | **Data and the `sheets` slot** | Data-driven components read data files, and still render without JS | §2, §7.4 |
| S7 | **Authoring in ArchieML** | Editors write a doc; a build step turns it into `body` | §5b |
| S8 | **Stretch and QA** | The AiStudy square cloud, the §11 QA list, a share link | §10.7–9, §11 |

### S1. The `body` document

- **Converter.** `scripts/story-to-doc.js` converts `content/story.json` → `content/doc.json` in the blueprint's shape:
  - one `body` array, with `Header`, the byline, every section and `Credits` as blocks in order;
  - each visual block as `{ type: "svelte", value: { component, …flat props } }`;
  - lists as comma-separated strings where the real page does that, and nested data only where there's no flat equivalent (scene C's per-step layouts become `sheets` data in S6).
- **Diff check.** Every `value` string in the new doc equals one in the old (no word changes).
- **Renderer.** `src/lib/Blocks.svelte`, the registry, with a **visible** "Missing component: X" placeholder in dev and a build-time error in production. `+page.svelte` shrinks to `<article><Blocks body={data.body} /></article>`.
- **Inline HTML.** `Text.svelte` allows inline `<a>`, `<em>` and `<strong>` through an **allow-list sanitizer at build time**, not raw `{@html}` on untrusted input.
- **Checkpoint.**
  - The page renders identically: `npm run parity` stays within 1px.
  - "Verified N media URLs" still passes.
  - A misspelled component name shows the placeholder in dev and fails the build.

**✅ Done** ([learning log 20](../learning-log/20-s1-body-document.md)):
- **Rendered markup:** identical to the old build once hashes, hydration comments and inter-tag whitespace are set aside.
- **Checks:** `npm run parity` within 1px; "verified 23 media URLs".
- **A misspelled component** stops the build with `body[8]: missing component "Diagramm"` and shows the placeholder in dev.
- **Inline HTML:** `<em>` and `<a href="#…">` render, and `<script>` is shown as text.
- **One deviation:** the build-time check lives in `+page.js` (`docProblems()`), not a separate sanitizing step. Inline HTML is allow-listed at render time by a pure function with tests, so it's equally safe on the server and in the browser.

### S2. The platform shell

- **`+layout.svelte` becomes a mock platform shell:**
  - a sticky, semi-transparent masthead reading **"Our Opinions"** (D5);
  - a footer saying comments, ads and recirculation would live there;
  - `<main id="site-content">`.
- **The page wrapper** becomes `<article id="g-bk-the-second-draft" class="birdkit-body g-theme-{theme}">`.
- **Ownership rule.** Every story style is scoped under it; the shell owns everything outside.
- **Checkpoint.**
  - Every sticky panel and the header are usable under the masthead: no step text or progress bar hidden behind it, at 375, 768 and 1280.
  - Fixing this needs a `--masthead-h` token used as the sticky `top` offset, which is the real page's constraint.

**✅ Done** ([learning log 21](../learning-log/21-s2-platform-shell.md)):
- **Panels:** at 375, 768 and 1280, every pinned panel sits exactly under the 44px masthead (0px covered). No step text sits above a panel's top, and every step lands where the offset-aware formula predicts.
- **Skip link:** the first Tab stop, and it lands the story at the masthead's bottom edge.
- **Parity:** with the shell switched off, the story still matches the prototype within 1px.

### S3. NYT breakpoints and themes

- **Breakpoint tokens:** `--bp-tablet: 740px` and `--bp-desktop: 1150px` (documented, repeated in media queries).
- **Move the 1024 twin switch** and the diagram stage to the NYT tiers. Keep the 640/768/1250 component breakpoints only where a component genuinely needs its own, and record why.
- **Theme.** The doc's `theme` selects `g-theme-diatour` (default) or `g-theme-opinion` (light), per D1. Every color goes through tokens, so a theme is a token block.
- **Checkpoint.**
  - The breakpoint matrix (breakdown §17) is redone at 375, 739, 740, 1149, 1150 and 1440.
  - Both themes pass WCAG AA contrast on every text/background pair.

### S4. StickyScroller on ScrollTrigger

- **Swap the engine, keep the contract.**
  - Add `gsap@3.12.5` (D3).
  - `Scrolly.svelte` becomes `StickyScroller.svelte`. One ScrollTrigger per track (`start: 'top top'`, `end: 'bottom bottom'`) inside an `{@attach}`, killed on teardown.
  - `onUpdate` feeds the same `{ step, progress }`. `data-enhanced` gating and the no-JS stack stay.
- **Doc-set track height:** `"height": "900svh"` per section, falling back to steps × 135svh.
- **Progress bar:** `transform: scaleX(progress)`, with markers at `(i / steps) × 100%`.
- **Checkpoint.**
  - The chunk 8 checks still pass: a step changes every `(height − 100svh) / steps`, with the bar hidden at 0 and 1.
  - A Performance recording shows **no layout** from the bar while scrolling.
  - `npm run parity` is updated for the new step offsets, and the change is explained in the log.

### S5. The real component set

Rename and reshape to the shipped names and props (the doc uses these names):

- **`Header`:** absorbs `Byline`, adds `bio`, and takes hero `url` / `urlTablet` / `urlMobile`.
- **`ImageTwoUpWide`:** `url1`/`url2`/`alt1`/`alt2`/`groupCaption`. An `.mp4` URL renders a muted, looping `<video playsinline>` that respects reduced motion (paused, with a poster).
- **`Shortcut`:**
  - flat `label1…labelN` props;
  - an SVG draw-on (`stroke-dashoffset`) when it enters the viewport;
  - a **Replay** `<button>`;
  - a dashed "re-prompt" loop path, the blueprint's stretch, built on our existing connector code.
- **`AiStudy`, `OrganicChart`, `PaintingScroll`:** our three scenes under their real names.
  - `PaintingScroll` moves to **transforms and opacity only** (FLIP from our % layouts).
  - Step counts can follow the doc.
- **`LottieScrub`:** a third **tablet** tier. Files renamed `name_DESKTOP.json` / `_TABLET` / `_MOBILE` (the generators updated). `lottie-web` pinned to **5.12.2**.

**Checkpoint:**
- Every chunk 9–11 test still passes under the new names.
- Lighthouse stays at or above 95 / 100 / 96 with CLS 0.
- Exactly one Lottie file per tier is requested at 375, 900 and 1280.

### S6. Data and the `sheets` slot

- **The slot:** the doc gains `"sheets": {}`, and `big_assets/data/*.json` holds data files (hashed like other media).
- **`DataScrolly`** (D4) reads its data at **build time** through `+page.js`, so the circles and labels are in the prerendered HTML and readable without JS. Client-side `fetch` is only for data that's genuinely live, which nothing here is.
- **Scene C's layouts** move into `sheets` as well.
- **Checkpoint:** with JS off, every stage's metric is on the page. With JS on, each step changes radius and color via transforms and attributes, with the label announced (`aria-live="polite"`).

### S7. Authoring in ArchieML

- **`content/doc.aml`** is written the way an editor would write the Google Doc. `scripts/aml-to-json.js` (`archieml@0.5.0`) builds `doc.json` before `vite build`.
- **Shared code:** the conversion lives in **`packages/archie`** (Phase 2 chunk 03), and the project imports it, so there's one parser for both worlds.
- **Checkpoint:**
  - A copy edit in `doc.aml` rebuilds the page with **no component changes** (QA §11, first item).
  - `npm run parity` unchanged.

### S8. Stretch and QA

- **The AiStudy square cloud:** about 90 squares at seeded random positions that animate into 12 clusters, connected by runtime SVG paths, with a separate mobile grid. Transforms only.
- **The §11 QA checklist**, run and recorded:
  - 375 / 768 / 1280;
  - iOS `svh` behavior;
  - sticky content under the masthead;
  - reduced motion and alt text;
  - asset sizes;
  - no console errors under fast scroll and resize.
- **Optional:** a GitHub Pages share link. The build already works under any path; it just needs a workflow.

---

## 4. Effect on the Phase 2 plan

The blueprint describes the **visual-essay** world (a Birdkit page inside the platform shell). Phase 2's React story
app is the **platform** world (standard essays, with graphics embedded), so it stays valid. Three Phase 2 chunk
descriptions should change once this track is done:

- **Chunk 03 (ArchieML):** `parseStory()` emits the blueprint's `body` shape (`text` / `svelte` blocks with flat props), not a new invented one. Today the stub's `Block` type is only `{ type: 'text' }`.
- **Chunks 07–08 (scroll engine, visual-essay template):** reuse S4–S5's components instead of rebuilding them, and keep ScrollTrigger as the engine.
- **The React story app's root layout** plays the "platform shell" role S2 mocks, so the two shells should share the masthead and footer markup.

**Recommended order:** S1 → S8 first (they're the stated goal), then resume Phase 2 at chunk 01 with those three
descriptions updated. Phase 2 chunk 00 (the monorepo) is unaffected.
