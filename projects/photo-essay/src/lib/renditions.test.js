import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renditionWidths, renditionPath } from './renditions.js';

test('renditionWidths never upscales and always tops out at the original or 2000', () => {
  assert.deepEqual(renditionWidths(2000), [600, 1200, 2000]);
  assert.deepEqual(renditionWidths(4000), [600, 1200, 2000]);
  assert.deepEqual(renditionWidths(1335), [600, 1200, 1335]);
  assert.deepEqual(renditionWidths(1200), [600, 1200]);
  assert.deepEqual(renditionWidths(500), [500]);
});

test('renditionPath', () => {
  assert.equal(renditionPath('images/calf', 600), 'images/calf-600w.webp');
});
