# Build plan: the interactive Opinion article template

Twelve chunks, each sized for **one or two focused sessions**. Every chunk ends with something that works and
can be committed, plus a learning-log entry. Do them in order: each one builds on the last.

| # | Chunk | Main skill | Framework | Ships |
|---|-------|-----------|-----------|-------|
| 00 | [Project foundation](00-foundation.md) | Tooling, Git workflow | Astro + Vite | A running dev server, lint, format, CI skeleton |
| 01 | [Design tokens and base CSS](01-tokens-and-base-css.md) | CSS architecture | CSS | `tokens.css`, light/dark themes, `/styleguide` |
| 02 | [Static essay skeleton](02-static-essay.md) | Semantic HTML, CSS grid | HTML/CSS | The full article page with **zero JavaScript** |
| 03 | [Content model with ArchieML](03-content-model.md) | Data modeling | TypeScript | `.aml` → typed blocks → `BlockRenderer` |
| 04 | [Vanilla JS enhancements](04-vanilla-enhancements.md) | Web APIs, events | JavaScript | Progress bar, TOC drawer, share, reduced motion |
| 05 | [Svelte island: Tally](05-svelte-tally.md) | Svelte 5 runes, islands | **Svelte** | Count-up tally block (+ hand-rolled island loader) |
| 06 | [Svelte island: Stat chart](06-svelte-stat-chart.md) | SVG, D3 scales, a11y charts | **Svelte** | Bar/slope chart with a table fallback |
| 07 | [Svelte island: Scrollytelling](07-svelte-scrolly.md) | IntersectionObserver, sticky | **Svelte** | Sticky graphic + step engine |
| 08 | [React islands: Quiz and Roundtable](08-react-quiz-roundtable.md) | React 19 state, forms | **React** | Accessible quiz, roundtable with error boundaries |
| 09 | [Media: art, video, audio](09-media.md) | Responsive media, budgets | HTML + Node | `<picture>`, safe video, Listen player, preflight script |
| 10 | [QA, performance, accessibility](10-qa-perf-a11y.md) | Testing, CI | Vitest, Playwright, axe | Breakpoint matrix and budgets in GitHub Actions |
| 11 | [Package the template](11-package-template.md) | Docs, systems thinking | — | "New story in 10 minutes" guide, deploy, retro |

## Milestones

| Milestone | After chunk | You can show… |
|-----------|-------------|---------------|
| **M1: It looks right** | 02 | A static essay that matches the diatour look at 320–1440px |
| **M2: It's a template** | 03 | Two different stories rendered from two `.aml` files |
| **M3: It's interactive** | 08 | Svelte and React islands working on the same page |
| **M4: It's shippable** | 11 | Green CI, a public preview URL, docs a designer can follow |

## How to work each chunk

1. **Branch.** In a normal setup that means `git switch -c chunk-NN-short-name` from `main`. In this cloud session, everything lands on `claude/wonderful-knuth-w43l2c`.
2. **Read** the chunk's "Learn first" links (30–60 min).
3. **Build** through the task checklist. Commit after each checked box, with a clear message (`feat(tokens): add color tokens`).
4. **Verify** against "Done when."
5. **Log** a `docs/learning-log/NN-*.md` entry: what you built, what broke, what you'd do differently.
6. **PR.** Open a pull request with a clear title. The diatour notes point out that the Times builds release notes from PR titles.

## Commit message convention

[Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`. The types are
`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore` and `ci`.

## Demo content

All chunks use one demo story, **"Three Writers, One Question: Should cities ban cars downtown?"** (from the
diatour ArchieML example). It's invented, contains no real people or reporting, and is labeled as a demo.
