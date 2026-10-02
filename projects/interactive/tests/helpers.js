// Shared helpers for the e2e specs.
import { test as base } from '@playwright/test';

/**
 * `test` with Google Fonts blocked. The specs assert sizes and positions, not glyph widths, so web fonts only add
 * network flakiness (and in a sandbox without internet, a long wait for every page load).
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await use(page);
  },
});
export { expect } from '@playwright/test';

/** 'mobile' | 'tablet' | 'desktop', from the Playwright project name. */
export const viewport = () => test.info().project.name;

/** Bounding box + the requested computed style properties of the first match. */
export async function css(page, selector, props = []) {
  return page
    .locator(selector)
    .first()
    .evaluate((el, props) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const out = { x: r.left, top: r.top, width: r.width, height: r.height, vw: document.documentElement.clientWidth };
      for (const p of props) out[p] = s.getPropertyValue(p);
      return out;
    }, props);
}

export const px = (v) => parseFloat(v);
