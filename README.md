# justus-and-our-opinions

A learning project: an **interactive Opinion-style article template** for telling stories on the web, built with
HTML, CSS and JavaScript, plus **Svelte** for bespoke graphics and **React** for recurring interactive formats.

The visual system follows the *diatour-nyt* artifacts (dark editorial paper, display serif, Roman-numeral
parts). The engineering approach stays as close as possible to how New York Times Opinion pages are built, as analyzed
there: a **React article page rendered on the server and hydrated**, with **Svelte/SvelteKit graphics** built
separately and embedded, and story copy in **ArchieML**.

> This is an independent study project. It doesn't use Times branding, logos or proprietary typefaces,
> and the demo content is invented.

## Status

✅ **Phase 1 complete.** Phase 1 rebuilds the NYT-style scrolly article by hand in one `prototype/index.html`, in ten chunks with a browser checkpoint each. Chunks [1](docs/plan/phase-1/01-skeleton-and-content-model.md)–[10](docs/plan/phase-1/10-scrubbed-lottie-and-hardening.md) are built, and [chunk 11](docs/plan/phase-1/11-optional-svelte-port.md)'s parity check passes, so **Phase 1 is complete** ([retro](docs/learning-log/17-phase-1-retro.md)). [Phase 2](docs/plan/phase-2/README.md) ports it to the Times-shaped stack, and its [chunk 00](docs/plan/phase-2/00-foundation.md) (the monorepo foundation) is done.

🧭 **NYT sandbox alignment in progress.** The story project is being reshaped to match the shipped NYT page's architecture ([plan](docs/plan/nyt-sandbox-alignment.md)): S1 (the `body` content document) and S2 (the platform shell) are done, and next is S3, NYT breakpoints and themes. After S8, Phase 2 resumes at chunk 01.

🔀 **Branches:** `main` is the default branch. The work so far is in [PR #1](https://github.com/justuset/justus-and-our-opinions/pull/1) from `claude/wonderful-knuth-w43l2c`.

🏗 **Story project in place.** [`projects/the-second-draft/`](projects/the-second-draft/) is a Birdkit-style SvelteKit project whose build output matches a live NYT interactive's folder shape: a prerendered `index.html`, a hashed `_app.<build-hash>/` and a hashed `_big_assets.<content-hash>/`. Each prototype chunk is ported into it once its checkpoint passes. All chunks are ported, and `npm run parity` confirms the project matches the prototype within 1px at 375, 1024 and 1440px.

## Repository layout

```
justus-and-our-opinions/
├─ README.md · CLAUDE.md
├─ package.json                npm workspaces: apps/* and packages/* (Phase 2)
├─ apps/
│  ├─ story/                   @opinion/story: React 19 + React Router 7, Node SSR (:5173)
│  └─ graphics/                @opinion/graphics: SvelteKit 3 + Svelte 5, prerendered (:5174)
├─ packages/
│  ├─ design-system/           @opinion/design-system: diatour tokens.css, shared by both apps
│  └─ archie/                  @opinion/archie: ArchieML → typed blocks (stub until Phase 2 chunk 03)
├─ .github/workflows/ci.yml    lint → check → test → build on every push and PR
├─ .claude/skills/             Svelte skills for Claude Code (vendored, MIT)
├─ docs/                       plans, references, learning log, guides/ (how-tos), and the guides below
├─ prototype/index.html        Phase 1 sandbox: plain HTML/CSS/JS, one idea per chunk
└─ projects/
   └─ the-second-draft/        Birdkit-style story project (SvelteKit → dist/index.html + _app.<hash>/ + _big_assets.<hash>/)
      ├─ content/doc.json      the words, as one ordered body of blocks (the NYT payload shape)
      ├─ big_assets/           media, hashed and deployed separately
      ├─ scripts/              hash-assets.js, deploy.js
      └─ src/                  app.html, app.css, routes/, lib/ (assets.js, scroll.js, lottie.js, components/)
```

Every folder and file is explained in **[docs/project-structure.md](docs/project-structure.md)**.

### Phase 2 workspace commands

Node 22+ and **npm 11** (`npm install --global npm@11.21.0`; Node 22 ships npm 10, which can't install this tree).

```bash
npm install        # once, at the root: installs every app and package, links @opinion/* together
npm run dev        # story app on http://localhost:5173 and graphics desk on http://localhost:5174, together
npm run build      # build every workspace
npm run check      # type-check (tsc, svelte-check)
npm test           # unit tests (vitest)
npm run lint       # prettier --check + eslint
npm run format     # prettier --write
```

## Start here

| Read | What's in it |
|------|--------------|
| [docs/project-structure.md](docs/project-structure.md) | **How the story project is organized, built and shipped**: every file, the build pipeline, source → output, caching, deploy, the fixes to the spec, how-tos and a glossary |
| [docs/reference/birdkit-build-spec.md](docs/reference/birdkit-build-spec.md) | The Birdkit-style build spec the project follows ([PDF](docs/reference/birdkit-build-spec.pdf)) |
| [docs/guides/github-repo-from-scratch.md](docs/guides/github-repo-from-scratch.md) | **Set up a GitHub repo yourself, by hand**: tools, identity, sign-in, creating the repo, the first push, the branch → PR → merge loop, default branch, CI and protecting `main`, plus how this repo's own history went and how to run the project locally |
| [docs/learning-log/](docs/learning-log/) | A running journal. Starts with [01: repo setup, first commit and README](docs/learning-log/01-repo-setup.md) |
| [docs/reference/scrolly-template-breakdown.md](docs/reference/scrolly-template-breakdown.md) | **How the NYT-style scrolly article is built**, part by part, for designers and developers, with verified measurements and known bugs. [Shareable page](https://claude.ai/artifact/EEvaHehYdR7vNAMkXd697j) |
| [docs/reference/diatour-nyt-analysis.md](docs/reference/diatour-nyt-analysis.md) | What the diatour-nyt artifacts say about the Times stack and Opinion page anatomy |
| [docs/architecture.md](docs/architecture.md) | The Times-shaped stack: React story app, SvelteKit graphics app, embed contract, monorepo layout |
| [docs/design-system.md](docs/design-system.md) | The diatour design system: color, type, space, motion, components |
| [docs/layout-system.md](docs/layout-system.md) | Fluid type math, the three-rail grid and its four breakpoint tiers, defensive layout, Figma handoff |
| [CLAUDE.md](CLAUDE.md) and [.claude/skills/](.claude/skills/README.md) | Guidance for Claude Code, plus vendored Svelte skills (MIT, svelte-skills-kit) |
| [docs/plan/](docs/plan/README.md) | **Phase 1:** 10 hand-built chunks in one `index.html` (+ an optional Svelte port). **Phase 2:** the Times-shaped stack in 13 chunks |

## Planned stack

| Layer | Tool | Role |
|-------|------|------|
| Visual-essay story project | [SvelteKit 2](https://svelte.dev/docs/kit) + Svelte 5 + adapter-static + lottie-web, in `projects/<slug>/` | Birdkit-style: prerendered page, hashed code and media folders. **Built** |
| Story page (product side) | [React 19](https://react.dev) + [React Router 7](https://reactrouter.com) framework mode, Node SSR, Vite 8, in `apps/story` | Article template, quiz, roundtable. **Scaffolded** (Phase 2 chunk 00) |
| Graphics desk | [SvelteKit 3](https://svelte.dev/docs/kit) + Svelte 5 + adapter-static + d3-scale (ai2html optional), in `apps/graphics` | Tally, stat chart, scrollytelling, built as embeds. **Scaffolded** (Phase 2 chunk 00) |
| Design system | `packages/design-system`: diatour tokens in rem, fluid `clamp()` type, `@layer` | One visual source for both apps |
| Content | [ArchieML](http://archieml.org/) → typed blocks (TypeScript + Zod) | Editors change stories without touching code |
| Quality | Vitest, Testing Library, Playwright, axe | Unit, visual regression, accessibility |
| Shipping | Git, GitHub, GitHub Actions | PRs, CI, previews |
