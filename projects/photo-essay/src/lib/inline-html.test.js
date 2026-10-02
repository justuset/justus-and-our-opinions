// Run with `npm test` (node --test, built into Node: no test library needed)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inlineHtml } from './inline-html.js';

test('plain text is escaped the way Svelte prints text', () => {
  assert.equal(inlineHtml("The editor's side: 2 < 3 & 4 > 1"), "The editor's side: 2 &lt; 3 &amp; 4 &gt; 1");
});

test('allowed inline tags pass through', () => {
  assert.equal(inlineHtml('A <em>small</em> and <strong>bold</strong> word.'), 'A <em>small</em> and <strong>bold</strong> word.');
  assert.equal(inlineHtml('Read <a href="https://example.com/a?b=1&c=2">this</a>.'), 'Read <a href="https://example.com/a?b=1&amp;c=2">this</a>.');
  assert.equal(inlineHtml('See <a href="#notes">the notes</a> or <a href="/about">about</a>.'), 'See <a href="#notes">the notes</a> or <a href="/about">about</a>.');
});

test('anything else is shown as text, never run', () => {
  assert.equal(inlineHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(inlineHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(inlineHtml('<a href="javascript:alert(1)">x</a>'), '&lt;a href="javascript:alert(1)"&gt;x&lt;/a&gt;');
  assert.equal(inlineHtml('<em onclick="x()">hi</em>'), '&lt;em onclick="x()"&gt;hi&lt;/em&gt;');
});

test('broken nesting falls back to plain text', () => {
  assert.equal(inlineHtml('<em>open'), '&lt;em&gt;open');
  assert.equal(inlineHtml('<em><strong>x</em></strong>'), '&lt;em&gt;&lt;strong&gt;x&lt;/em&gt;&lt;/strong&gt;');
  assert.equal(inlineHtml('stray </em> close'), 'stray &lt;/em&gt; close');
});
