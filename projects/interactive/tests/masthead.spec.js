// The masthead: transparent, absolutely positioned, scrolls away with the page (measured on the shipped page).
import { test, expect, viewport, css } from './helpers.js';

test('masthead floats transparent over the story', async ({ page }) => {
  await page.goto('/');
  const m = await css(page, '[data-testid="masthead-container"]', ['position', 'background-color']);
  expect(m.position).toBe('absolute');
  expect(m['background-color']).toBe('rgba(0, 0, 0, 0)');

  const s = await css(page, '.masthead-section');
  expect(Math.round(s.height)).toBe(viewport() === 'mobile' ? 47 : 42);

  await expect(page.locator('.wordmark')).toHaveText('Our Opinions');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#site-content');
});

test('masthead scrolls away, and story panels pin to the top of the screen', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.runway[data-enhanced]');
  await page.evaluate(() => scrollTo(0, 1500));
  const m = await css(page, '.masthead-section');
  expect(m.top + m.height).toBeLessThan(0);

  const sticky = await css(page, '.runway[data-enhanced] .sticky', ['top']);
  expect(sticky.top).toBe('0px');
});
