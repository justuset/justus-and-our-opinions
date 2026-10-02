// The component registry (NYT sandbox alignment, chunk S1): component name in content/doc.json → Svelte component.
// Adding a new kind of block = one new component + one line here. The doc names components; it never imports them.
import Header from './components/Header.svelte';
import Byline from './components/Byline.svelte';
import TwoUp from './components/TwoUp.svelte';
import Diagram from './components/Diagram.svelte';
import SlidesScrolly from './components/SlidesScrolly.svelte';
import CaptionScrolly from './components/CaptionScrolly.svelte';
import PaintingsScrolly from './components/PaintingsScrolly.svelte';
import ScrubLottie from './components/ScrubLottie.svelte';
import Credits from './components/Credits.svelte';

export const registry = { Header, Byline, TwoUp, Diagram, SlidesScrolly, CaptionScrolly, PaintingsScrolly, ScrubLottie, Credits };

/**
 * Everything in a doc body the renderer can't draw: an unknown block type, or a component name that isn't registered.
 * @param {Array<{ type: string, value: any }>} body
 * @returns {string[]} one message per problem; empty means the doc is fine
 */
export function docProblems(body) {
  return body.flatMap((block, i) => {
    if (block.type === 'text') return [];
    if (block.type !== 'svelte') return [`body[${i}]: unknown block type "${block.type}"`];
    const name = block.value?.component;
    return registry[name] ? [] : [`body[${i}]: missing component "${name}"`];
  });
}
