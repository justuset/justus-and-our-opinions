// Below the story: share tools, recirculation, the ad slot and the footer, in the shipped page's order.
import { test, expect, viewport, css, px } from './helpers.js';

test('comment button: measured size and type, diatour colors', async ({ page }) => {
  await page.goto('/');
  const b = await css(page, '#comment-button-bigBottom', ['background-color', 'text-transform', 'font-size', 'letter-spacing']);
  expect(Math.round(b.width)).toBe(viewport() === 'mobile' ? 350 : 600);
  expect(Math.round(b.height)).toBe(36);
  expect(b['background-color']).toBe('rgb(237, 237, 235)'); // diatour --ink fill (the shipped page's is blue)
  expect(b['text-transform']).toBe('uppercase');
  expect(px(b['font-size'])).toBe(13);
  expect(px(b['letter-spacing'])).toBeCloseTo(0.65, 1);
});

test('platform regions come after the story, in order', async ({ page }) => {
  await page.goto('/');
  const order = await page.evaluate(() =>
    ['#site-content', '[data-testid="share-tools"]', '[data-testid="recirculation"]', '#bottom-wrapper', '.site-footer'].map(
      (s) => (document.querySelector(s) ? document.querySelector(s).getBoundingClientRect().top + scrollY : -1),
    ),
  );
  expect(order.every((y) => y >= 0)).toBe(true);
  expect([...order].sort((a, b) => a - b)).toEqual(order);
  await expect(page.locator('#bottom-wrapper')).toContainText('Advertisement');
});

test('footer width and type', async ({ page }) => {
  await page.goto('/');
  const f = await css(page, '.site-footer', ['max-width', 'padding-bottom', 'font-size']);
  expect(px(f['padding-bottom'])).toBe(45);
  expect(px(f['font-size'])).toBe(11);
  if (viewport() === 'desktop') expect(f['max-width']).toBe('1200px');
  if (viewport() === 'mobile') expect(Math.round(f.width)).toBe(390);
});

test('the shell is diatour dark', async ({ page }) => {
  await page.goto('/');
  const body = await css(page, 'body', ['background-color', 'color']);
  expect(body['background-color']).toBe('rgb(18, 18, 17)'); // --paper
  expect(body.color).toBe('rgb(237, 237, 235)'); // --ink
  const ad = await css(page, '#bottom-wrapper', ['background-color']);
  expect(ad['background-color']).toBe('rgb(27, 27, 26)'); // --surface-2
  const link = await css(page, '.site-footer a', ['color']);
  expect(link.color).toBe('rgba(235, 235, 240, 0.56)'); // --faint
});
