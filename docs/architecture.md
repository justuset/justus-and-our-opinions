# Architecture decision: Astro, with Svelte and React islands

**Status:** Proposed (to confirm when chunk 00 starts)
**Date:** 2026-10-01

## Context

We want one interactive Opinion-style article template that:

1. Renders headline, dek, byline, body and images as **plain HTML and CSS** (fast, accessible, readable with no JavaScript).
2. Uses **Svelte** where the Times uses it: bespoke graphics such as the tally, charts and scrollytelling.
3. Uses **React** where the Times uses it: recurring product-style formats such as the quiz, poll and roundtable.
4. Lets an editor change a story by editing a **text file (ArchieML)**, not code.

## Options considered

| Option | Svelte and React on one page? | Text ships with zero JS? | Learning cost | Verdict |
|--------|------------------------------|--------------------------|---------------|---------|
| **Astro + `@astrojs/svelte` + `@astrojs/react`** | Yes, first-class | Yes, by default | Low. Astro files are close to HTML | **Chosen** |
| Plain Vite + manual `mount()` / `createRoot()` | Yes, by hand | Yes | Medium. You write your own island loader | Done once as a learning exercise (chunk 05) |
| SvelteKit | React only through workarounds | Mostly | Medium | Rejected: no React |
| Next.js | Svelte only through workarounds | No. Ships the React runtime | Medium–high | Rejected: no Svelte, heavier |

## Decision

Use **Astro** as the page shell and build tool (it runs on Vite underneath).

```
           ArchieML (.aml)  ──parse──►  story JSON (typed blocks)
                                              │
                                     BlockRenderer.astro
              ┌───────────────┬───────────────┼────────────────┬───────────────┐
         text / quote      figure          tally / chart      quiz / roundtable
          (.astro)        (.astro)       (.svelte island)     (.tsx island)
        static HTML     static HTML    client:visible        client:visible
```

**Rule of thumb for picking a layer:**

| If the block… | Build it in | Hydration |
|---------------|-------------|-----------|
| only shows content | `.astro` (HTML/CSS) | none |
| needs a small enhancement (progress bar, share, TOC) | vanilla JS `<script>` in an `.astro` component | runs once |
| is a bespoke visual or animation | **Svelte 5** (`.svelte`) | `client:visible` |
| is a stateful, recurring "product" widget | **React 19** (`.tsx`) | `client:visible` or `client:idle` |

## Proposed folder structure

```
justus-and-our-opinions/
├─ README.md
├─ docs/                        ← learning log, reference, plan (this folder)
├─ content/
│  └─ stories/
│     └─ three-writers.aml      ← ArchieML story copy
├─ public/
│  └─ media/                    ← images, posters, captions (.vtt)
├─ scripts/
│  └─ preflight.mjs             ← media budget checker (chunk 09)
├─ src/
│  ├─ styles/
│  │  ├─ tokens.css             ← design tokens (chunk 01)
│  │  ├─ base.css
│  │  └─ components.css
│  ├─ lib/
│  │  ├─ archie.ts              ← ArchieML → typed blocks (chunk 03)
│  │  └─ types.ts
│  ├─ components/
│  │  ├─ astro/                 ← SiteHeader, StoryHeader, Figure, PullQuote, EndMatter, BlockRenderer
│  │  ├─ svelte/                ← Tally, StatChart, Scrolly
│  │  └─ react/                 ← Quiz, Roundtable
│  ├─ layouts/
│  │  └─ Essay.astro
│  └─ pages/
│     ├─ index.astro            ← list of stories
│     ├─ styleguide.astro       ← tokens and components on one page
│     └─ opinion/[slug].astro   ← the template
├─ tests/
│  ├─ unit/                     ← Vitest + Testing Library
│  └─ e2e/                      ← Playwright breakpoint matrix + axe
└─ .github/workflows/ci.yml
```

## Consequences

- Positive: Text is static and fast. Each island ships only its own framework runtime, and only when the island scrolls into view.
- Positive: We learn both frameworks in the role each one actually plays at the Times.
- Trade-off: Two framework runtimes can load on one page. Chunk 10 sets a budget (JavaScript under 120 KB gzipped per story).
- Trade-off: Islands can't share React or Svelte state directly. When they have to talk, they use DOM events or a tiny shared store (nanostores).
