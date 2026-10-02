# Phase 2 · Chunk 00: Monorepo foundation

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
- [x] Node LTS (22+), `.nvmrc`, `.editorconfig`, `.gitignore` (`node_modules`, `build`, `dist`, `.svelte-kit`, `.react-router`, test reports).
- [x] Root `package.json` with `"private": true` and `"workspaces": ["apps/*", "packages/*"]`.
- [x] `apps/story`: `npx create-react-router@latest apps/story` (TypeScript). Keep **`ssr: true`** (Node server rendering, like the Times). Rename the package to `@opinion/story`.
- [x] `apps/graphics`: `npx sv create apps/graphics` (minimal, TypeScript, Prettier, ESLint, Vitest). Add `@sveltejs/adapter-static` and set `prerender = true` in the root layout. Rename to `@opinion/graphics`. Dev port 5174.
- [x] `packages/design-system`: an empty `tokens.css` and a `package.json` with `"exports": { "./tokens.css": "./tokens.css", … }`.
- [x] `packages/archie`: TypeScript library with a stub `parseStory()`.
- [x] Both apps import `@opinion/design-system/tokens.css`. Prove it by setting `body { background: var(--paper) }` from the token.
- [x] Root scripts: `dev` (both apps in parallel with `npm-run-all2` or `concurrently`), `build`, `check`, `lint`, `format`.
- [x] One shared Prettier config (with `prettier-plugin-svelte`) and an ESLint flat config (react-hooks, jsx-a11y, svelte).
- [x] `.github/workflows/ci.yml`: `npm ci` → lint → check → build on push and PR.

## Done when
- `npm run dev` serves the story app on :5173 and the graphics app on :5174.
- **View source** on the story page: the HTML arrives already rendered (SSR), before any JS runs.
- Changing a token in `packages/design-system` updates **both** apps.
- CI is green.

## Concepts to write about
- What a workspace symlink is (`ls -la node_modules/@opinion`)
- SSR vs CSR vs prerender: which one each app uses, and why
- Why the graphics app is a separate project (the Times graphics desk analogy)

## Result
Done: see [learning log 18](../../learning-log/18-phase-2-chunk-00-foundation.md). All four "Done when" checks pass:
- `npm run dev` serves the story app on :5173 and the graphics desk on :5174 (one command, `concurrently`).
- `curl` of the story page returns the rendered `<main>`, including a timestamp from the server-side `loader`, before any JS.
- Editing `--paper` in `packages/design-system/tokens.css` recolored **both** running apps through hot module replacement, without a reload.
- CI: the workflow's exact steps pass from a clean copy (`npm ci` → lint → check → test → build), plus a second job that builds the Phase 1 story project.

Where this plan changed in practice:
- **React Router 7, scaffolded from the v8 generator.** `create-react-router@latest` now makes React Router 8, and the v7 generator's GitHub template download is blocked here. The v8 template's code is valid v7 (the route-module API is the same), so the packages are pinned to `^7.18.4` as `CLAUDE.md` specifies. The generator's Tailwind setup was removed: styling comes from the design system.
- **SvelteKit 3** (now `latest`) with **Vite 8** in both apps, so the workspace has one Vite.
- **npm 11 is required.** npm 10, which ships with Node 22, crashes resolving vitest 4.1's peers. `packageManager` pins npm 11.21.0, and `engines` + `engine-strict` reject npm 10 with a clear message.
- **ESLint 9, not 10**: `eslint-plugin-jsx-a11y` doesn't support 10 yet.
- **Vite is a root dev dependency**, so every workspace shares one copy. With per-app copies, vitest and SvelteKit loaded two instances of the same Vite version, and SvelteKit 3's tests failed (`vite_ssr_environment_not_runnable`).
- **Scripts:** the apps use `check` and `test`. A root `test` script was added, and `lint`/`format` run once at the root.
