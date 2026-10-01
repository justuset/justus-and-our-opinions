# justus-and-our-opinions

A learning project: an **interactive Opinion-style article template** for telling stories on the web, built with
HTML, CSS and JavaScript, plus **Svelte** for bespoke graphics and **React** for recurring interactive formats.

The visual system follows the *diatour-nyt* artifacts (dark editorial paper, display serif, Roman-numeral
parts). The engineering approach follows their analysis of how New York Times Opinion pages are built: static,
accessible text first, with small interactive islands on top.

> This is an independent study project. It doesn't use Times branding, logos or proprietary typefaces,
> and the demo content is invented.

## Status

📐 **Planning.** The repo is set up and the plan is written. Code starts with [chunk 00](docs/plan/00-foundation.md).

## Start here

| Read | What's in it |
|------|--------------|
| [docs/learning-log/](docs/learning-log/) | A running journal. Starts with [01: repo setup, first commit and README](docs/learning-log/01-repo-setup.md) |
| [docs/reference/diatour-nyt-analysis.md](docs/reference/diatour-nyt-analysis.md) | What the diatour-nyt artifacts say about the Times stack and Opinion page anatomy |
| [docs/architecture.md](docs/architecture.md) | Why Astro + Svelte + React islands, and the folder structure |
| [docs/design-system.md](docs/design-system.md) | Tokens: color, type, space, motion, components |
| [docs/plan/](docs/plan/README.md) | The build plan in 12 chunks, with milestones |

## Planned stack

| Layer | Tool | Role |
|-------|------|------|
| Page shell and build | [Astro](https://astro.build) (on Vite) | Static HTML for text, hydrates islands |
| Styling | Modern CSS: `@layer`, custom properties, grid, container queries | Design tokens, themes, layout |
| Content | [ArchieML](http://archieml.org/) → typed blocks (TypeScript + Zod) | Editors change stories without touching code |
| Graphics islands | [Svelte 5](https://svelte.dev) + d3-scale | Tally, stat chart, scrollytelling |
| Product islands | [React 19](https://react.dev) | Quiz, roundtable |
| Quality | Vitest, Testing Library, Playwright, axe | Unit, visual regression, accessibility |
| Shipping | Git, GitHub, GitHub Actions | PRs, CI, previews |
