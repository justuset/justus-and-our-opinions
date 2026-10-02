// Runs at build time (prerender), and again in the browser when the page hydrates. Vite inlines content/doc.json, so the
// HTML in dist/index.html already contains every word of the story.
//
// content/doc.json is the story's "Google Doc": one ordered `body` of text and svelte blocks, the shape of the shipped
// NYT payload (docs/reference/nyt-sandbox-blueprint.md §5). A block the renderer can't draw fails the production build
// here, with the block's position and name. In dev it shows a placeholder instead, so you can keep working.
import { dev } from '$app/environment';
import doc from '../../content/doc.json';
import { docProblems } from '$lib/blocks.js';

export function load() {
  const problems = docProblems(doc.body);
  if (problems.length && !dev) throw new Error(`content/doc.json can't be rendered:\n  ${problems.join('\n  ')}`);
  return { doc };
}
