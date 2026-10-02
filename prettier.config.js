// One Prettier config for the whole workspace (Phase 2, chunk 00).
// Matches the style the Phase 1 code already uses: 2 spaces, single quotes, long lines.
/** @type {import('prettier').Config} */
export default {
  singleQuote: true,
  printWidth: 120,
  trailingComma: 'all',
  plugins: ['prettier-plugin-svelte'],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
};
