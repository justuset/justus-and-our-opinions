import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // In dev, the server may read content/doc.json and serve raw media from big_assets/.
  // ('src' and 'node_modules' are allowed by SvelteKit already; listing them keeps the default working.)
  server: { fs: { allow: ['content', 'big_assets', 'src', 'node_modules', '.svelte-kit', '../birdkit-kit'] } },
  // ../birdkit-kit has no node_modules of its own. Its components must use THIS template's Svelte, not whatever copy a
  // lookup from that folder would find, or the page would load two Svelte runtimes.
  resolve: { dedupe: ['svelte'] }
});
