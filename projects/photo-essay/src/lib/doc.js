// Reading the content document's flat props (NYT sandbox alignment, chunk S1).
//
// content/doc.json passes every setting as a flat key/value pair, the way doc-converted content arrives at the Times
// (docs/reference/nyt-sandbox-blueprint.md §5). A list of things becomes numbered keys: heading1, card1, heading2…
// series() turns those back into an array of objects for the component to loop over.

/**
 * series({ heading1: 'a', card1: 'x', heading2: 'b', card2: 'y' }, ['heading', 'card'])
 *   → [{ heading: 'a', card: 'x' }, { heading: 'b', card: 'y' }]
 * Stops at the first number where none of the fields exist.
 * @param {Record<string, unknown>} props
 * @param {string[]} fields
 */
export function series(props, fields) {
  const items = [];
  for (let n = 1; fields.some((f) => props[`${f}${n}`] !== undefined); n++) {
    items.push(Object.fromEntries(fields.map((f) => [f, props[`${f}${n}`]])));
  }
  return items;
}

/** "a.webp, b.webp" → ["a.webp", "b.webp"]. For props that arrive as comma-separated strings. */
export const list = (str = '') =>
  String(str)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
