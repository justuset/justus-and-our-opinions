import adapter from '@sveltejs/adapter-static';
import { createHash } from 'node:crypto';

// One hash per build. Any unique string works (a git SHA, a timestamp). It becomes the code folder's name,
// so every build's JavaScript and CSS get brand-new URLs and can be cached forever.
// SvelteKit evaluates this file more than once per build (client build, server build, the forked prerender process).
// A bare Date.now() would give each evaluation a different hash, so it's computed once and kept in an environment
// variable that later evaluations, and child processes, reuse. (A fix to the spec, found by checking the build output.)
const buildHash = (process.env.BUILD_HASH ??= createHash('sha256')
  .update(String(Date.now()))
  .digest('base64url')
  .slice(0, 43));

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    // adapter-static writes plain files. No server is needed to host the story.
    adapter: adapter({ pages: 'dist', assets: 'dist', fallback: undefined }),

    // Name of the code folder: dist/_app.<build-hash>/immutable/...
    appDir: `_app.${buildHash}`,

    // Relative URLs (./_app.…) so the dist/ folder works under any CDN path, e.g. <cdn>/projects/<project-id>/.
    paths: { base: '', relative: true },

    // Render every page to HTML at build time. The story is readable before any JavaScript runs.
    prerender: {
      entries: ['*'],
      // The prerender crawler follows every link and <img src> in the page. Media lives in _big_assets.<hash>/, which is
      // copied into dist/ AFTER this build (adapter-static empties dist/ first), so those URLs 404 at crawl time.
      // Skip them here; scripts/hash-assets.js --copy then checks every media URL in index.html points at a real file.
      handleHttpError: ({ path, message }) => {
        if (path.includes('/_big_assets.')) return;
        throw new Error(message);
      }
    },

    // Keep entry/, nodes/ and chunks/ as separate files (the shape seen on the live page).
    output: { bundleStrategy: 'split' }
  }
};
