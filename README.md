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

📐 **Planning.** The repo is set up and the plan is written. Code starts with [chunk 00](docs/plan/00-foundation.md).

## Start here

| Read | What's in it |
|------|--------------|
| [docs/learning-log/](docs/learning-log/) | A running journal. Starts with [01: repo setup, first commit and README](docs/learning-log/01-repo-setup.md) |
| [docs/reference/diatour-nyt-analysis.md](docs/reference/diatour-nyt-analysis.md) | What the diatour-nyt artifacts say about the Times stack and Opinion page anatomy |
| [docs/architecture.md](docs/architecture.md) | The Times-shaped stack: React story app, SvelteKit graphics app, embed contract, monorepo layout |
| [docs/design-system.md](docs/design-system.md) | The diatour design system: color, type, space, motion, components |
| [docs/layout-system.md](docs/layout-system.md) | Fluid type math, the three-rail grid and its four breakpoint tiers, defensive layout, Figma handoff |
| [CLAUDE.md](CLAUDE.md) and [.claude/skills/](.claude/skills/README.md) | Guidance for Claude Code, plus vendored Svelte skills (MIT, svelte-skills-kit) |
| [docs/plan/](docs/plan/README.md) | The build plan in 12 chunks (+1 optional), with milestones |

## Planned stack

| Layer | Tool | Role |
|-------|------|------|
| Story page (product side) | [React 19](https://react.dev) + [React Router 7](https://reactrouter.com) framework mode, Node SSR | Article template, quiz, roundtable |
| Graphics desk | [SvelteKit](https://svelte.dev/docs/kit) + Svelte 5 + d3-scale (ai2html optional) | Tally, stat chart, scrollytelling, built as embeds |
| Design system | `packages/design-system`: diatour tokens in rem, fluid `clamp()` type, `@layer` | One visual source for both apps |
| Content | [ArchieML](http://archieml.org/) → typed blocks (TypeScript + Zod) | Editors change stories without touching code |
| Quality | Vitest, Testing Library, Playwright, axe | Unit, visual regression, accessibility |
| Shipping | Git, GitHub, GitHub Actions | PRs, CI, previews |
