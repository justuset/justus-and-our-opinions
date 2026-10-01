# Chunk 00: Monorepo foundation

**Goal:** One repo with two apps shaped like the Times's two front-end worlds (a React story page and a SvelteKit
graphics desk) and two shared packages, all linted, type-checked and built in CI.

**Reference:** `docs/architecture.md`; diatour-nyt §III.I (React + Node SSR), §III.II (Svelte graphics
toolkit), §VIII.IX (Vite, TypeScript, lint), §XI (Git, GitHub, deployment).
**Skills:** `svelte-deployment` (Vite + plugin versions), `sveltekit-structure` (project layout).

## Learn first
- [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)
- [React Router 7: framework mode, installation](https://reactrouter.com/start/framework/installation) and [rendering strategies](https://reactrouter.com/start/framework/rendering)
- [SvelteKit: creating a project](https://svelte.dev/docs/kit/creating-a-project) and [project structure](https://svelte.dev/docs/kit/project-structure)

## Tasks
- [ ] Node LTS (22+), `.nvmrc`, `.editorconfig`, `.gitignore` (`node_modules`, `build`, `dist`, `.svelte-kit`, `.react-router`, test reports).
- [ ] Root `package.json` with `"private": true` and `"workspaces": ["apps/*", "packages/*"]`.
- [ ] `apps/story`: `npx create-react-router@latest apps/story` (TypeScript). Keep **`ssr: true`** (Node server rendering, like the Times). Rename the package to `@opinion/story`.
- [ ] `apps/graphics`: `npx sv create apps/graphics` (minimal, TypeScript, Prettier, ESLint, Vitest). Add `@sveltejs/adapter-static` and set `prerender = true` in the root layout. Rename to `@opinion/graphics`. Dev port 5174.
- [ ] `packages/design-system`: an empty `tokens.css` and a `package.json` with `"exports": { "./tokens.css": "./tokens.css", … }`.
- [ ] `packages/archie`: TypeScript library with a stub `parseStory()`.
- [ ] Both apps import `@opinion/design-system/tokens.css`. Prove it by setting `body { background: var(--paper) }` from the token.
- [ ] Root scripts: `dev` (both apps in parallel with `npm-run-all2` or `concurrently`), `build`, `check`, `lint`, `format`.
- [ ] One shared Prettier config (with `prettier-plugin-svelte`) and an ESLint flat config (react-hooks, jsx-a11y, svelte).
- [ ] `.github/workflows/ci.yml`: `npm ci` → lint → check → build on push and PR.

## Done when
- `npm run dev` serves the story app on :5173 and the graphics app on :5174.
- **View source** on the story page: the HTML arrives already rendered (SSR), before any JS runs.
- Changing a token in `packages/design-system` updates **both** apps.
- CI is green.

## Concepts to write about
- What a workspace symlink is (`ls -la node_modules/@opinion`)
- SSR vs CSR vs prerender: which one each app uses, and why
- Why the graphics app is a separate project (the Times graphics desk analogy)
