// Runs at build time (prerender). Vite reads content/story.json and inlines it into the page data,
// so the HTML in dist/index.html already contains every word of the story.
import story from '../../content/story.json';

export function load() {
  return { story };
}
