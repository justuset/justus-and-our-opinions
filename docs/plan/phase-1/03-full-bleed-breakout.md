# Chunk 3: Full-bleed breakout

**One new idea:** a visual block can escape the text column **by itself**. No wrapper divs, no "outside the article"
markup.

**Reference:** breakdown §4.

## Build
- [x] The utility:
  ```css
  .bleed { position: relative; width: 100vw; left: 50%; transform: translateX(-50%); }
  body   { overflow-x: clip; }
  ```
- [x] A temporary test block between two paragraphs: `<section class="bleed test" aria-label="test">` with `height: 200px; background: var(--surface)`
      and a 1px `--line` border.
- [x] Put `.bleed` on the `two-up` placeholder section too (it stays full width from here on).

## Learn
- How it works: `left: 50%` puts the block's left edge at the parent's center, and `translateX(-50%)` pulls it back by half its
  own width (`50vw`), so it's centered on the **viewport**, whatever column it sits in.
- **The scrollbar bug:** `100vw` includes the vertical scrollbar on Windows and Linux (often 15–17px), so the block is
  wider than the visible page and causes a horizontal scrollbar. `overflow-x: clip` on `body` hides the overflow.
- `clip` vs `hidden`: `hidden` creates a scroll container, which **breaks `position: sticky`** for everything inside. That would
  break chunk 8. `clip` doesn't.

## Checkpoint
- [x] The test block spans the full window at 320, 800 and 1600px, while the paragraphs stay in the column.
- [x] **No horizontal scrollbar.** To see the bug on a Mac, turn on System Settings → Appearance → "Show scroll bars: Always",
      remove `overflow-x: clip`, check that a scrollbar appears, then put `clip` back.
- [x] Remove the test block when the checkpoint passes.

## Watch out
- **Found while building:** `body { overflow-x: clip }` alone still lets script scroll the page 8px sideways. We clip `html` too (see learning log 07).
- `transform` makes the element the containing block for any `position: fixed` children. Never put a fixed element inside `.bleed`.
- The transform-free alternative (used in Phase 2): `margin-inline: calc(50% - 50vw)`. Try it and note which you prefer.
