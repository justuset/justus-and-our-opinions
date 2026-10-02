// Every tier: no sideways scroll, plus screenshots for comparing with the real page by eye.
import { test, expect, viewport } from './helpers.js';

test('no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw);
});

test('capture review screenshots', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `test-results/review/${viewport()}-top.png` });
  await page.locator('#standalone-footer').screenshot({ path: `test-results/review/${viewport()}-footer.png` });
});
