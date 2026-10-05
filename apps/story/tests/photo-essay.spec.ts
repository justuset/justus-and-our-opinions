// /photo-essay: the reference's measured layout, the Scrolly behavior, and the QA fixes, at 390 / 800 / 1440.
import { test as base, expect, type Page } from '@playwright/test';

const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort()); // sizes, not glyphs
    await provide(page);
  },
});
const tier = () => test.info().project.name as 'mobile' | 'tablet' | 'desktop';
const px = (v: string) => parseFloat(v);

async function box(page: Page, selector: string, props: string[] = []) {
  return page
    .locator(selector)
    .first()
    .evaluate((el, props) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const out: Record<string, number | string> = {
        width: r.width,
        top: r.top,
        vw: document.documentElement.clientWidth,
      };
      for (const p of props) out[p] = s.getPropertyValue(p);
      return out;
    }, props);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/photo-essay');
});

test('HeaderBasic: headline 57/60, 40/44 on phones, centered', async ({ page }) => {
  const h1 = await box(page, '[data-testid=headline]', ['font-size', 'line-height', 'text-align']);
  const phone = tier() === 'mobile';
  expect(px(h1['font-size'] as string)).toBe(phone ? 40 : 57);
  expect(Math.round(px(h1['line-height'] as string))).toBe(phone ? 44 : 60);
  expect(h1['text-align']).toBe('center');
  await expect(page.locator('time')).toHaveAttribute('dateTime', '2026-09-05');
});

test('ParagraphBlock: 20/30 in the 600 column, 18 on phones', async ({ page }) => {
  const p = await box(page, '[data-testid=article-body] > p', ['font-size']);
  expect(px(p['font-size'] as string)).toBe(tier() === 'mobile' ? 18 : 20);
  expect(Math.round(p.width as number)).toBe(Math.min(600, (p.vw as number) - 40));
  // inline formats are real elements, not parsed HTML
  await expect(page.locator('[data-testid=article-body] > p em').first()).toHaveText('emphasis');
});

test('MediaFigure: the lead photo is 945, full width on phones, and loads first', async ({ page }) => {
  const lead = await box(page, 'header figure');
  expect(Math.round(lead.width as number)).toBe(Math.min(945, lead.vw as number));
  const img = page.locator('header figure img');
  await expect(img).toHaveAttribute('fetchpriority', 'high');
  const src = await img.evaluate((i: HTMLImageElement) => i.currentSrc);
  expect(src).toMatch(tier() === 'mobile' ? /lead-bronc-600w\.webp$/ : /lead-bronc-1200w\.webp$/);
});

test('Diptych: side by side from 740 (465 each at 1440), stacked on phones', async ({ page }) => {
  const pair = await box(page, '[data-testid=diptych] > div', ['flex-direction']);
  expect(pair['flex-direction']).toBe(tier() === 'mobile' ? 'column' : 'row');
  if (tier() === 'desktop')
    expect(Math.round((await box(page, '[data-testid=diptych] img')).width as number)).toBe(465);
});

test('Scrolly: stage pins, photos reveal cumulatively as cards come on screen', async ({ page }) => {
  const s = page.locator('[data-testid=scrolly]').first();
  await expect(s).toHaveAttribute('data-enhanced', 'true');
  const imgs = s.locator('img');
  const cards = s.locator('p[data-step]');
  const n = await cards.count();
  for (let step = 1; step < n; step++) {
    // bring the card's top just inside the bottom of the screen: the default observer counts it at once
    await cards.nth(step).evaluate((el) => scrollBy(0, el.getBoundingClientRect().top - innerHeight + 40));
    await expect(s).toHaveAttribute('data-active', String(step));
    for (let k = 0; k <= step; k++) await expect(imgs.nth(k)).toHaveCSS('opacity', '1');
    if (step + 1 < n) await expect(imgs.nth(step + 1)).toHaveCSS('opacity', '0');
    expect(Math.round((await s.locator('img').first().boundingBox())!.y)).toBe(0);
  }
});

test('Scrolly: reduced motion removes the crossfade', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('[data-testid=scrolly][data-enhanced] img').first()).toHaveCSS('transition-duration', '0s');
});

test('QA fixes: real alt text and no duplicate ids', async ({ page }) => {
  expect(await page.locator('#story img:not([alt])').count()).toBe(0);
  expect(await page.locator('#story img[alt="photo"]').count()).toBe(0);
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(dupes).toEqual([]);
});

test('platform blocks: ad slots and related links sit in the body', async ({ page }) => {
  await expect(page.locator('#story [data-testid=ad-slot]')).toHaveCount(2);
  await expect(page.locator('[data-testid=related-links] li')).toHaveCount(2);
});

test('no console errors (hydration included)', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.reload();
  await expect(page.locator('[data-testid=scrolly]').first()).toHaveAttribute('data-enhanced', 'true');
  expect(errors).toEqual([]);
});

test.describe('JavaScript off', () => {
  test.use({ javaScriptEnabled: false });
  test('every word and every photo is on the page', async ({ page }) => {
    await expect(page.locator('[data-testid=headline]')).toBeVisible();
    const s = page.locator('[data-testid=scrolly]').first();
    await expect(s).not.toHaveAttribute('data-enhanced');
    for (const img of await s.locator('img').all()) await expect(img).toBeVisible();
    await expect(s.locator('p[data-step]').last()).toBeVisible();
  });
});
