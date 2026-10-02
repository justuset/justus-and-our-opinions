# Learning log 04: The scrolly template breakdown and the two-phase plan

**Date:** 2026-10-01  **Chunk:** pre-Phase 1  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

1. Read and understand `scrolly-template.html`, a Birdkit-style recreation of an NYT interactive article, and document
   **exactly how it's built** for designers and front-end developers.
2. Restructure the plan into **10 hand-built chunks in one `index.html`**, each with a browser checkpoint.

## What I did

### 1. Read it, then measured it
- Saved the template unchanged as `docs/reference/scrolly-template.html`.
- Loaded it in headless Chromium (Playwright) at **320, 375, 800, 1024, 1280 and 1440px** and recorded the computed values:
  column width, header height, headline size, two-up direction, diagram width and runway heights. Then I scrolled runway A to fixed offsets
  to check the progress and step math (at 1280×900: a 7290px runway, a 6390px pinned span, **1065px per step**).
- Ran it with **JavaScript disabled**.

### 2. Bugs the measurements found (not visible from reading the code)
| Finding | How it was found |
|---------|------------------|
| The header's desktop **and** mobile art both display at every width (a cascade-order bug) | Computed `display` on both twins at 375 and 1280 |
| Scroll sections are **empty without JS**, because frames are built with `innerHTML` | No-JS page load |
| A JS *failure* (as opposed to JS off) leaves blank, many-screen-tall runways | Reasoning: `@media (scripting: none)` doesn't match when JS is on but broken |

### 3. The breakdown doc
`docs/reference/scrolly-template-breakdown.md`, 21 parts. Each part has a **designer** view (what you see, what to hand
off) and a **developer** view (the exact mechanism), plus a breakpoint matrix, a motion spec, a bug table (12 items), and
a mapping onto both phases of our build.

### 4. Changing the plan
The new plan has **two phases**:
- **Phase 1 (main path):** 10 chunks in `prototype/index.html`, plain HTML/CSS/JS, each adding one idea and ending with a
  DevTools checkpoint, plus an optional chunk 11 (port to Svelte, rendered from JSON).
- **Phase 2:** the existing Times-shaped stack plan (React SSR + SvelteKit + ArchieML), moved to `docs/plan/phase-2/`
  and renumbered (a new chunk 08, the visual-essay page). It starts after Phase 1.

Phase 1 follows the reference closely (measured px values) but builds in the fixes: frames written in HTML, twin utilities that
only hide, a `.js` class with a failsafe timeout for the intro, and a `.scrolly-ready` class set as the script's last line.

### Two catches while writing the plan
- My first twin utility used `display: revert !important` to *show* the desktop twin. That would have overridden the header
  art's `display: flex` and broken its centering. **Twin utilities should only hide.**
- My first "JS failed" fallback reused the `.js` class, but that's set in `<head>` *before* the main script can fail, so it
  proves nothing. The fix is a class added on the script's **last line**, which is reached only if setup succeeded.

## Concepts learned
- **Measure, don't assume.** Two of the three biggest problems were invisible in the source and obvious in the browser.
- **The runway formula:** progress = scrolled-into-runway ÷ (runway height − viewport height). Step = floor(progress × steps).
- **"No JS" and "broken JS" are different failures** and need different guards.

## Next
[Phase 1, chunk 1: Skeleton and content model](../plan/phase-1/01-skeleton-and-content-model.md).
