# Build plan

Two phases. **Phase 1 is the main path.**

> **Status (2026-10-01): Phase 1 is complete.** Chunks 1–10 are built in the prototype and ported, and chunk 11's parity check
> passes. See the [Phase 1 retro](../learning-log/17-phase-1-retro.md). **Phase 2 has started:** [chunk 00](phase-2/00-foundation.md) is done.
> **In progress (2026-10-02): [NYT sandbox alignment](nyt-sandbox-alignment.md)**, eight chunks (S1–S8) that reshape the
> story project to match the shipped page's architecture. S1–S4 and S4b (the measured page shell) are done, and S5 is next. After S8, Phase 2 resumes at [chunk 01](phase-2/01-tokens-and-base-css.md).

| Phase | What | Where | Rules |
|-------|------|-------|-------|
| **1: Build it by hand** | Rebuild the NYT-style scrolly article in **one `index.html`** with plain HTML, CSS and JS, one idea per chunk | `prototype/index.html` | This file |
| 1, alongside | **Port each chunk that passes** into the Birdkit-style story project: components rendered from `story.json`, built to a hashed output tree | `projects/the-second-draft/` | [Project guide](../project-structure.md) §11 |
| 1, final | Finish the port and verify the project matches the prototype | `projects/the-second-draft/` | [Chunk 11](phase-1/11-optional-svelte-port.md) |
| **2: Times-shaped stack** | React SSR story app + SvelteKit graphics desk + ArchieML + the diatour design-system package | `apps/`, `packages/` | [Phase 2 plan](phase-2/README.md) |

The reference for everything in Phase 1 is [`../reference/scrolly-template.html`](../reference/scrolly-template.html),
explained part by part in [`../reference/scrolly-template-breakdown.md`](../reference/scrolly-template-breakdown.md).
The look comes from the diatour design system ([`../design-system.md`](../design-system.md)).

---

## Phase 1: ten chunks in one `index.html`

Each chunk adds **one new idea** and ends with a **checkpoint you can check in the browser**.
**Don't start the next chunk until the current checkpoint passes.**

| # | Chunk | The one new idea | Checkpoint (short version) |
|---|-------|------------------|----------------------------|
| 1 | [Skeleton and content model](phase-1/01-skeleton-and-content-model.md) | The page is a flat list of sibling blocks | Reads correctly unstyled. The screen reader order makes sense |
| 2 | [Tokens and the text column](phase-1/02-tokens-and-text-column.md) | `clamp()` + `min()` replace media queries | 320→1600px: fluid on phones, locks at 600px and centers |
| 3 | [Full-bleed breakout](phase-1/03-full-bleed-breakout.md) | Blocks escape the column on their own | Test block spans the window. No horizontal scrollbar |
| 4 | [The header](phase-1/04-the-header.md) | Size by characters, scale art by height | 340 / 800 / 1440: stack → widen → scale. Art crops, never squashes |
| 5 | [Intro motion](phase-1/05-intro-motion.md) | Wait for fonts, then animate | Clean staggered fade-up, no font-swap jump |
| 6 | [Two-up images and twins](phase-1/06-two-up-and-twins.md) | Mobile-first `min-width`, and swapping whole components | Stacks below 640px, side by side above. Capped on wide screens |
| 7 | [The connector diagram](phase-1/07-connector-diagram.md) | SVG drawn from live CSS layout | Resize the window and the arrows stay attached |
| 8 | [The scroll engine, built once](phase-1/08-scroll-engine.md) | Runway + sticky + `progressOf()` | Console logs progress 0→1 and the step number. Progress bar and markers |
| 9 | [The three scroll sections](phase-1/09-three-scroll-sections.md) | Engine vs what each step renders | A, B, C work in portrait and landscape and at 768/1024. Each step fires once, no flicker |
| 10 | [Scrubbed Lottie, then hardening](phase-1/10-scrubbed-lottie-and-hardening.md) | Scrub vs autoplay, plus the production layer | Lighthouse, reduced motion, readable with JS off |
| 11 | [Finish the port and verify parity](phase-1/11-optional-svelte-port.md) | Components from `story.json`, built to a hashed output tree | `projects/the-second-draft/` matches the prototype and is ready to ship |

### How to work

1. **One file.** `prototype/index.html` holds an inline `<style>` and `<script>`. Assets go in `prototype/assets/`.
   Serve it locally so `fetch`, fonts and Lottie work: `npx serve prototype` (or `python3 -m http.server -d prototype`).
2. **Chrome DevTools open, responsive mode on** (⌘⇧M / Ctrl+Shift+M). The DevTools tools each chunk uses:

   | Tool | Where | Used in |
   |------|-------|---------|
   | Responsive mode, width presets 320 / 340 / 375 / 768 / 800 / 1024 / 1440 / 1600, and rotate (portrait ⇄ landscape) | Device toolbar | Every chunk |
   | Accessibility tree, and "full-page accessibility tree" | Elements → Accessibility | 1, 10 |
   | Grid and flex overlays | Elements → Layout | 2, 6, 7 |
   | Computed tab (watch `clamp()` resolve live) | Elements → Computed | 2, 4 |
   | Emulate `prefers-reduced-motion`, emulate a vision deficiency | ⌘⇧P → "Rendering" | 5, 9, 10 |
   | Disable JavaScript | ⌘⇧P → "Disable JavaScript" | 1, 10 |
   | Performance panel (layout shifts, long tasks) and Performance monitor (layouts/sec) | Performance | 8, 9 |
   | Network throttling ("Slow 4G"), and "Disable cache" | Network | 5, 10 |
   | Lighthouse | Lighthouse panel | 10 |
   | Animations panel (slow to 10%) | ⌘⇧P → "Animations" | 5, 9 |

3. **Port.** Once the checkpoint passes, carry the chunk into `projects/the-second-draft/`: tokens to `src/app.css`, rules and markup to the
   component named in the chunk's "Port" section, and behavior to an `{@attach}`. Run `npm run build`, then check the page with JS on and off.
   Mark the component ✅ in its top comment and in [`../project-structure.md`](../project-structure.md) §4.
4. **Checkpoint gate.** Tick every box under "Checkpoint" in the chunk file. If one fails, fix it before moving on.
5. **Commit per chunk**: `feat(prototype): chunk 4, header`. Add a short entry to `docs/learning-log/`, covering what clicked, what broke and a screenshot.
6. **Look, then compare.** After your own attempt, compare it with the matching part of `scrolly-template.html` and the
   breakdown. The breakdown also lists the reference's **known bugs** (§19). Each chunk's "Watch out" box says which ones to avoid.

### Ground rules for Phase 1

- **Fidelity first:** use the reference's measured values (600px column, 675px header, 135svh steps, the three eases).
  Phase 2 converts them to rem and tokens.
- **Diatour look:** colors and fonts come from the diatour tokens (chunk 2), not the reference's white page.
- **No Times branding, assets or fonts.** Placeholder art and invented copy, labeled as a demo.
- **Text must always be readable.** Whatever JS adds, the page reads top to bottom without it (fully checked in chunk 10).
