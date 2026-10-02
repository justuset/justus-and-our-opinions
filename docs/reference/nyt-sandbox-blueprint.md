<!-- Supplied by the project owner on 2026-10-02 as "nyt-sandbox-setup.md". Kept verbatim as a reference.
     The plan that applies it to this repo: docs/plan/nyt-sandbox-alignment.md -->

# NYT Opinion Interactive Sandbox: Architecture Blueprint

This blueprint rebuilds the architecture behind NYT Opinion's scroll-driven essays in a local sandbox, using "In Defense of the Detour" (Sept. 2026) as the reference build. It replaces the earlier single-file `index.html` / `app.js` / `data.json` setup with the same model the real page uses: **a content document drives an ordered list of blocks, and each visual block is its own Svelte component.** Your original `data.json` scrollytelling demo carries over as one of those components (see section 7.4).

---

## 0. What's verified vs. inferred

| Verified from the shipped page source | Inferred (not public) |
|---|---|
| Built with **Birdkit**, NYT's SvelteKit-based publishing tool. The HTML says `birdkit: do not modify this file`. | How Birdkit's internals, CLI and deploy work. |
| The article is a `body` array of `{type:"text"}` and `{type:"svelte", component, ...props}` blocks. | That the source is a Google Doc converted to data. This is the usual NYT pattern, and the payload includes an empty `sheets:{}`. |
| 8 custom components: `Header`, `ImageTwoUpWide`, `Shortcut`, `AiStudy`, `OrganicChart`, `PaintingScroll`, `LottieScrub`, `Credits`. | The exact GSAP timelines. They live in compiled JS chunks that weren't readable. |
| GSAP 3.12.5 with ScrollTrigger, plus Lottie 5.12.2, loaded on the page. | Heavy.dev's internal process. Their public site lists Shopify/Jamstack work and doesn't describe NYT work. |
| Assets live in one `_big_assets/` folder, split into `images/`, `videos/` (Lottie JSON and MP4) and `scripts/`. | |
| Sticky scroll tracks with fixed heights: `900vh`, `960svh` and `500svh`. Each has a progress bar with markers. | |
| Separate desktop, tablet and mobile Lottie files, and separate mobile layouts. | |
| Credits: design by Pentagram, development by Heavy.dev, with Times Opinion. | |

---

## 1. How the real page gets built

```
 Google Doc / ArchieML          Svelte components            Assets
 (editors own copy)             (developer owns)             (_big_assets/)
        │                              │                          │
        ▼                              ▼                          ▼
 body: [ text, svelte{...}, ... ] ──► Blocks renderer ──► Birdkit build (SvelteKit SSR → static HTML)
                                                                  │
                                                                  ▼
                              NYT platform shell: masthead, ads, comments, paywall, analytics
```

**The developer works on:** components, scroll choreography, the asset pipeline, responsive versions and QA.
**Editors work on:** text, headings, labels, captions and alt text in the doc. They never touch component code.
**The platform owns:** everything outside `#g-bk-...`. Never edit the page shell.

---

## 2. Stack

| Layer | Real page | Sandbox |
|---|---|---|
| Framework | SvelteKit via Birdkit | SvelteKit 2 + Svelte 5, `@sveltejs/adapter-static` |
| Content | Doc converted to JSON `body` array | `src/lib/content/doc.json` (optionally authored in ArchieML) |
| Scroll | GSAP ScrollTrigger | `gsap` (npm) |
| Animation | Lottie (After Effects export via Bodymovin) | `lottie-web` (npm) |
| Data | `sheets:{}` slot | `static/data/*.json`, fetched by components |
| Hosting | NYT CDN (`static01.nytimes.com/newsgraphics/...`) | Local dev server, or GitHub Pages / Netlify for a share link |

---

## 3. Setup

```bash
npx sv create nyt-opinion-sandbox     # choose: SvelteKit minimal, JavaScript (JSDoc), no extras
cd nyt-opinion-sandbox
npm i -D @sveltejs/adapter-static
npm i gsap lottie-web
npm i -D archieml                     # optional, for section 5b
npm run dev
```

`svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({ fallback: undefined }),
    paths: { base: process.env.BASE_PATH ?? '' }, // set when deploying to GitHub Pages
    // Warn instead of failing the build while _big_assets placeholders don't exist yet.
    // Switch back to 'fail' once real assets are in place.
    prerender: { handleHttpError: 'warn' }
  }
};
```

`src/routes/+layout.js`:

```js
export const prerender = true; // static HTML output, like Birdkit
```

---

## 4. Repo layout

```
nyt-opinion-sandbox/
├── src/
│   ├── app.html
│   ├── lib/
│   │   ├── content/
│   │   │   └── doc.json              # the "Google Doc": ordered body blocks
│   │   ├── styles/
│   │   │   └── tokens.css            # type, color and breakpoint tokens (section 6)
│   │   ├── Blocks.svelte             # renderer: maps component names → components
│   │   ├── Text.svelte               # {type:"text"} paragraphs
│   │   ├── util/
│   │   │   └── asset.js              # resolves _big_assets paths
│   │   └── components/
│   │       ├── Header.svelte         # hero Lottie + headline/byline
│   │       ├── StickyScroller.svelte # reusable sticky track + progress bar
│   │       ├── DataScrolly.svelte    # your original data.json demo, ported
│   │       ├── Shortcut.svelte       # SVG flow diagram with replay
│   │       ├── ImageTwoUp.svelte     # video + image pair with caption
│   │       ├── PaintingScroll.svelte # image sequence inside StickyScroller
│   │       ├── LottieScrub.svelte    # scroll-scrubbed Lottie, desktop/mobile
│   │       └── Credits.svelte
│   └── routes/
│       ├── +layout.js
│       ├── +layout.svelte            # mock NYT shell (masthead + footer)
│       ├── +page.js                  # loads doc.json
│       └── +page.svelte              # renders <Blocks>
└── static/
    ├── _big_assets/                  # mirrors NYT's asset folder
    │   ├── images/
    │   ├── videos/                   # Lottie JSON + MP4
    │   └── scripts/
    └── data/
        └── stages.json               # your original data.json
```

---

## 5. The content document

### 5a. `src/lib/content/doc.json`

Same shape as the real payload. Component settings are **flat key/value pairs** (`label1`, `label2`...) because that's how doc-converted content arrives.

```json
{
  "theme": "opinion",
  "body": [
    {
      "type": "svelte",
      "value": {
        "component": "Header",
        "title": "The Long Way Around",
        "subtitle": "A sandbox essay on process, built to learn the architecture.",
        "byline": "By Justus Riley",
        "bio": "Mr. Riley is a designer and front-end developer.",
        "date": "Oct. 2, 2026",
        "url": "_big_assets/videos/hero_DESKTOP.json",
        "urlMobile": "_big_assets/videos/hero_MOBILE.json"
      }
    },
    { "type": "text", "value": "Opening paragraph. Inline <a href=\"#\">links</a> are allowed, like the real doc." },
    {
      "type": "svelte",
      "value": {
        "component": "Shortcut",
        "label1": "A brief",
        "label2": "A.I. generates",
        "label3": "Visual result",
        "label4": "Make some edits",
        "label5": "A final output"
      }
    },
    { "type": "text", "value": "Bridge paragraph into the data section." },
    {
      "type": "svelte",
      "value": {
        "component": "DataScrolly",
        "dataUrl": "data/stages.json",
        "height": "400svh"
      }
    },
    {
      "type": "svelte",
      "value": {
        "component": "ImageTwoUp",
        "url1": "_big_assets/videos/loop.mp4",
        "url2": "_big_assets/images/photo.jpg",
        "alt1": "Describe the video",
        "alt2": "Describe the photo",
        "groupCaption": "Caption shared by both media."
      }
    },
    {
      "type": "svelte",
      "value": {
        "component": "PaintingScroll",
        "height": "500svh",
        "images": "painting1.webp, painting2.webp, painting3.webp, painting4.webp"
      }
    },
    {
      "type": "svelte",
      "value": {
        "component": "LottieScrub",
        "height": "400svh",
        "url": "_big_assets/videos/finalDiagram_DESKTOP.json",
        "urlMobile": "_big_assets/videos/finalDiagram_MOBILE.json"
      }
    },
    { "type": "text", "value": "Closing paragraph." },
    {
      "type": "svelte",
      "value": { "component": "Credits", "text": "Produced in a personal sandbox for learning purposes." }
    }
  ]
}
```

> Lists arrive as **comma-separated strings** (`"images": "a.webp, b.webp"`), just like `boxLabels` on the real page. Components split them.

### 5b. Optional: author in ArchieML (closer to the Google Doc workflow)

Write `src/lib/content/doc.aml` the way an editor would, then convert:

```
theme: opinion

[+body]
{.svelte}
component: Header
title: The Long Way Around
{}

Opening paragraph written as plain text.

{.svelte}
component: Shortcut
label1: A brief
label2: A.I. generates
{}
[]
```

```js
// scripts/aml-to-json.js  →  node scripts/aml-to-json.js
import fs from 'node:fs';
import archieml from 'archieml';
const parsed = archieml.load(fs.readFileSync('src/lib/content/doc.aml', 'utf8'));
// Freeform arrays come back as {type, value}; plain lines become {type:"text"}.
fs.writeFileSync('src/lib/content/doc.json', JSON.stringify(parsed, null, 2));
```

Start with the JSON file. Add ArchieML once the components work.

---

## 6. Shell, tokens and breakpoints

Values measured from the live page. NYT fonts are licensed, so the sandbox uses close free substitutes.

`src/lib/styles/tokens.css`:

```css
:root {
  /* Type (NYT → sandbox substitute) */
  --font-headline: 'Libre Caslon Display', 'Georgia', serif;  /* nyt-cheltenham-cond */
  --font-body: 'Georgia', 'Times New Roman', serif;           /* nyt-imperial (NYT's own fallback is georgia) */
  --font-label: 'Libre Franklin', 'Helvetica', 'Arial', sans-serif; /* nyt-franklin */

  /* Measured sizes */
  --body-size: 20px;          /* .g-body-text */
  --body-width: 600px;        /* .g-body-text max width */
  --headline-size: 96px;      /* desktop hero headline */
  --label-size: 14px;         /* group numbers */
  --micro-size: 9.2px;        /* box labels */

  /* Color */
  --color-text: #313036;      /* body copy */
  --color-ink: #363636;       /* interactive text */
  --color-bg: #ffffff;
  --color-track: rgba(0, 0, 0, 0.05); /* progress bar track */
}

/* NYT breakpoints: smartphone < 740, tablet 740–1149, desktop ≥ 1150 */
@media (max-width: 739px) {
  :root { --body-size: 18px; --headline-size: 48px; }
  .desktop-only { display: none !important; }
}
@media (min-width: 740px) {
  .mobile-only { display: none !important; }
}

.g-body-text {
  font-family: var(--font-body);
  font-size: var(--body-size);
  line-height: 1.5;
  color: var(--color-text);
  max-width: var(--body-width);
  margin: 0 auto 1.25em;
  padding: 0 20px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

`src/routes/+layout.svelte` (a mock of the platform shell, so you're always building inside it):

```svelte
<script>
  import '$lib/styles/tokens.css';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Franklin:wght@400;500;700&display=swap" rel="stylesheet" />
</svelte:head>

<header class="mock-masthead">The Sandbox Times · Opinion</header>
<main id="site-content">{@render children()}</main>
<footer class="mock-footer">Mock platform footer (comments, ads and recirculation would live here)</footer>

<style>
  .mock-masthead, .mock-footer {
    font-family: var(--font-label); font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.05em; padding: 12px 20px; color: #666;
  }
  .mock-masthead { position: sticky; top: 0; z-index: 10; background: rgba(255,255,255,0.9); }
  .mock-footer { border-top: 1px solid #ebebeb; margin-top: 80px; }
</style>
```

> The sticky mock masthead is deliberate. The real interactives have to work under a transparent masthead, so test your sticky panels against it.

---

## 7. Core files

### 7.1 Load and render

`src/routes/+page.js`:

```js
import doc from '$lib/content/doc.json';
export function load() {
  return doc;
}
```

`src/routes/+page.svelte`:

```svelte
<script>
  import Blocks from '$lib/Blocks.svelte';
  let { data } = $props();
</script>

<article id="g-sandbox" class="birdkit-body g-theme-{data.theme}">
  <Blocks body={data.body} />
</article>
```

`src/lib/util/asset.js`:

```js
import { base } from '$app/paths';
// Doc stores relative paths ("_big_assets/images/x.jpg"); this makes them work locally and when deployed.
export const asset = (path) => (path?.startsWith('http') ? path : `${base}/${path}`);
export const list = (str = '') => str.split(',').map((s) => s.trim()).filter(Boolean);
```

### 7.2 `src/lib/Blocks.svelte` (the renderer)

```svelte
<script>
  import Text from './Text.svelte';
  import Header from './components/Header.svelte';
  import Shortcut from './components/Shortcut.svelte';
  import DataScrolly from './components/DataScrolly.svelte';
  import ImageTwoUp from './components/ImageTwoUp.svelte';
  import PaintingScroll from './components/PaintingScroll.svelte';
  import LottieScrub from './components/LottieScrub.svelte';
  import Credits from './components/Credits.svelte';

  // Doc component name → Svelte component. Add new components here.
  const registry = { Header, Shortcut, DataScrolly, ImageTwoUp, PaintingScroll, LottieScrub, Credits };

  let { body = [] } = $props();
</script>

{#each body as block, i (i)}
  {#if block.type === 'text'}
    <Text value={block.value} />
  {:else if block.type === 'svelte'}
    {@const Component = registry[block.value.component]}
    {#if Component}
      <Component {...block.value} />
    {:else}
      <p class="g-body-text" style="color:#c00">Missing component: {block.value.component}</p>
    {/if}
  {/if}
{/each}
```

`src/lib/Text.svelte`:

```svelte
<script>
  let { value = '' } = $props();
</script>

<p class="g-text g-body-text">{@html value}</p>
```

### 7.3 `StickyScroller.svelte` (the pattern behind AiStudy, OrganicChart and PaintingScroll)

A tall outer track, a sticky inner panel, a progress bar with markers, and scroll progress handed to whatever goes inside.

```svelte
<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let { height = '500svh', steps = 4, showProgress = true, children } = $props();

  let outer;
  let progress = $state(0);
  let step = $derived(Math.min(steps - 1, Math.floor(progress * steps)));

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: outer,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => (progress = self.progress)
    });
    return () => st.kill();
  });
</script>

<div class="scroll-outer" bind:this={outer} style:height>
  <div class="scroll-sticky">
    {#if showProgress}
      <div class="progress" class:hidden={progress === 0 || progress === 1} aria-hidden="true">
        {#each Array(steps - 1) as _, i}
          <span class="marker" style:left="{((i + 1) / steps) * 100}%"></span>
        {/each}
        <span class="bar" style:transform="scaleX({progress})"></span>
      </div>
    {/if}
    {@render children?.({ progress, step })}
  </div>
</div>

<style>
  .scroll-outer { position: relative; }
  .scroll-sticky { position: sticky; top: 0; height: 100svh; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .progress { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: var(--color-track); transition: opacity 0.3s; }
  .progress.hidden { opacity: 0; }
  .bar { position: absolute; inset: 0; background: var(--color-ink); transform-origin: left; }
  .marker { position: absolute; top: 0; bottom: 0; width: 2px; background: #fff; z-index: 1; }
</style>
```

Usage. The parent receives `step` and `progress` through a snippet:

```svelte
<StickyScroller height="900svh" steps={6}>
  {#snippet children({ step, progress })}
    <div class="frame">Frame {step + 1}</div>
  {/snippet}
</StickyScroller>
```

### 7.4 `DataScrolly.svelte` (your original `data.json` demo, ported)

Move your old `data.json` to `static/data/stages.json` and keep the same shape:

```json
{
  "stages": [
    { "step": 0, "radius": 20, "color": "#2563eb", "metric": "Baseline Data" },
    { "step": 1, "radius": 40, "color": "#059669", "metric": "Accelerated Growth" },
    { "step": 2, "radius": 15, "color": "#dc2626", "metric": "Critical Collapse" }
  ]
}
```

What changes from the old `app.js`: the `IntersectionObserver` is replaced by `StickyScroller`'s scroll progress, and the data is fetched inside the component, the way a data-driven component would read from `sheets`.

```svelte
<script>
  import { onMount } from 'svelte';
  import StickyScroller from './StickyScroller.svelte';
  import { asset } from '$lib/util/asset.js';

  let { dataUrl = 'data/stages.json', height = '400svh' } = $props();
  let stages = $state([]);

  onMount(async () => {
    try {
      const res = await fetch(asset(dataUrl));
      stages = (await res.json()).stages;
    } catch (err) {
      console.error('Failed to load stages:', err);
    }
  });
</script>

{#if stages.length}
  <StickyScroller {height} steps={stages.length}>
    {#snippet children({ step })}
      {@const s = stages[step]}
      <figure class="data-scrolly">
        <svg viewBox="0 0 100 100" width="320" height="320" role="img" aria-label={s.metric}>
          <circle cx="50" cy="50" r={s.radius} fill={s.color} />
        </svg>
        <figcaption aria-live="polite">{s.metric}</figcaption>
      </figure>
    {/snippet}
  </StickyScroller>
{/if}

<style>
  circle { transition: r 0.6s ease, fill 0.6s ease; }
  figcaption { font-family: var(--font-label); text-align: center; color: var(--color-ink); margin-top: 12px; }
</style>
```

### 7.5 `Header.svelte` (hero Lottie + headline)

```svelte
<script>
  import { onMount } from 'svelte';
  import { asset } from '$lib/util/asset.js';

  let { title, subtitle, byline, bio, date, url, urlMobile } = $props();
  let stage;

  onMount(() => {
    let anim, cancelled = false;
    const mobile = matchMedia('(max-width: 739px)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !url) return;
      anim = lottie.loadAnimation({
        container: stage, renderer: 'svg', loop: false, autoplay: !reduce,
        path: asset(mobile && urlMobile ? urlMobile : url)
      });
      if (reduce) anim.addEventListener('DOMLoaded', () => anim.goToAndStop(anim.totalFrames - 1, true));
    });
    return () => { cancelled = true; anim?.destroy(); };
  });
</script>

<header class="header-container">
  <div class="lottie-stage" bind:this={stage} aria-hidden="true"></div>
  <div class="header-copy">
    <h1 class="headline">{title}</h1>
    {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
  </div>
</header>
<div class="byline g-body-text">
  <p><strong>{byline}</strong></p>
  {#if bio}<p class="bio">{bio}</p>{/if}
  <time>{date}</time>
</div>

<style>
  .header-container { position: relative; min-height: 70svh; display: grid; place-items: center; overflow: hidden; }
  .lottie-stage { position: absolute; inset: 0; }
  .header-copy { position: relative; text-align: center; padding: 0 20px; }
  .headline { font-family: var(--font-headline); font-size: var(--headline-size); line-height: 1; margin: 0; color: #333; }
  .subtitle { font-family: var(--font-body); font-size: 19px; }
  .byline { font-family: var(--font-label); font-size: 14px; }
  .bio { color: #666; }
</style>
```

> **Lottie origin:** After Effects → Bodymovin (or LottieFiles) plugin → export JSON. NYT exports a separate comp per breakpoint (`_DESKTOP` 1800×1200, `_MOBILE`). For practice, any free Lottie from LottieFiles works.

### 7.6 `LottieScrub.svelte` (scroll scrubs the playhead)

```svelte
<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { asset } from '$lib/util/asset.js';

  let { url, urlMobile, height = '400svh' } = $props();
  let outer, stage;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    let anim, st, cancelled = false;
    const mobile = matchMedia('(max-width: 739px)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled) return;
      anim = lottie.loadAnimation({
        container: stage, renderer: 'svg', loop: false, autoplay: false,
        path: asset(mobile && urlMobile ? urlMobile : url)
      });
      anim.addEventListener('DOMLoaded', () => {
        if (reduce) return anim.goToAndStop(anim.totalFrames - 1, true); // show the end state, no scrub
        st = ScrollTrigger.create({
          trigger: outer, start: 'top top', end: 'bottom bottom',
          onUpdate: (self) => anim.goToAndStop(self.progress * (anim.totalFrames - 1), true)
        });
      });
    });
    return () => { cancelled = true; st?.kill(); anim?.destroy(); };
  });
</script>

<div class="outer" bind:this={outer} style:height>
  <div class="sticky"><div class="lottie" bind:this={stage} aria-hidden="true"></div></div>
</div>

<style>
  .outer { position: relative; }
  .sticky { position: sticky; top: 0; height: 100svh; display: grid; place-items: center; }
  .lottie { width: min(100%, 1100px); }
</style>
```

> The real page loads up to **three** files here (`DESKTOP`, `TABLET`, `mobile`). Add a `urlTablet` prop and a `(max-width: 1149px)` check as an exercise.

### 7.7 `Shortcut.svelte` (hand-coded SVG diagram with replay)

```svelte
<script>
  let props = $props();
  // Collect label1..labelN from flat doc keys
  let labels = $derived(
    Object.keys(props).filter((k) => /^label\d+$/.test(k))
      .sort((a, b) => +a.slice(5) - +b.slice(5)).map((k) => props[k])
  );
  let run = $state(0);
</script>

<figure class="shortcut">
  {#key run}
    <ol class="steps">
      {#each labels as label, i}
        <li style:--i={i}><span class="dot"></span><span class="label">{label}</span></li>
      {/each}
    </ol>
  {/key}
  <button class="replay" onclick={() => run++} aria-label="Replay">↻</button>
</figure>

<style>
  .shortcut { position: relative; max-width: 760px; margin: 48px auto; padding: 0 20px; }
  .steps { list-style: none; display: flex; justify-content: space-between; padding: 0; margin: 0; position: relative; }
  .steps::before { content: ''; position: absolute; top: 6px; left: 6px; right: 6px; height: 1.5px; background: var(--color-ink);
    transform-origin: left; animation: draw 1.6s ease forwards; transform: scaleX(0); }
  li { display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0;
    animation: pop 0.4s ease forwards; animation-delay: calc(var(--i) * 0.3s); }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: var(--color-ink); position: relative; }
  .label { font-family: var(--font-label); font-size: 13px; text-align: center; max-width: 9em; }
  .replay { position: absolute; right: 20px; bottom: -32px; border: 0; background: none; cursor: pointer; font-size: 18px; }
  @keyframes draw { to { transform: scaleX(1); } }
  @keyframes pop { to { opacity: 1; } }
  @media (max-width: 739px) {
    .steps { flex-direction: column; gap: 20px; align-items: flex-start; }
    .steps::before { display: none; }
    li { flex-direction: row; }
  }
</style>
```

> Stretch goal: rebuild this with real SVG `<path>` connectors, dashed "re-prompt" loops and arrowheads, like the original's `connector`/`connector--dashed`/`arrow-tip` paths.

### 7.8 `PaintingScroll.svelte`, `ImageTwoUp.svelte`, `Credits.svelte`

```svelte
<!-- PaintingScroll.svelte -->
<script>
  import StickyScroller from './StickyScroller.svelte';
  import { asset, list } from '$lib/util/asset.js';
  let { images = '', height = '500svh' } = $props();
  let files = $derived(list(images));
</script>

<StickyScroller {height} steps={files.length}>
  {#snippet children({ step })}
    <div class="ps-stage">
      {#each files as file, i}
        <img src={asset(`_big_assets/images/${file}`)} alt="Painting {i + 1}"
             class:active={i === step} class:past={i < step} />
      {/each}
    </div>
  {/snippet}
</StickyScroller>

<style>
  .ps-stage { position: relative; width: min(90vw, 520px); aspect-ratio: 9 / 8; }
  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
        opacity: 0; transform: translateY(40px); transition: opacity 0.5s, transform 0.5s; }
  img.active { opacity: 1; transform: none; }
  img.past { opacity: 0.15; transform: translateY(-20px) scale(0.96); }
</style>
```

```svelte
<!-- ImageTwoUp.svelte -->
<script>
  import { asset } from '$lib/util/asset.js';
  let { url1, url2, alt1 = '', alt2 = '', groupCaption = '' } = $props();
  const isVideo = (u = '') => u.endsWith('.mp4');
</script>

<figure class="two-up">
  <div class="pair">
    {#each [[url1, alt1], [url2, alt2]] as [u, alt]}
      {#if isVideo(u)}
        <video src={asset(u)} muted loop playsinline autoplay preload="metadata" aria-label={alt}></video>
      {:else}
        <img src={asset(u)} {alt} loading="lazy" />
      {/if}
    {/each}
  </div>
  {#if groupCaption}<figcaption>{groupCaption}</figcaption>{/if}
</figure>

<style>
  .two-up { max-width: 1222px; margin: 48px auto; padding: 0 20px; }
  .pair { display: flex; gap: 12px; }
  .pair > * { flex: 1; width: 50%; object-fit: cover; }
  figcaption { font-family: var(--font-label); font-size: 13px; color: #666; margin-top: 8px; }
  @media (max-width: 739px) { .pair { flex-direction: column; } .pair > * { width: 100%; } }
</style>
```

```svelte
<!-- Credits.svelte -->
<script>
  let { text = '' } = $props();
</script>
<section class="credits g-body-text"><p>{@html text}</p></section>
<style>.credits { font-family: var(--font-label); font-size: 13px; color: #666; }</style>
```

---

## 8. Asset pipeline (mirror NYT's conventions)

| Asset | Source | Export | Naming |
|---|---|---|---|
| Hero / diagram animation | After Effects comp per breakpoint | Bodymovin → Lottie JSON, images as webp | `name_DESKTOP.json`, `name_TABLET.json`, `name_MOBILE.json` |
| Stills | Photoshop / Figma | webp (illustration), jpg (photo) | `images/section/img_N.jpg` |
| Mobile tile sets | One combined strip per category | jpg, shown through CSS `object-position` | `images/section/mobile/category-N.jpg` |
| Video loop | Premiere / AE | H.264 MP4, muted, compressed | `videos/name_compressed.mp4` |

All of it goes in `static/_big_assets/`. Doc paths stay relative (`_big_assets/...`) so `asset()` resolves them in dev and in production.

---

## 9. Scroll conventions from the real page

- **Track heights set the pacing.** Real values: AiStudy `900vh` / 6 frames, OrganicChart `960svh` / 8 frames, PaintingScroll `500svh` / 4 steps. That works out to roughly **120–150vh of scroll per frame**.
- **Prefer `svh`** for track heights and sticky panels so iOS Safari's collapsing toolbar doesn't make content jump. The original mixes in one `vh`; notice it and be ready to explain the difference.
- **Progress markers** sit at `(i / steps) * 100%`, and the bar is a `scaleX(progress)` transform (cheap, no layout cost).
- **Animate transforms and opacity only.** The square cloud on the real page moves about 90 elements per frame with `translate()`, never with `top`/`left`.
- **Text that changes per step** needs `aria-live="polite"`; decorative stages get `aria-hidden="true"`.
- **Reduced motion:** jump to end states and skip scrubbing.

---

## 10. Build order (practice roadmap)

1. Scaffold, tokens, mock shell, `Blocks` + `Text` rendering from `doc.json`.
2. `ImageTwoUp` + `Credits` (props, assets, captions).
3. `Shortcut` (CSS/SVG motion + replay).
4. `StickyScroller` + `DataScrolly` (your original demo, now scroll-progress driven).
5. `PaintingScroll` (reuse StickyScroller with images).
6. `Header` + `LottieScrub` (After Effects → Lottie → scroll scrub, desktop/mobile files).
7. **Stretch:** an AiStudy-style square cloud. Put about 90 squares with `data-group="0–11"` at seeded random positions, then on later steps animate them into 12 clusters and draw connecting SVG `<path>` lines at runtime. Add a separate mobile grid layout.
8. Optional: switch the content source to ArchieML (section 5b).
9. Deploy with `BASE_PATH=/repo-name npm run build` to GitHub Pages for a shareable link.

---

## 11. QA checklist (before calling a section done)

- [ ] Copy edits happen in `doc.json` only; no component changes needed.
- [ ] Works at 375px, 768px and 1280px+, and the mobile layout is designed, not just squeezed.
- [ ] iOS Safari: sticky panels don't jump when the toolbar collapses (`svh`).
- [ ] Sticky content isn't hidden under the mock masthead.
- [ ] `prefers-reduced-motion` shows end states.
- [ ] Every image has alt text or is marked decorative, and changing text is announced.
- [ ] Lighthouse: no layout shift from late-loading Lottie (reserve the space).
- [ ] Assets compressed (webp/jpg, MP4 under about 2MB for loops), and Lottie JSON size checked.
- [ ] No console errors on resize or fast scrolling (ScrollTriggers killed on destroy).

---

## 12. How this maps to the interview

- **Architecture:** "The doc owns the words, components own the behavior." Same idea as HubSpot modules with `fields.json`: editors fill in settings and the developer owns the module.
- **Feasibility calls:** what becomes Lottie (complex illustrated motion) vs. coded SVG/DOM (anything with live text, data or interaction) vs. plain images.
- **Craft details to raise:** `svh` vs `vh`, transform-only animation for many elements, separate mobile compositions, reduced motion and screen-reader paths through long scroll tracks.
