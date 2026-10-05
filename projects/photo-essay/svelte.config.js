// The SvelteKit settings are shared by every Birdkit-style template: see ../birdkit-kit/config.js (every setting is
// commented there). The adapter is imported here because only the template has node_modules.
import adapter from '@sveltejs/adapter-static';
import { kit } from '../birdkit-kit/config.js';

/** @type {import('@sveltejs/kit').Config} */
export default { kit: kit(adapter) };
