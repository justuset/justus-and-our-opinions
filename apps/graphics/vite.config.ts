import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        // Runes mode for every component in this app (libraries in node_modules decide for themselves).
        runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
      },
      // adapter-static: every route is prerendered to plain HTML at build time (see src/routes/+layout.ts).
      adapter: adapter(),
    }),
  ],
  // The story app owns :5173; the graphics desk owns :5174.
  server: { port: 5174, strictPort: true },
  preview: { port: 4174, strictPort: true },
  // Unit tests run as a separate vitest "project" (as the SvelteKit template sets it up). SvelteKit 3 needs this:
  // a plain top-level test config fails at startup with vite_ssr_environment_not_runnable.
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
    ],
  },
});
