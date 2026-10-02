// The component registry: component name in content/doc.json → Svelte component (same contract as projects/interactive).
// Adding a new kind of block = one new component + one line here. The doc names components; it never imports them.
import Header from './components/Header.svelte';
import Photo from './components/Photo.svelte';
import Diptych from './components/Diptych.svelte';
import PhotoScrolly from './components/PhotoScrolly.svelte';
import Bio from './components/Bio.svelte';

export const registry = { Header, Photo, Diptych, PhotoScrolly, Bio };

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
