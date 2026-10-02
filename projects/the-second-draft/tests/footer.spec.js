// Below the story: share tools, recirculation, the ad slot and the footer, in the shipped page's order.
import { test, expect, viewport, css, px } from './helpers.js';

test('comment button matches the measured one', async ({ page }) => {
  await page.goto('/');
  const b = await css(page, '#comment-button-bigBottom', ['background-color', 'text-transform', 'font-size', 'letter-spacing']);
  expect(Math.round(b.width)).toBe(viewport() === 'mobile' ? 350 : 600);
  expect(Math.round(b.height)).toBe(36);
  expect(b['background-color']).toBe('rgb(86, 123, 149)');
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
