// The photo essay's measured layout and the PhotoScrolly behavior, ported from the reference's tests/layout.spec.js.
import { test, expect, viewport, css, px } from './helpers.js';

test('header and body type match the reference', async ({ page }) => {
  await page.goto('/');
  const mobile = viewport() === 'mobile';
  const h1 = await css(page, '.headline', ['font-size', 'line-height', 'text-align']);
  expect(px(h1['font-size'])).toBe(mobile ? 40 : 57);
  expect(px(h1['line-height'])).toBe(mobile ? 44 : 60);
  expect(h1['text-align']).toBe('center');

  const p = await css(page, '.g-text', ['font-size']);
  expect(px(p['font-size'])).toBe(mobile ? 18 : 20);
  expect(Math.round(p.width)).toBe(Math.min(600, p.vw - 40));
});

test('lead photo is 945px, full width on phones', async ({ page }) => {
  await page.goto('/');
  const lead = await css(page, '.lead');
  expect(Math.round(lead.width)).toBe(Math.min(945, lead.vw));
});

test('diptych is side by side from 740, stacked below', async ({ page }) => {
  await page.goto('/');
  const pair = await css(page, '.diptych .pair', ['flex-direction']);
  expect(pair['flex-direction']).toBe(viewport() === 'mobile' ? 'column' : 'row');
  if (viewport() === 'desktop') expect(Math.round((await css(page, '.diptych img')).width)).toBe(465);
});

test('PhotoScrolly: stage pins and photos swap as cards cross the middle', async ({ page }) => {
  await page.goto('/');
  const s = page.locator('.photo-scrolly').first();
  await expect(s).toHaveAttribute('data-enhanced');
  const imgs = s.locator('.stage img');
  await expect(imgs.nth(0)).toHaveClass(/is-active/);

  const toMiddle = (step) =>
    s.locator(`.card[data-step="${step}"]`).evaluate((el) => scrollBy(0, el.getBoundingClientRect().top - innerHeight / 2 + 10));

  for (const step of [1, 2]) {
    await toMiddle(step);
    await expect(s).toHaveAttribute('data-active', String(step));
    await expect(imgs.nth(step)).toHaveCSS('opacity', '1');
    expect(Math.round((await s.locator('.stage').boundingBox()).y)).toBe(0);
  }
  await toMiddle(0);
  await expect(s).toHaveAttribute('data-active', '0');
});

test('PhotoScrolly: reduced motion removes the crossfade', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.photo-scrolly[data-enhanced] img').first()).toHaveCSS('transition-duration', '0s');
});

test('every photo has alt text', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('article img:not([alt])').count()).toBe(0);
});

test.describe('JavaScript off', () => {
  test.use({ javaScriptEnabled: false });
  test('every word and every photo is on the page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.headline')).toBeVisible();
    await expect(page.locator('.photo-scrolly').first()).not.toHaveAttribute('data-enhanced');
    for (const img of await page.locator('.photo-scrolly img').all()) await expect(img).toBeVisible();
    await expect(page.locator('.card').last()).toBeVisible();
  });
});
