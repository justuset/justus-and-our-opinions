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

🛠 **Phase 1 in progress.** Phase 1 rebuilds the NYT-style scrolly article by hand in one `prototype/index.html`, in ten chunks with a browser checkpoint each. Chunks [1](docs/plan/phase-1/01-skeleton-and-content-model.md)–[3](docs/plan/phase-1/03-full-bleed-breakout.md) are built. Next: [chunk 4](docs/plan/phase-1/04-the-header.md). After Phase 1, [Phase 2](docs/plan/phase-2/README.md) ports it to the Times-shaped stack.

## Start here

| Read | What's in it |
|------|--------------|
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
| Story page (product side) | [React 19](https://react.dev) + [React Router 7](https://reactrouter.com) framework mode, Node SSR | Article template, quiz, roundtable |
| Graphics desk | [SvelteKit](https://svelte.dev/docs/kit) + Svelte 5 + d3-scale (ai2html optional) | Tally, stat chart, scrollytelling, built as embeds |
| Design system | `packages/design-system`: diatour tokens in rem, fluid `clamp()` type, `@layer` | One visual source for both apps |
| Content | [ArchieML](http://archieml.org/) → typed blocks (TypeScript + Zod) | Editors change stories without touching code |
| Quality | Vitest, Testing Library, Playwright, axe | Unit, visual regression, accessibility |
| Shipping | Git, GitHub, GitHub Actions | PRs, CI, previews |
