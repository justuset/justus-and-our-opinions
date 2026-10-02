// Run with `npm test`. Only the pure part of the engine is tested here; ScrollTrigger itself needs a browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepOf } from './scroll.js';

test('each step owns an equal slice of progress', () => {
  assert.equal(stepOf(0, 6), 0);
  assert.equal(stepOf(0.1666, 6), 0);
  assert.equal(stepOf(1 / 6, 6), 1); // a marker sits at i / steps, and the step changes exactly there
  assert.equal(stepOf(0.5, 6), 3);
});

test('the end of the track stays on the last step', () => {
  assert.equal(stepOf(1, 6), 5);
  assert.equal(stepOf(1, 1), 0);
});

test('fractional step counts (the scrub section uses 2.5) never pass the last whole step', () => {
  assert.equal(stepOf(0.99, 2.5), 2);
  assert.equal(stepOf(1, 2.5), 2);
});
