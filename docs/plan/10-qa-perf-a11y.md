# Chunk 10: QA, performance and accessibility in CI

**Goal:** Automate the boring checks so your eyes go to the judgment calls: a breakpoint screenshot matrix in two
browser engines, axe accessibility scans, unit tests and a JavaScript budget, all on every PR.

**Reference:** diatour-nyt §I.V (Playwright `toHaveScreenshot` at 320/375/768/1024/1440, iOS Safari first),
§VI.VII.7 (breakpoint matrix in CI, Chromium + WebKit, Docker, masking live elements), §VIII.IX (Vitest, Testing
Library, Playwright, axe), §VIII.X (Core Web Vitals: LCP 2.5s, INP 200ms, CLS 0.1).

## Learn first
- [Playwright: visual comparisons](https://playwright.dev/docs/test-snapshots), [projects](https://playwright.dev/docs/test-projects), [CI](https://playwright.dev/docs/ci-intro)
- [@axe-core/playwright](https://playwright.dev/docs/accessibility-testing)
- [web.dev: Core Web Vitals](https://web.dev/articles/vitals)

## Tasks
- [ ] `npm i -D @playwright/test @axe-core/playwright vitest @testing-library/react @testing-library/svelte @testing-library/user-event jsdom`.
- [ ] `playwright.config.ts`: `webServer` runs `npm run preview`, with projects for **chromium** and **webkit**.
- [ ] `tests/e2e/breakpoints.spec.ts`: loop over `[320, 375, 768, 1024, 1440]` → `toHaveScreenshot({ fullPage: true, animations: 'disabled', mask: [dates, counts] })`.
- [ ] `tests/e2e/a11y.spec.ts`: axe on every story page and on `/styleguide`, in both themes. Fail on any violation.
- [ ] `tests/e2e/no-js.spec.ts`: `javaScriptEnabled: false`. Headline, body and every figcaption are still present.
- [ ] `tests/e2e/reduced-motion.spec.ts`: `reducedMotion: 'reduce'`. The tally is full at first paint.
- [ ] JS budget: after `astro build`, a script sums the gzipped `dist/_astro/*.js` that a story page loads and fails above **120 KB**. Print a per-island table.
- [ ] Update `ci.yml`: lint → check → unit → build → preflight → e2e (in the Playwright Docker image, so fonts render the same everywhere) → upload the HTML report as an artifact.
- [ ] Commit baseline screenshots from CI's Linux run, not from your laptop (explain why in the log).

## Done when
- A one-pixel padding change in a component makes CI fail with a visual diff you can open.
- Removing an `alt` attribute makes CI fail on axe.
- The PR page shows all checks green, with a downloadable report.

## Concepts to write about
- Why screenshot baselines must come from the same OS and fonts as CI
- What automated a11y testing catches (~30–40%) and what still needs a human
- Field data vs lab data for Web Vitals
