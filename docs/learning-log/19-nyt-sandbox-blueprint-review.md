# Learning log 19: Checking the build against the NYT sandbox blueprint

**Date:** 2026-10-02  **Step:** review and plan (no code)  **Branch:** `claude/wonderful-knuth-w43l2c`

> **Later changes (as of 2026-10-02):** the owner checked the shipped page directly. It confirms GSAP 3.12.5 + ScrollTrigger from cdnjs, with no other scrolly library. Each section is a custom Svelte component with CSS-sticky panels, and ScrollTrigger only reads progress. It's one studio-built piece, so this isn't proof of the whole desk's tooling. Recorded under D3 and S4 in the [plan](../plan/nyt-sandbox-alignment.md).

## What happened

The project owner supplied an architecture blueprint for NYT Opinion's scroll-driven essays, built around "In Defense of
the Detour" (saved as [`../reference/nyt-sandbox-blueprint.md`](../reference/nyt-sandbox-blueprint.md)). I checked the
current build against every section of it and wrote [`../plan/nyt-sandbox-alignment.md`](../plan/nyt-sandbox-alignment.md).

## What I learned

- **Know where a source's facts come from.** Phase 1's reference, `scrolly-template.html`, is a *recreation* whose values were never re-checked. The blueprint separates "verified from the shipped page source" from "inferred," which makes it the better authority on architecture: the `body` block array, the eight component names, GSAP ScrollTrigger 3.12.5, Lottie 5.12.2, the track heights. The plan follows it where the two disagree.
- **The recreation was faithful in shape.** Our sections map one-to-one onto the real components: `TwoUp` → `ImageTwoUpWide`, `Diagram` → `Shortcut`, the three scroll scenes → `AiStudy` / `OrganicChart` / `PaintingScroll`, `ScrubLottie` → `LottieScrub`. Even the slides scene's 6 frames match AiStudy's. The gaps are in the plumbing, not the page.
- **The biggest gaps:**
  - the content document's shape (one `body` array with flat props, vs. our typed blocks);
  - no mock platform shell (so sticky panels were never tested under a masthead);
  - our own scroll engine instead of ScrollTrigger;
  - breakpoints from the recreation (1024) instead of NYT's tiers (740 / 1150);
  - no tablet Lottie tier;
  - a progress bar that animates `width` instead of a `scaleX` transform.
- **Some of our choices are stronger than the blueprint's sample code**, and the plan keeps them:
  - server-rendered, no-JS-readable frames;
  - `data-enhanced` gating;
  - `{@attach}` instead of `onMount`;
  - twins loaded only when visible;
  - verified, content-hashed media;
  - the parity script.

  Adopt the architecture, not the snippets.

## Decisions waiting on the owner

The plan's §2 lists five:
- the visual theme (diatour vs. NYT white, with "both, via a `theme` key" recommended);
- where the work happens;
- adopting GSAP (free, but not MIT-licensed);
- the missing original `data.json` demo;
- the masthead and byline text. CLAUDE.md requires "Our Opinions" and invented demo content.

## Next

Once those are settled, chunk S1: [the `body` document](../plan/nyt-sandbox-alignment.md#s1-the-body-document).
