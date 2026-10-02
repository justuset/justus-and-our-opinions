<!-- Supplied by the project owner on 2026-10-02. The original is kept verbatim below the adaptation note. -->

# NYT page shell replica: how it was applied

**Status:** the shell half is done as NYT sandbox chunk **S4b** ([learning log 25](../learning-log/25-s4b-measured-page-shell.md)).
The story-side half (Tasks 2, 4, 5, 6, 7) is folded into **S5** ([alignment plan](nyt-sandbox-alignment.md#s5-the-real-component-set)).

The plan was written for a generic sandbox. The owner chose (2026-10-02):

1. **Adapt it as chunk S4b**: same goals, measurements and tests, in this repo's structure.
2. **Shell only, story unchanged**: the measured NYT values apply to the platform shell. The story keeps the diatour design system (CLAUDE.md: diatour wins visual conflicts), and parity with the Phase 1 prototype still holds.
3. **Merge the article tasks into S5**: keep our components (twin art, SVG poster, no-JS states) and add NYT class names and measured values there, instead of replacing them.

| The plan says | What was done, and why |
|---|---|
| Branch `feat/nyt-page-shell` | This session's branch, `claude/wonderful-knuth-w43l2c` |
| Save to `docs/plans/…` | `docs/plan/` (the repo's existing folder) |
| Wordmark "The Sandbox Times" | **"Our Opinions"** (CLAUDE.md non-negotiable, decision D5) |
| `"test": "playwright test"` | **`"test:e2e"`**: `npm test` stays the unit tests that CI already runs |
| `src/lib/styles/tokens.css` rewrite, `article.css` | Not used. The shell's tokens live in `src/lib/shell/shell.css` as `--shell-*`, apart from the story's `app.css` |
| Tasks 2, 4, 5, 6, 7 (body column, header, links, two-up, credits) | **Moved to S5.** The plan's Header rewrite would drop the twin art, the poster and the fonts-ready intro, and uses `onMount` + `bind:this` (CLAUDE.md: DOM work goes in `{@attach}`) |
| Task 3 and Task 8 (masthead; share tools, recirc, ad slot, footer) | **Done**, with the plan's measured values and selectors |
| Task 9 (responsive QA) | **Done**: no horizontal scroll at three widths, plus review screenshots |
| Fonts Libre Caslon Text + Libre Franklin | Added for the shell only (wordmark, labels). The story keeps Newsreader |
| Share list color `#999`, ad labels `#727272` / `#999` | `#666` (`--shell-muted`): `#999` is 2.66:1 and `#727272` is 4.49:1 on `#f7f7f7`, both under WCAG AA |
| Masthead wordmark `#000` | `#000` over a light story header, **white over a dark one** (diatour is dark; black would vanish) |
| Tests use the live network | A fixture blocks Google Fonts: the specs assert sizes, not glyph widths |
| Masthead absolute (measured) | Kept. Since it scrolls away, sticky panels now pin at `top: 0` (`--masthead-h: 0px`), as on the shipped page |

---

# NYT Page Shell Replica Implementation Plan

> **For agentic workers:** Execute this plan task by task, in order. Steps use checkbox (`- [ ]`) syntax for tracking. Every code block starts with a comment naming its file path; when a block shows a whole file, replace that file's contents with it.

**Goal:** Replace the sandbox's placeholder masthead and footer with a measured replica of the NYT interactive page shell, so layout and responsiveness can be practiced against real desktop, tablet and mobile numbers.

**Architecture:** Shell pieces (masthead, share tools, recirculation, ad slot, footer) become small Svelte components in `src/lib/shell/`, composed by `+layout.svelte`. The NYT article classes (`.g-body-text`, `.g-byline`, `.header-container`, `.group-caption`...) are reused so the sandbox and the real page can be inspected side by side with the same selectors. Playwright tests run at three viewports and assert the computed values measured from the live page.

**Tech Stack:** SvelteKit 2 + Svelte 5 (runes), plain CSS, `@playwright/test`. Builds on the project described in `nyt-sandbox-setup.md`.

**Save this plan to:** `docs/plans/2026-10-02-nyt-page-shell.md` in the sandbox repo.

---

## Measured spec (source of truth)

Measured from the live article "In Defense of the Detour" on Oct. 2, 2026, using computed styles. M = 390px viewport, T = 800px, D = 1987px.

| Element | Mobile (M) | Tablet (T) | Desktop (D) |
|---|---|---|---|
| Masthead container | `position:absolute; top:6px`, transparent | same | same, `z-index` very high |
| Masthead section | h 47, padding `8px 15px 3px` | (assumed desktop) | h 42, padding `4px 15px 2px`, `top:-7px` |
| `.header-container` | h 675, `margin-top:90px` | h 675, mt 90 | h 675, mt 90 |
| `.headline` | Cheltenham Cond 700 uppercase, 58/58, max-w 2.64em (one word per line) | 58/58 | 96/88.32, max-w 5.28em |
| `.subtitle` | Imperial 300, 17.6/24.64, max-w 282px | n/m | 20/28, max-w 342px |
| Byline wrapper | w 350, margin `0 20px 20px` | n/m | w 600, centered, mb 20 |
| `.g-byline` | Franklin 700, 15/20 | n/m | 16/20 |
| `.g-extended-bio` | Franklin 400, 15/20, ls 0.15px, margin `2px 0 8px` | n/m | same |
| `.g-interactive-timestamp` | Franklin 500, 13/18 | n/m | same |
| `.g-body-text` | Imperial 500, 18/24.84, w 350, x 20, mb 12.5 | 20/30, w 600, centered | 20/30, w 600, centered |
| Body color | `rgb(49, 48, 54)` | same | same |
| Body links | `rgb(50, 104, 145)`, underline, offset 2px | same | same |
| Two-up container | w 350, max-w 600, stacked | w 760 | w 1312, centered |
| `.group-caption` | Imperial 15/18, `rgb(114,114,114)`, pt 9 | n/m | 15/30 |
| `.credits-text` | Franklin 500, 15/20, ls 0.15px, w 350 | n/m | w 600, margin-top 25 |
| Comment button | w 350 | n/m | w 600, h 36, bg `#567b95`, border `#326891`, Franklin 600 13px uppercase, ls 0.65px |
| Share list | margin `24px 20px 32px`, Franklin 17 `#999` | n/m | margin `24px auto 32px`, max-w 600 |
| Recirculation | full width, mt 45 | n/m | max-w 1200, padding `20px 3% 0` |
| Ad slot (from platform CSS in source) | min-h 280, bg secondary, borders, label 10px uppercase | | |
| Footer | full width, pb 45, 11px | n/m | max-w 1200, padding `0 3% 45px`, top rule `#ebebeb` |

**Assumptions (not measurable during the session, flagged so you can verify in DevTools):**
- The headline and subtitle switch from mobile to desktop size at **1150px**. Measured: 58px at 390 and 800, 96px at 1987.
- Body text, byline and masthead switch at **740px** (the NYT smartphone/tablet breakpoint, which matches the body text measurements).
- The two-up container caps at **1312px**.

**Branding rule:** use a placeholder wordmark ("The Sandbox Times") and never NYT's logo, name or fonts. The shell copies layout and spacing only.

## File structure

```
src/
├── lib/
│   ├── styles/
│   │   ├── tokens.css          # MODIFY: variables, breakpoints, utilities (full rewrite)
│   │   └── article.css         # CREATE: .g-body-text and link styles
│   ├── shell/
│   │   ├── Masthead.svelte     # CREATE: transparent absolute masthead
│   │   ├── ShareTools.svelte   # CREATE: comment button + share pills
│   │   ├── Recirc.svelte       # CREATE: related-content placeholder grid
│   │   ├── AdSlot.svelte       # CREATE: bottom ad placeholder
│   │   └── SiteFooter.svelte   # CREATE: footer nav
│   └── components/
│       ├── Header.svelte       # MODIFY: NYT header + byline markup (full rewrite)
│       ├── ImageTwoUp.svelte   # MODIFY: NYT two-up markup (full rewrite)
│       └── Credits.svelte      # MODIFY: NYT credits markup (full rewrite)
├── routes/
│   └── +layout.svelte          # MODIFY: compose shell (full rewrite, twice)
playwright.config.js            # CREATE
tests/
├── helpers.js                  # CREATE
├── body.spec.js                # CREATE
├── masthead.spec.js            # CREATE
├── header.spec.js              # CREATE
├── media.spec.js               # CREATE
├── footer.spec.js              # CREATE
└── responsive.spec.js          # CREATE
```

Each shell component owns one region of the page. Article styles shared by many blocks (`.g-body-text`) live in `article.css`; styles used by one component stay scoped inside it.

---

### Task 0: Branch

- [ ] **Step 1: Create a branch**

```bash
git checkout -b feat/nyt-page-shell
```

- [ ] **Step 2: Confirm the content doc has a linked paragraph, a Header, an ImageTwoUp and Credits**

Run: `grep -c '"component": "Header"\|"component": "ImageTwoUp"\|"component": "Credits"\|<a href' src/lib/content/doc.json`
Expected: `4` or more. If lower, copy the `doc.json` from section 5a of `nyt-sandbox-setup.md`; the tests below read those blocks.

---

### Task 1: Playwright harness with three viewports

**Files:**
- Create: `playwright.config.js`
- Create: `tests/helpers.js`

- [ ] **Step 1: Install Playwright**

```bash
npm i -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Write the config**

```js
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  use: { baseURL: 'http://localhost:4173' },
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
    { name: 'tablet', use: { viewport: { width: 800, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } }
  ]
});
```

- [ ] **Step 3: Write the helpers**

```js
// tests/helpers.js
import { test } from '@playwright/test';

/** 'mobile' | 'tablet' | 'desktop', from the Playwright project name */
export const viewport = () => test.info().project.name;

/** Bounding box + requested computed style properties of the first match */
export async function css(page, selector, props = []) {
  return page.locator(selector).first().evaluate((el, props) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const out = { x: r.left, width: r.width, height: r.height, vw: document.documentElement.clientWidth };
    for (const p of props) out[p] = s.getPropertyValue(p);
    return out;
  }, props);
}

export const px = (v) => parseFloat(v);

/** Expected left edge of a centered column of `width` (mobile uses 20px gutters) */
export const centeredX = (box, width) => (viewport() === 'mobile' ? 20 : (box.vw - width) / 2);
```

- [ ] **Step 4: Add test scripts to `package.json`**

In the `"scripts"` object add:

```json
"test": "playwright test",
"test:ui": "playwright test --ui"
```

- [ ] **Step 5: Commit**

```bash
git add playwright.config.js tests/helpers.js package.json package-lock.json
git commit -m "test: add Playwright harness with mobile, tablet and desktop viewports"
```

---

### Task 2: Tokens and the body text column

**Files:**
- Modify: `src/lib/styles/tokens.css` (full rewrite)
- Create: `src/lib/styles/article.css`
- Modify: `src/routes/+layout.svelte` (import article.css)
- Test: `tests/body.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/body.spec.js
import { test, expect } from '@playwright/test';
import { viewport, css, px, centeredX } from './helpers.js';

const EXPECT = {
  mobile: { size: 18, lh: 24.84, width: 350 },
  tablet: { size: 20, lh: 30, width: 600 },
  desktop: { size: 20, lh: 30, width: 600 }
};

test('body column matches NYT measurements', async ({ page }) => {
  await page.goto('/');
  const e = EXPECT[viewport()];
  const p = await css(page, 'p.g-text', ['font-size', 'line-height', 'font-weight', 'color', 'margin-bottom']);
  expect(px(p['font-size'])).toBe(e.size);
  expect(px(p['line-height'])).toBeCloseTo(e.lh, 1);
  expect(p['font-weight']).toBe('500');
  expect(p.color).toBe('rgb(49, 48, 54)');
  expect(px(p['margin-bottom'])).toBe(12.5);
  expect(Math.round(p.width)).toBe(e.width);
  expect(Math.abs(p.x - centeredX(p, e.width))).toBeLessThanOrEqual(1);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/body.spec.js`
Expected: FAIL in all three projects. The old `.g-body-text` uses `padding: 0 20px`, so the width at 390px is 390, not 350, and `margin-bottom` is 25px (1.25em).

- [ ] **Step 3: Rewrite `tokens.css`**

```css
/* src/lib/styles/tokens.css */
:root {
  /* Type: NYT face → free substitute */
  --font-headline: 'Libre Caslon Text', Georgia, serif;        /* nyt-cheltenham-cond */
  --font-body: Georgia, 'Times New Roman', serif;               /* nyt-imperial (NYT's own fallback) */
  --font-label: 'Libre Franklin', Helvetica, Arial, sans-serif; /* nyt-franklin */

  /* Color (measured) */
  --color-text: #313036;
  --color-ink: #363636;
  --color-headline: #333333;
  --color-link: #326891;
  --color-caption: #727272;
  --color-muted: #666666;
  --color-rule: #ebebeb;
  --color-bg: #ffffff;
  --color-bg-secondary: #f7f7f7;
  --color-button: #567b95;
  --color-track: rgba(0, 0, 0, 0.05);

  /* Layout (measured) */
  --col: 600px;        /* text column */
  --gutter: 20px;      /* mobile side gutter */
  --wide: 1312px;      /* two-up / wide media cap (assumed) */
  --page-max: 1200px;  /* recirculation + footer */
}

html, body { margin: 0; background: var(--color-bg); }
body { -webkit-font-smoothing: antialiased; }

/* NYT breakpoints: smartphone < 740, tablet 740–1149, desktop ≥ 1150 */
@media (max-width: 739px) { .desktop-only { display: none !important; } }
@media (min-width: 740px) { .mobile-only { display: none !important; } }

.visually-hidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 4: Create `article.css`**

```css
/* src/lib/styles/article.css */
.g-body-text {
  box-sizing: border-box;
  width: calc(100% - 2 * var(--gutter));
  max-width: var(--col);
  margin: 0 auto 12.5px;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 18px;
  line-height: 1.38; /* 24.84px at 18px */
  color: var(--color-text);
}

@media (min-width: 740px) {
  .g-body-text { font-size: 20px; line-height: 30px; }
}

.g-body-text a {
  color: var(--color-link);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}
.g-body-text a:hover { text-decoration-thickness: 2px; }
```

- [ ] **Step 5: Import it in the layout**

In `src/routes/+layout.svelte`, directly under `import '$lib/styles/tokens.css';` add:

```js
import '$lib/styles/article.css';
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx playwright test tests/body.spec.js`
Expected: 3 passed (mobile, tablet, desktop).

- [ ] **Step 7: Commit**

```bash
git add src/lib/styles tests/body.spec.js src/routes/+layout.svelte
git commit -m "feat(shell): measured tokens and NYT body text column"
```

---

### Task 3: Transparent masthead

**Files:**
- Create: `src/lib/shell/Masthead.svelte`
- Modify: `src/routes/+layout.svelte` (full rewrite)
- Test: `tests/masthead.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/masthead.spec.js
import { test, expect } from '@playwright/test';
import { viewport, css } from './helpers.js';

test('masthead floats transparent over the page', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('.mock-masthead').count()).toBe(0);

  const m = await css(page, '[data-testid="masthead-container"]', ['position', 'background-color']);
  expect(m.position).toBe('absolute');
  expect(m['background-color']).toBe('rgba(0, 0, 0, 0)');

  const s = await css(page, '.masthead-section', ['padding-top']);
  expect(Math.round(s.height)).toBe(viewport() === 'mobile' ? 47 : 42);

  await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#site-content');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/masthead.spec.js`
Expected: FAIL. `.mock-masthead` count is 1 and `[data-testid="masthead-container"]` doesn't exist.

- [ ] **Step 3: Create the masthead**

```svelte
<!-- src/lib/shell/Masthead.svelte -->
<script>
  import { base } from '$app/paths';
  let { name = 'The Sandbox Times' } = $props();
</script>

<div class="masthead-container" data-testid="masthead-container">
  <header class="masthead-wrapper">
    <section class="masthead-section">
      <a class="skip-link" href="#site-content">Skip to content</a>
      <a class="wordmark" href="{base}/" aria-label="{name} homepage">{name}</a>
    </section>
  </header>
</div>

<style>
  .masthead-container { position: absolute; top: 6px; left: 0; right: 0; height: 0; z-index: 1000; background: transparent; }
  .masthead-wrapper { position: absolute; top: 0; left: 0; right: 0; }
  .masthead-section {
    position: relative; top: -7px; box-sizing: border-box; height: 42px; padding: 4px 15px 2px;
    display: flex; align-items: center; justify-content: center;
  }
  @media (max-width: 739px) {
    .masthead-section { top: 0; height: 47px; padding: 8px 15px 3px; }
  }
  .wordmark { font-family: var(--font-headline); font-weight: 700; font-size: 22px; color: #000; text-decoration: none; }
  .skip-link {
    position: absolute; left: -9999px; font-family: var(--font-label); font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.02em; background: #fff; padding: 11px 12px 8px; border-radius: 3px; color: #000;
  }
  .skip-link:focus { left: 15px; }
</style>
```

- [ ] **Step 4: Rewrite the layout**

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '$lib/styles/tokens.css';
  import '$lib/styles/article.css';
  import Masthead from '$lib/shell/Masthead.svelte';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&family=Libre+Franklin:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div id="app">
  <Masthead />
  <main id="site-content">{@render children()}</main>
</div>
```

- [ ] **Step 5: Run the tests**

Run: `npx playwright test tests/masthead.spec.js tests/body.spec.js`
Expected: 6 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/shell/Masthead.svelte src/routes/+layout.svelte tests/masthead.spec.js
git commit -m "feat(shell): transparent absolute masthead"
```

---

### Task 4: Header and byline

**Files:**
- Modify: `src/lib/components/Header.svelte` (full rewrite)
- Test: `tests/header.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/header.spec.js
import { test, expect } from '@playwright/test';
import { viewport, css, px, centeredX } from './helpers.js';

const H = {
  mobile: { size: 58, lh: 58, sub: 17.6, byline: 15, col: 350 },
  tablet: { size: 58, lh: 58, sub: 17.6, byline: 16, col: 600 },
  desktop: { size: 96, lh: 88.32, sub: 20, byline: 16, col: 600 }
};

test('hero container and headline', async ({ page }) => {
  await page.goto('/');
  const e = H[viewport()];

  const hc = await css(page, '.header-container', ['margin-top']);
  expect(px(hc['margin-top'])).toBe(90);
  expect(Math.round(hc.height)).toBe(675);

  const h1 = await css(page, '.headline', ['font-size', 'line-height', 'font-weight', 'text-transform']);
  expect(px(h1['font-size'])).toBe(e.size);
  expect(px(h1['line-height'])).toBeCloseTo(e.lh, 1);
  expect(h1['font-weight']).toBe('700');
  expect(h1['text-transform']).toBe('uppercase');

  // No word may spill past the headline box or the viewport (substitute fonts are wider than NYT's)
  const fits = await page.locator('.headline').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return el.scrollWidth <= el.clientWidth && r.left >= 0 && r.right <= document.documentElement.clientWidth;
  });
  expect(fits).toBe(true);

  const sub = await css(page, '.subtitle', ['font-size', 'font-weight']);
  expect(px(sub['font-size'])).toBeCloseTo(e.sub, 1);
  expect(sub['font-weight']).toBe('300');
});

test('byline block', async ({ page }) => {
  await page.goto('/');
  const e = H[viewport()];

  const wrap = await css(page, '.g-extended-byline-wrapper', ['margin-bottom']);
  expect(Math.round(wrap.width)).toBe(e.col);
  expect(Math.abs(wrap.x - centeredX(wrap, e.col))).toBeLessThanOrEqual(1);
  expect(px(wrap['margin-bottom'])).toBe(20);

  const by = await css(page, '.g-byline', ['font-size', 'font-weight']);
  expect(px(by['font-size'])).toBe(e.byline);
  expect(by['font-weight']).toBe('700');

  const bio = await css(page, '.g-extended-bio', ['font-size', 'line-height']);
  expect(px(bio['font-size'])).toBe(15);
  expect(px(bio['line-height'])).toBe(20);

  const t = await css(page, '.g-interactive-timestamp', ['font-size', 'font-weight']);
  expect(px(t['font-size'])).toBe(13);
  expect(t['font-weight']).toBe('500');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/header.spec.js`
Expected: FAIL. `.header-container` has no 90px margin, and `.g-extended-byline-wrapper` doesn't exist.

- [ ] **Step 3: Rewrite the Header component**

```svelte
<!-- src/lib/components/Header.svelte -->
<script>
  import { onMount } from 'svelte';
  import { asset } from '$lib/util/asset.js';

  let { title, subtitle, byline, bio, date, url, urlMobile } = $props();
  let stageDesktop, stageMobile;

  onMount(() => {
    let anim, cancelled = false;
    const mobile = matchMedia('(max-width: 739px)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const path = mobile && urlMobile ? urlMobile : url;
    if (!path) return;

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled) return;
      anim = lottie.loadAnimation({
        container: mobile ? stageMobile : stageDesktop,
        renderer: 'svg', loop: false, autoplay: !reduce, path: asset(path)
      });
      if (reduce) anim.addEventListener('DOMLoaded', () => anim.goToAndStop(anim.totalFrames - 1, true));
    });
    return () => { cancelled = true; anim?.destroy(); };
  });
</script>

<div class="header-container">
  <div class="header-copy">
    <h1 class="headline">{title}</h1>
    {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
  </div>
  <div class="lottie-stage" aria-hidden="true">
    <div class="lottie-header desktop-only" bind:this={stageDesktop}></div>
    <div class="lottie-header mobile-only" bind:this={stageMobile}></div>
  </div>
</div>

<div class="header-byline-placement">
  <div class="g-extended-byline-wrapper">
    <p class="g-byline"><span class="g-last-byline">{byline}</span></p>
    {#if bio}<p class="g-extended-bio">{bio}</p>{/if}
    {#if date}<time class="g-interactive-timestamp">{date}</time>{/if}
  </div>
</div>

<style>
  .header-container { position: relative; height: 675px; margin-top: 90px; background: var(--color-bg); overflow: hidden; }
  .lottie-stage { position: absolute; inset: 0; }
  .lottie-header { width: 100%; height: 100%; }
  .header-copy {
    position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%);
    z-index: 1; box-sizing: border-box; padding: 0 var(--gutter); text-align: center;
  }
  .headline {
    font-family: var(--font-headline); font-weight: 700; text-transform: uppercase; color: var(--color-headline);
    font-size: 58px; line-height: 58px; margin: 2px auto 6px;
    /* NYT uses max-width: 2.64em, which only fits with their condensed face.
       min-content keeps "one word per line" with any substitute font. */
    width: min-content; max-width: 100%;
  }
  .subtitle {
    font-family: var(--font-body); font-weight: 300; color: #000;
    font-size: 17.6px; line-height: 1.4; max-width: 16.05em; margin: 0 auto 16px;
  }
  @media (min-width: 1150px) {
    .headline { font-size: 96px; line-height: 0.92; width: auto; max-width: 5.28em; }
    .subtitle { font-size: 20px; line-height: 28px; max-width: 17.12em; }
  }

  .g-extended-byline-wrapper {
    box-sizing: border-box; width: calc(100% - 2 * var(--gutter)); max-width: var(--col); margin: 0 auto 20px;
    color: var(--color-text);
  }
  .g-byline { margin: 0; font-family: var(--font-label); font-weight: 700; font-size: 15px; line-height: 20px; }
  .g-extended-bio { margin: 2px 0 8px; font-family: var(--font-label); font-weight: 400; font-size: 15px; line-height: 20px; letter-spacing: 0.15px; }
  .g-interactive-timestamp { font-family: var(--font-label); font-weight: 500; font-size: 13px; line-height: 18px; }
  @media (min-width: 740px) {
    .g-byline { font-size: 16px; }
  }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx playwright test tests/header.spec.js`
Expected: 6 passed (2 tests × 3 viewports).

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Header.svelte tests/header.spec.js
git commit -m "feat(shell): NYT header, headline and byline measurements"
```

---

### Task 5: Body links

**Files:**
- Test: `tests/body.spec.js` (append)
- (Implementation already shipped in `article.css` in Task 2; this task locks it with a test.)

- [ ] **Step 1: Append the test**

```js
// tests/body.spec.js (append below the existing test)
test('inline links use NYT link styling', async ({ page }) => {
  await page.goto('/');
  const a = await css(page, 'p.g-text a', ['color', 'text-decoration-line', 'text-underline-offset']);
  expect(a.color).toBe('rgb(50, 104, 145)');
  expect(a['text-decoration-line']).toBe('underline');
  expect(a['text-underline-offset']).toBe('2px');
});
```

- [ ] **Step 2: Run the test**

Run: `npx playwright test tests/body.spec.js`
Expected: 6 passed. If it fails with "locator resolved to 0 elements", the doc has no linked paragraph; see Task 0, Step 2.

- [ ] **Step 3: Commit**

```bash
git add tests/body.spec.js
git commit -m "test(shell): lock body link styling"
```

---

### Task 6: Two-up media block

**Files:**
- Modify: `src/lib/components/ImageTwoUp.svelte` (full rewrite)
- Test: `tests/media.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/media.spec.js
import { test, expect } from '@playwright/test';
import { viewport, css, px } from './helpers.js';

const W = { mobile: 350, tablet: 760, desktop: 1312 };

test('two-up container width and stacking', async ({ page }) => {
  await page.goto('/');
  const c = await css(page, '.image-two-up-container');
  expect(Math.round(c.width)).toBe(W[viewport()]);

  const row = await css(page, '.image-two-up--image-wrapper', ['flex-direction']);
  expect(row['flex-direction']).toBe(viewport() === 'mobile' ? 'column' : 'row');
});

test('group caption styling', async ({ page }) => {
  await page.goto('/');
  const cap = await css(page, '.group-caption', ['font-size', 'color', 'padding-top']);
  expect(px(cap['font-size'])).toBe(15);
  expect(cap.color).toBe('rgb(114, 114, 114)');
  expect(px(cap['padding-top'])).toBe(9);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/media.spec.js`
Expected: FAIL. `.image-two-up-container` doesn't exist yet (the old component uses `.two-up`).

- [ ] **Step 3: Rewrite the component**

```svelte
<!-- src/lib/components/ImageTwoUp.svelte -->
<script>
  import { asset } from '$lib/util/asset.js';
  let { url1, url2, alt1 = '', alt2 = '', groupCaption = '' } = $props();
  const isVideo = (u = '') => u.endsWith('.mp4');
  let media = $derived([{ url: url1, alt: alt1 }, { url: url2, alt: alt2 }].filter((m) => m.url));
</script>

<div class="image-two-up-wrapper">
  <figure class="image-two-up-container">
    <div class="image-two-up--image-wrapper">
      {#each media as m}
        <div class="image-block">
          {#if isVideo(m.url)}
            <video src={asset(m.url)} muted loop playsinline autoplay preload="metadata" aria-label={m.alt}></video>
          {:else}
            <img src={asset(m.url)} alt={m.alt} loading="lazy" />
          {/if}
        </div>
      {/each}
    </div>
    {#if groupCaption}<figcaption class="group-caption">{groupCaption}</figcaption>{/if}
  </figure>
</div>

<style>
  .image-two-up-container {
    box-sizing: border-box; width: calc(100% - 2 * var(--gutter)); max-width: var(--wide);
    margin: 32px auto;
  }
  .image-two-up--image-wrapper { display: flex; flex-direction: row; gap: 12px; }
  .image-block { flex: 1; min-width: 0; }
  .image-block img, .image-block video { display: block; width: 100%; height: auto; }
  .group-caption {
    margin: 4px 0 0; padding-top: 9px;
    font-family: var(--font-body); font-size: 15px; line-height: 18px; color: var(--color-caption);
  }
  @media (max-width: 739px) {
    .image-two-up-container { max-width: var(--col); }
    .image-two-up--image-wrapper { flex-direction: column; }
    .group-caption { margin-top: 0; }
  }
  @media (min-width: 1150px) {
    .group-caption { line-height: 30px; }
  }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx playwright test tests/media.spec.js`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ImageTwoUp.svelte tests/media.spec.js
git commit -m "feat(shell): NYT two-up media block widths and caption"
```

---

### Task 7: Credits

**Files:**
- Modify: `src/lib/components/Credits.svelte` (full rewrite)
- Test: `tests/media.spec.js` (append)

- [ ] **Step 1: Append the failing test**

```js
// tests/media.spec.js (append)
test('credits block', async ({ page }) => {
  await page.goto('/');
  const box = await css(page, '.credits', ['margin-top']);
  expect(Math.round(box.width)).toBe(viewport() === 'mobile' ? 350 : 600);
  expect(px(box['margin-top'])).toBe(25);

  const t = await css(page, '.credits-text', ['font-size', 'line-height', 'font-weight']);
  expect(px(t['font-size'])).toBe(15);
  expect(px(t['line-height'])).toBe(20);
  expect(t['font-weight']).toBe('500');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/media.spec.js -g credits`
Expected: FAIL. `.credits-text` doesn't exist, and `.credits` has the body-text margin.

- [ ] **Step 3: Rewrite Credits**

```svelte
<!-- src/lib/components/Credits.svelte -->
<script>
  let { text = '' } = $props();
</script>

<section class="credits">
  <p class="credits-text">{@html text}</p>
</section>

<style>
  .credits {
    box-sizing: border-box; width: calc(100% - 2 * var(--gutter)); max-width: var(--col);
    margin: 25px auto 20px;
  }
  .credits-text {
    margin: 0; font-family: var(--font-label); font-weight: 500; font-size: 15px; line-height: 20px;
    letter-spacing: 0.15px; color: var(--color-text);
  }
  .credits-text :global(a) { color: inherit; }
</style>
```

- [ ] **Step 4: Run the tests**

Run: `npx playwright test tests/media.spec.js`
Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Credits.svelte tests/media.spec.js
git commit -m "feat(shell): NYT credits block"
```

---

### Task 8: Below-article shell (share tools, recirculation, ad slot, footer)

**Files:**
- Create: `src/lib/shell/ShareTools.svelte`
- Create: `src/lib/shell/Recirc.svelte`
- Create: `src/lib/shell/AdSlot.svelte`
- Create: `src/lib/shell/SiteFooter.svelte`
- Modify: `src/routes/+layout.svelte` (full rewrite)
- Test: `tests/footer.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/footer.spec.js
import { test, expect } from '@playwright/test';
import { viewport, css, px } from './helpers.js';

test('comment button matches NYT', async ({ page }) => {
  await page.goto('/');
  const b = await css(page, '#comment-button-bigBottom', ['background-color', 'text-transform', 'font-size', 'letter-spacing']);
  expect(Math.round(b.width)).toBe(viewport() === 'mobile' ? 350 : 600);
  expect(Math.round(b.height)).toBe(36);
  expect(b['background-color']).toBe('rgb(86, 123, 149)');
  expect(b['text-transform']).toBe('uppercase');
  expect(px(b['font-size'])).toBe(13);
  expect(px(b['letter-spacing'])).toBeCloseTo(0.65, 1);
});

test('platform regions exist in NYT order', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('.mock-footer').count()).toBe(0);
  const order = await page.evaluate(() =>
    ['#site-content', '[data-testid="share-tools"]', '[data-testid="recirculation"]', '#bottom-wrapper', '.site-footer']
      .map((s) => document.querySelector(s)?.getBoundingClientRect().top ?? -1)
  );
  expect(order.every((y) => y >= 0)).toBe(true);
  expect([...order].sort((a, b) => a - b)).toEqual(order);
  await expect(page.locator('#bottom-wrapper')).toContainText('Advertisement');
});

test('footer width', async ({ page }) => {
  await page.goto('/');
  const f = await css(page, '.site-footer', ['max-width', 'padding-bottom', 'font-size']);
  expect(px(f['padding-bottom'])).toBe(45);
  expect(px(f['font-size'])).toBe(11);
  if (viewport() === 'desktop') expect(f['max-width']).toBe('1200px');
  if (viewport() === 'mobile') expect(Math.round(f.width)).toBe(390);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/footer.spec.js`
Expected: FAIL. `#comment-button-bigBottom` doesn't exist yet.

- [ ] **Step 3: Create ShareTools**

```svelte
<!-- src/lib/shell/ShareTools.svelte -->
<script>
  let { comments = 0 } = $props();
</script>

<div class="share-tools" data-testid="share-tools" role="toolbar" aria-label="Share, save and comments">
  <div class="comment-row">
    <button type="button" class="comment-button" id="comment-button-bigBottom">Read {comments} comments</button>
  </div>
  <ul class="share-tools-list" data-testid="share-tools-menu">
    <li><button type="button" class="pill">Share full article</button></li>
    <li><button type="button" class="pill" aria-label="More sharing options">Share</button></li>
    <li><button type="button" class="pill" aria-label="Save article for reading later">Save</button></li>
    <li><button type="button" class="pill" aria-label="Read {comments} comments">{comments}</button></li>
  </ul>
</div>

<style>
  .comment-row {
    box-sizing: border-box; width: calc(100% - 2 * var(--gutter)); max-width: var(--col);
    margin: 1.5rem auto 0;
  }
  .comment-button {
    width: 100%; padding: 5px 0; cursor: pointer;
    background: var(--color-button); border: 1px solid var(--color-link); border-radius: 3px; color: #fff;
    font-family: var(--font-label); font-size: 13px; font-weight: 600; line-height: 24px;
    letter-spacing: 0.05em; text-transform: uppercase; transition: background-color 0.6s ease;
  }
  .comment-button:hover, .comment-button:focus-visible { background: var(--color-link); }
  .share-tools-list {
    box-sizing: border-box; width: calc(100% - 2 * var(--gutter)); max-width: var(--col);
    display: flex; flex-wrap: wrap; gap: 12px; list-style: none; padding: 0; margin: 24px auto 32px;
    font-family: var(--font-label); font-size: 17px; color: #999;
  }
  .pill {
    border: 1px solid #dfdfdf; border-radius: 30px; background: var(--color-bg); color: #121212; cursor: pointer;
    font-family: var(--font-label); font-size: 12px; font-weight: 500; line-height: 16px; text-transform: uppercase;
    padding: 6px 10px;
  }
  .pill:hover { background: var(--color-bg-secondary); }
</style>
```

- [ ] **Step 4: Create Recirc**

```svelte
<!-- src/lib/shell/Recirc.svelte -->
<section class="recirc" data-testid="recirculation" aria-labelledby="recirc-title">
  <h2 id="recirc-title" class="visually-hidden">Related Content</h2>
  <div class="recirc-main">
    <div class="rule"><span class="bar"></span></div>
    <ul class="cards">
      {#each Array(6) as _, i (i)}
        <li class="card"><div class="thumb"></div><div class="line"></div><div class="line short"></div></li>
      {/each}
    </ul>
  </div>
  <aside class="recirc-rail">
    <div class="rule"><span class="bar"></span></div>
    {#each Array(6) as _, i (i)}<div class="line rail-line"></div>{/each}
  </aside>
</section>

<style>
  .recirc { margin-top: 45px; background: var(--color-bg); padding: 0 var(--gutter); }
  .rule { border-top: 2px solid #121212; padding-top: 8px; margin-bottom: 16px; }
  .bar { display: block; width: 175px; height: 20px; background: var(--color-bg-secondary); }
  .cards { list-style: none; padding: 0; margin: 0 0 2rem; display: grid; grid-template-columns: 1fr; gap: 20px; }
  .thumb { aspect-ratio: 1; background: var(--color-bg-secondary); margin-bottom: 6px; }
  .line { height: 14px; background: var(--color-bg-secondary); margin-bottom: 6px; }
  .line.short { width: 60%; }
  .recirc-rail { margin-bottom: 2rem; }
  .rail-line { height: 46px; margin-bottom: 15px; }

  @media (min-width: 740px) {
    .recirc { display: flex; gap: 30px; max-width: var(--page-max); margin: 45px auto 0; padding: 20px 3% 0; }
    .recirc-main { width: 70%; }
    .recirc-rail { flex: 1; }
    .rule { border-top-width: 1px; }
    .cards { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1150px) {
    .recirc-main { width: 80%; }
    .cards { grid-template-columns: repeat(3, 1fr); }
  }
</style>
```

- [ ] **Step 5: Create AdSlot**

```svelte
<!-- src/lib/shell/AdSlot.svelte -->
<div id="bottom-wrapper" class="ad-wrapper">
  <p class="ad-label">Advertisement</p>
  <a class="skip-ad" href="#after-bottom">Skip advertisement</a>
  <div class="ad-box" aria-hidden="true">300 × 250</div>
  <div id="after-bottom"></div>
</div>

<style>
  .ad-wrapper {
    position: relative; min-height: 280px; margin: 1rem auto 2rem; padding: 12px 0 30px; text-align: center;
    background: var(--color-bg-secondary); border-top: 1px solid #e2e2e2; border-bottom: 1px solid #e2e2e2;
  }
  @media (min-width: 740px) { .ad-wrapper { margin: 2rem auto 3rem; } }
  .ad-label {
    margin: 0 0 9px; font-family: var(--font-label); font-size: 10px; font-weight: 500; line-height: 10px;
    letter-spacing: 0.05rem; text-transform: uppercase; color: var(--color-caption);
  }
  .ad-box {
    width: 300px; height: 250px; margin: 0 auto; display: grid; place-items: center;
    border: 1px dashed #ccc; font-family: var(--font-label); font-size: 12px; color: #999;
  }
  .skip-ad { position: absolute; left: -9999px; }
  .skip-ad:focus { left: 50%; transform: translateX(-50%); top: 5px; background: #fff; padding: 8px; font-family: var(--font-label); font-size: 11px; }
</style>
```

- [ ] **Step 6: Create SiteFooter**

```svelte
<!-- src/lib/shell/SiteFooter.svelte -->
<script>
  let { name = 'The Sandbox Times' } = $props();
  const links = ['About', 'Contact Us', 'Accessibility', 'Privacy Policy', 'Terms of Service', 'Site Map', 'Help'];
</script>

<footer class="site-footer">
  <nav class="footer-nav" aria-label="Site information">
    <ul class="copyright"><li><a href="#site-content">© 2026 {name}</a></li></ul>
    <ul class="links">
      {#each links as link}<li><a href="#site-content">{link}</a></li>{/each}
    </ul>
  </nav>
</footer>

<style>
  .site-footer { font-size: 11px; text-align: center; padding: 0 0 45px; }
  @media (min-width: 1024px) { .site-footer { padding: 0 3% 45px; } }
  @media (min-width: 1150px) { .site-footer { max-width: var(--page-max); margin: 0 auto; } }
  .footer-nav { border-top: 1px solid var(--color-rule); padding-top: 9px; margin: 0 0 35px; }
  ul { list-style: none; padding: 0; margin: 0 0 15px; }
  @media (min-width: 600px) { ul { display: inline-block; } }
  li { display: inline-block; line-height: 20px; padding: 0 10px; }
  a { color: var(--color-muted); font-family: var(--font-label); text-decoration: none; white-space: nowrap; padding: 10px 0; }
  a:hover { text-decoration: underline; }
</style>
```

- [ ] **Step 7: Rewrite the layout to compose the full shell**

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '$lib/styles/tokens.css';
  import '$lib/styles/article.css';
  import Masthead from '$lib/shell/Masthead.svelte';
  import ShareTools from '$lib/shell/ShareTools.svelte';
  import Recirc from '$lib/shell/Recirc.svelte';
  import AdSlot from '$lib/shell/AdSlot.svelte';
  import SiteFooter from '$lib/shell/SiteFooter.svelte';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&family=Libre+Franklin:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div id="app">
  <Masthead />
  <main id="site-content">{@render children()}</main>
  <div id="standalone-footer">
    <ShareTools comments={0} />
    <Recirc />
    <AdSlot />
    <SiteFooter />
  </div>
</div>
```

- [ ] **Step 8: Run the tests**

Run: `npx playwright test tests/footer.spec.js`
Expected: 9 passed.

- [ ] **Step 9: Commit**

```bash
git add src/lib/shell src/routes/+layout.svelte tests/footer.spec.js
git commit -m "feat(shell): share tools, recirculation, ad slot and footer"
```

---

### Task 9: Responsive QA pass

**Files:**
- Test: `tests/responsive.spec.js`

- [ ] **Step 1: Write the test**

```js
// tests/responsive.spec.js
import { test, expect } from '@playwright/test';
import { viewport } from './helpers.js';

test('no horizontal scroll at any viewport', async ({ page }) => {
  await page.goto('/');
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth
  }));
  expect(sw).toBeLessThanOrEqual(cw);
});

test('capture review screenshots', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `test-results/review/${viewport()}-top.png` });
  await page.locator('#standalone-footer').screenshot({ path: `test-results/review/${viewport()}-footer.png` });
});
```

- [ ] **Step 2: Run the full suite**

Run: `npx playwright test`
Expected: all passed across mobile, tablet and desktop. If the overflow test fails, find the culprit in the browser console with:

```js
[...document.querySelectorAll('*')].filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
```

- [ ] **Step 3: Compare against the real page by eye**

Open the real article in Chrome DevTools device mode at 390, 800 and 1440 wide, and open `test-results/review/*.png` next to it. Check the headline position in the hero, the byline spacing, the body column edges, the two-up width and the footer stack. Fix any difference by adding a measured value to the spec table and a test, then the CSS.

- [ ] **Step 4: Check the flagged assumptions**

In DevTools on the real page, drag the responsive viewport across 1024 → 1150 → 1200 and note where the headline jumps from 58px to 96px. If it isn't 1150, update the `@media (min-width: 1150px)` rule in `Header.svelte` and the `tablet`/`desktop` rows in `tests/header.spec.js`. Do the same for the two-up `--wide` cap (check its width at 1440).

- [ ] **Step 5: Commit**

```bash
git add tests/responsive.spec.js
git commit -m "test(shell): responsive overflow check and review screenshots"
```

---

## Self-review notes

- **Spec coverage:** masthead (Task 3), hero and byline (Task 4), body column and links (Tasks 2 and 5), wide media (Task 6), credits (Task 7), share tools, comment button, recirculation, ad slot and footer (Task 8), cross-viewport overflow and visual comparison (Task 9).
- **Names stay consistent:** `viewport()`, `css()`, `px()` and `centeredX()` are defined in Task 1 and used unchanged afterward. Selectors in tests match the class names in the components that define them.
- **Out of scope on purpose:** dark mode (the real piece opts out with `g-dark-mode-incompatible`), the in-app webview and a real comments panel.
