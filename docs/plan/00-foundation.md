# Chunk 00: Project foundation

**Goal:** A running Astro project with Svelte and React wired in, formatting, linting and a CI skeleton, so
every later chunk starts from a clean, checked base.

**Reference:** diatour-nyt §VIII.IX (Vite, TypeScript, lint, tests) and §XI (Git, GitHub, deployment). See also `docs/architecture.md`.

## Learn first
- [Astro: Getting started](https://docs.astro.build/en/getting-started/) and [Islands architecture](https://docs.astro.build/en/concepts/islands/)
- [Astro + Svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/), [Astro + React](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Node version managers (nvm / fnm)](https://nodejs.org/en/download/package-manager)

## Tasks
- [ ] Install Node LTS (22 or later). Add `.nvmrc` with the version number.
- [ ] `npm create astro@latest .` → choose **Empty**, **TypeScript: strict**, install deps, don't init git (already done).
- [ ] `npx astro add svelte react`. Read the diff it makes to `astro.config.mjs` and `package.json`.
- [ ] Add a `.gitignore` (`node_modules/`, `dist/`, `.astro/`, `test-results/`, `playwright-report/`).
- [ ] Prettier with `prettier-plugin-astro` and `prettier-plugin-svelte`. Add a `format` script.
- [ ] ESLint (flat config) with `eslint-plugin-astro`, `eslint-plugin-svelte`, `eslint-plugin-react-hooks`, `jsx-a11y`. Add a `lint` script.
- [ ] `npm run check`, which runs `astro check` for types.
- [ ] One proof page, `src/pages/index.astro`, rendering a tiny Svelte counter and a tiny React counter, both `client:visible`.
- [ ] `.github/workflows/ci.yml`: install → `lint` → `check` → `build` on every push and PR.
- [ ] `.editorconfig` (2 spaces, LF, final newline).

## Done when
- `npm run dev` serves the proof page, and both counters work.
- `npm run build && npm run preview` works. **View the page source**: the counters' text is in the HTML before any JS runs.
- CI is green on the pushed branch.

## Concepts to write about in the log
- What `client:visible` actually does (look at the network tab: when does the Svelte runtime download?)
- The difference between `dependencies` and `devDependencies`
- Why we commit `package-lock.json`

## Commit plan
`chore: scaffold astro project` → `chore: add svelte and react integrations` → `chore: add prettier and eslint` → `ci: add build workflow`
