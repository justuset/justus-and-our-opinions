# Learning log 18: Phase 2, chunk 00: The monorepo foundation

**Date:** 2026-10-02  **Chunk:** Phase 2 · 00  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One repo shaped like the Times's two front-end worlds:

- **A React story page,** server-rendered on Node (`apps/story`).
- **A SvelteKit graphics desk** (`apps/graphics`).
- **Two shared packages:** the design system's tokens (`packages/design-system`) and the ArchieML parser (`packages/archie`, a stub for now).

Everything is linted, type-checked, tested and built in CI.

## What I built

```
package.json            "workspaces": ["apps/*", "packages/*"], root scripts, shared lint/format tooling
.nvmrc .npmrc .editorconfig .gitignore .prettierignore prettier.config.js eslint.config.js
.github/workflows/ci.yml
apps/story/             @opinion/story     React 19 + React Router 7, ssr: true, Vite 8, :5173
apps/graphics/          @opinion/graphics  SvelteKit 3 + Svelte 5, adapter-static, prerender = true, :5174
packages/design-system/ @opinion/design-system  tokens.css (--paper, --ink, --font-body), exported as a file
packages/archie/        @opinion/archie    parseStory() stub + its type, with one vitest test
```

**How it was made:**
- **Both apps came from their official generators**, run non-interactively (`create-react-router --yes --no-install`, `sv create --template minimal --types ts --add prettier eslint vitest sveltekit-adapter`). I then reshaped them:
  - renamed them to `@opinion/*`;
  - removed the template demo pages, the React template's Tailwind and Dockerfile, and the per-app lint and format configs;
  - pointed both at the shared tokens.
- **One `npm install` at the root installs everything.**

## Concepts

### What a workspace symlink is

After `npm install`:

```
$ ls -la node_modules/@opinion
archie        -> ../../packages/archie
design-system -> ../../packages/design-system
graphics      -> ../../apps/graphics
story         -> ../../apps/story
```

Each workspace is **linked, not copied**. When `apps/story/app/app.css` says `@import '@opinion/design-system/tokens.css'`, Node's normal package lookup finds `node_modules/@opinion/design-system`, which *is* `packages/design-system`. Edit the package and every app sees the change at once, with no publish step.

The design-system package has no build step. Its `package.json` `"exports"` maps `./tokens.css` to the file itself, and each app's Vite bundles it. `@opinion/archie` does the same with TypeScript: `"exports": { ".": "./src/index.ts" }`, compiled by whichever app imports it. That's the **internal package** pattern: fine for private packages in one repo, though you'd add a build if you published to npm.

### SSR vs CSR vs prerender, and which app uses which

| | When the HTML is made | Who uses it here | Why |
|---|---|---|---|
| **SSR** (server-side rendering) | On every request, by a Node server | `apps/story` (`ssr: true`) | Like the Times's article pages: per-request data (later: the story from ArchieML, personalization), full HTML for readers and crawlers, then React hydrates it |
| **Prerender** (static generation) | Once, at build time | `apps/graphics` (`prerender = true` + adapter-static) | Graphics and their preview pages don't change per request. Static files are cheapest to serve and cache, which is the same idea as Phase 1's Birdkit-style project |
| **CSR** (client-side rendering) | In the browser, after JS loads | Nobody, for first paint | The page would be blank without JS. Both apps still *hydrate* and become interactive client-side after their HTML arrives |

The build outputs show the difference:
- **Story:** `apps/story/build/server/index.js` is a renderer that runs per request.
- **Graphics:** `apps/graphics/build/index.html` was rendered once, at build time.

Served by `npm run start`, the story page's `<time>` changes on every request. The graphics file never changes until the next build.

### Why the graphics app is a separate project

At the Times, articles come from the platform's React codebase, while graphics and visual essays come from the **graphics desk** with its own tools (Svelte, ArchieML, ai2html), its own release pace, and its own team. Keeping `apps/graphics` separate mirrors that:

- **Its own framework** and build output.
- **Releases without touching the article template.**
- **One shared contract** (from chunk 05): the story app only ever sees `{ graphic, props }` and an embed's HTML, never the desk's internals.

The shared design-system package is what keeps the two looking like one publication.

## Checks ("Done when")

| Check | Result |
|---|---|
| `npm run dev` serves both | `[story] ➜ Local: http://localhost:5173/` and `[graphics] ➜ Local: http://localhost:5174/`, both answering `200` |
| View source on the story page is already rendered | `curl` returns `<main><p>Our Opinions</p><h1>Story app</h1><p>… rendered on the server at <time dateTime="2026-10-02T17:53:32.660Z">…` before any JS runs |
| A token change updates both apps | With both dev servers open in a browser, I changed `--paper` from `#121211` to `#3a1f5c`. Both bodies went from `rgb(18, 18, 17)` to `rgb(58, 31, 92)` with **no reload** (Vite's hot module replacement), then back when restored |
| CI is green | The workflow's exact steps pass from a clean copy of the committed files: `npm ci` ✅ lint ✅ check ✅ test ✅ build ✅. The Phase 1 project job passes too ("verified 23 media URLs") |

**Lint is really wired.** A clean run doesn't prove the React and Svelte rules apply to the right files. So I added two throwaway files with known problems and got all three expected errors:
- `react-hooks/rules-of-hooks` (a conditional `useState`);
- `jsx-a11y/alt-text` (an `<img>` without `alt`);
- `svelte/require-each-key` (an unkeyed `{#each}`).

## What broke and how I fixed it

1. **The tools have moved on since the plan was written.** `create-react-router@latest` now makes **React Router 8**, with Tailwind and Vite 8. `CLAUDE.md` and `docs/architecture.md` specify React Router 7, so I kept 7.
   - The v7 generator downloads its template from GitHub, which is blocked here (403).
   - So I used the v8 generator's bundled template, whose route modules are valid v7 code, and pinned `react-router` / `@react-router/*` to `^7.18.4`.
   - React Router 7.18 accepts Vite 8, so both apps share one Vite major.
   - Upgrading to React Router 8 is a deliberate decision for later, not something to drift into by accident.
2. **npm crashed with no useful message.** `Cannot read properties of null (reading 'edgesOut')`.
   - **Bisecting:** first by workspace, then down to a scratch folder containing only `vitest`. The bug is in npm 10's resolution of vitest **4.1**'s peer dependencies. vitest 4.0.18 installs fine, but it bundles Vite 6/7, which would clash with the apps' Vite 8.
   - **The fix is the tool, not the dependency:** npm 11 installs the tree cleanly. `package.json` now says `"packageManager": "npm@11.21.0"` and `"engines": { "npm": ">=11" }`, and `.npmrc` has `engine-strict=true`. Anyone on npm 10 gets a clear "unsupported engine" error instead of the crash, and CI installs npm 11 before `npm ci`.
3. **npm 11.21 blocks dependency install scripts by default.** It listed one, `esbuild`'s postinstall. That script only double-checks the platform binary npm already installed, so I recorded an explicit `"allowScripts": { "esbuild": false }` (via `npm install-scripts deny esbuild`) and confirmed every build works without it. Allowing a package to run code at install time should be a decision someone makes on purpose.
4. **SvelteKit 3's tests failed at startup:** `vite_ssr_environment_not_runnable`. The pristine template passed in a scratch folder, so the problem was mine.
   - I'd simplified the template's vitest `projects` block; restoring it didn't help.
   - The real cause: there was **no Vite at the workspace root**. npm had nested a copy of Vite 8.3.2 inside each workspace, so vitest (hoisted to the root) loaded one copy and SvelteKit another.
   - Same version, two module instances: SvelteKit's `instanceof RunnableDevEnvironment` check fails across them.
   - Adding `vite` to the root `devDependencies` gives the whole workspace one shared copy.
   - Lesson: in a monorepo, a tool and its plugins must resolve to **the same installed copy** of their shared dependency, not just the same version number.
5. **ESLint 9, not 10.** `eslint-plugin-jsx-a11y` doesn't declare support for ESLint 10 yet. Every other plugin supports 9.
6. **I killed my own shell, again.** `pkill -f concurrently` matched the shell running the command, because the command's text contains the word. It's the same mistake I made once in Phase 1. Servers get stopped by port (`lsof -t -i:5173`) from now on.

## Decisions worth noting

- **One Prettier and one ESLint config at the root.** Prettier uses 2 spaces, single quotes and 120 columns, matching the Phase 1 code. ESLint's blocks are scoped by path: React rules only for `apps/story`, Svelte rules only for `apps/graphics`.
- **The finished Phase 1 work is left exactly as built.** `prototype/`, `projects/` and `docs/` are excluded from formatting and linting. `projects/interactive/` is not a workspace: it keeps its own lockfile, like every Birdkit-style story, and CI builds it in its own job.
- **Tokens use Phase 1's diatour values** (`--paper #121211`, `--ink #ededeb`, the `--font-body` stack from `docs/design-system.md`). Chunk 01 replaces this minimal file with the full rem-based system.

## Next

[Phase 2, chunk 01: the design system package](../plan/phase-2/01-tokens-and-base-css.md).
