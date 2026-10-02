# Learning log 17: Phase 1 retro

**Date:** 2026-10-01  **Covers:** Phase 1, chunks 1–11 (logs 05–16)  **Branch:** `claude/wonderful-knuth-w43l2c`

> **Later changes (as of 2026-10-02):** `story.json` is now `content/doc.json` (S1, [log 20](20-s1-body-document.md)). The order after Phase 1 changed too: Phase 2 chunk 00 came first ([log 18](18-phase-2-chunk-00-foundation.md)), then the [NYT sandbox alignment](../plan/nyt-sandbox-alignment.md) (S1–S8, [log 19](19-nyt-sandbox-blueprint-review.md)) before the rest of Phase 2.

## What Phase 1 produced

- **`prototype/index.html`:** the NYT-style scrolly article rebuilt by hand in one file, with no framework or build step.
  - Tokens and a 600px column.
  - A full-bleed breakout.
  - A fixed-height header with height-scaled twin art and a fonts-ready intro.
  - A two-up figure and a connector diagram.
  - One scroll engine driving four scenes: cut, fade, settle and scrub.
  - A hardened base that reads top to bottom with JS off, broken or blocked.
- **`projects/the-second-draft/`:** the same page as a Birdkit-style SvelteKit project.
  - `story.json` → one component per block type → a prerendered `index.html` with hashed `_app.<build>/` and `_big_assets.<hash>/` folders.
  - A deploy plan with the right cache headers.
- **Proof they match:** `npm run parity` agrees within 1px at 375, 1024 and 1440 on 9 measures, including every runway height and runway A's step offsets. The accessibility trees are identical.
- **Quality bar met on the built page:** Lighthouse mobile 95 / 100 / 96, CLS 0.

## What worked

1. **One idea per chunk, with a checkpoint gate.** Each chunk had a single thing to understand and a measurable test. When something broke, the cause was almost always the one new idea.
2. **Measuring instead of looking.** Every checkpoint became numbers:
   - widths at set breakpoints;
   - arrow endpoints within 0px;
   - step boundaries every 1065px;
   - mismatches between frame and computed step (0 at four screen shapes);
   - Lighthouse scores and pixel diffs.

   Several real bugs were invisible to the eye and obvious in the numbers (the 270px parity gap, the image overflowing scene B's band).
3. **Port as you go.** Porting each chunk as it passed kept the Svelte project honest and taught the framework in small steps:
   - `{@attach}` for DOM work;
   - snippets to pass `step` and `progress` down;
   - `$derived` over stored state;
   - `$props.id()` for SSR-safe ids.

   Chunk 11 was left with one feature and a verification, not a rewrite.
4. **Fixing the reference's known bugs on purpose:**
   - frames written in HTML, not `innerHTML`;
   - twins that only hide, declared last;
   - the two-step JS gate (`.js` for the intro, `.scrolly-ready` / `data-enhanced` for scrolling);
   - progress divided by the panel's height, not `innerHeight`;
   - a screen-reader list for every scroll section;
   - a `<figure>` and an `<ol>` where the reference used `div`s.

## What went wrong, and the lesson in each

| Chunk | What happened | Lesson |
|---|---|---|
| 2 | I ticked "60–75 characters per line" before measuring. It was about 57 | Tick a box only after the measurement exists |
| 4 | The plan's 340px checkpoint contradicted its own 360px breakpoint | Plans can be wrong. Check the plan against the rules it cites |
| 6 | The plan's markup wrapped `<figcaption>` in a `<div>`, which is invalid | Run the validator on plan snippets too |
| 8 | Svelte silently removed my `[data-enhanced]` CSS: the attribute only existed at runtime | Scoped CSS is compiled against the template. Put state-driven attributes *in* the template |
| 9 | `height: 100%` inside a grid item resolved to nothing | Percent heights need a definite height to resolve against: absolute positioning or a flex parent |
| 9 | A reduced-motion override lost on specificity | An override must match the specificity of the rule it overrides, not just come later |
| 10 | Lottie's JSON failed to load from `file://` | Serve even a one-file prototype over http once anything is fetched |
| 10 | The plan's `defer` script would run *after* the inline page script | Know the script execution order: inline at parse time, `defer` after parsing |
| 11 | Parity found 270px: enhanced runways kept the stack's margins | A port can be "visually right" and still wrong. Automate the comparison |
| 11 | A chained shell command ran a step in the wrong directory after another step failed | Wrap risky multi-step commands in `set -e`; check `git diff` after any surprise |

## Decisions worth remembering

- **Diatour wins visual conflicts.** The page uses the dark diatour palette and a mixed-case Newsreader headline, not the reference's white page and uppercase condensed serif. Measured px values were kept for layout fidelity; rem conversion is Phase 2's job.
- **Base CSS = the no-JS layout.** Every scroll rule is behind a class that's only added once setup succeeds. That removed the need for `@media (scripting: none)` entirely.
- **Placeholder motion is self-authored** (`make-hero-lottie.js`, `make-scrub-lottie.js`), so there's no third-party license to track. Writing Lottie JSON by hand also explained the format.
- **The poster is the last frame.** The header animation ends exactly on its static SVG, so no-JS, reduced-motion and finished states are the same picture.
- **The essay content stayed put.** The fifth-section test ran in a scratch copy rather than adding copy to the argument.

## What I'd do differently

- **Write the parity script earlier**, around chunk 6, and run it after every port. The margin bug would have been caught the day it was made.
- **Start chunk 8 with the `.scrolly-ready` gate** instead of retrofitting it in chunk 10. Restructuring every scene's CSS into base + enhanced was the largest single edit of the phase.
- **Generate the `srcset` variants in the build** (`hash-assets.js` could do it) instead of committing them by hand.
- **Test against real fonts.** This sandbox blocked Google Fonts, so every measurement used the fallback serif. The layout values don't depend on the font, but line counts and some heights do. Re-run parity with Newsreader loaded on an open network.

## Carried into Phase 2

- `scroll.js`'s engine → `scroll-engine.ts`, with an IntersectionObserver deciding which runways are live (breakdown §20).
- The scene components → `SceneSlides`, `SceneBand`, `SceneArrange`, `SceneScrub`, fed by ArchieML instead of JSON.
- **px → rem with `clamp()`**, logical properties throughout, and twin rules in `@layer utilities`.
- Scene C's `top`/`left`/`width` transitions → FLIP transforms once there are more than about five items.
- `npm run parity` becomes a CI check, and the Lighthouse targets become budgets.

## Next

[Phase 2, chunk 00: the monorepo foundation](../plan/phase-2/00-foundation.md).
