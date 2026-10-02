# Learning log 07: Phase 1, chunk 3: Full-bleed breakout

**Date:** 2026-10-01  **Chunk:** Phase 1 · 3  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

One new idea: **a visual block can escape the text column by itself.** No wrapper divs, and no "outside the article" markup.

## What I did

- Added the utility, as in the reference:
  ```css
  .bleed { position: relative; width: 100vw; left: 50%; transform: translateX(-50%); }
  ```
- Added `overflow-x: clip` on **both `html` and `body`**. The reference clips only `body`. The measurements below explain the difference.
- Put `.bleed` on the `two-up` placeholder section. It stays full width from now on.
- For the checkpoint, the test block (200px, `--surface` fill) was **inserted by the test script**, so there's nothing temporary to remove from `index.html`.

## Testing with a real scrollbar

Headless Chrome hides scrollbars by default, which would hide the exact bug this chunk is about. I launched it with
scrollbars on (a 15px classic scrollbar, like Windows and Linux).

| Setup | Horizontal scrollbar | User can scroll sideways (wheel/trackpad) | Script can scroll sideways | Sticky still works |
|-------|:-------------------:|:-----------------------------------------:|:--------------------------:|:------------------:|
| No clip | **15px bar appears** ❌ | yes | yes (8px) | yes |
| `body { overflow-x: clip }` (the reference) | none ✅ | no ✅ | **yes, 8px** ⚠️ | yes ✅ |
| `html, body { overflow-x: hidden }` | none | no | no | **no** ❌ (the element scrolled away by −1000px) |
| `html, body { overflow-x: clip }` (**ours**) | none ✅ | no ✅ | **no** ✅ | **yes** ✅ |

The reference's bleed technique and our transform-free alternative (`margin-inline: calc(50% − 50vw)`) behaved the same, which confirms the
overflow comes from `100vw`, not from the transform.

## Checkpoint results (scrollbar on)

| Screen | Visible width | Test block spans | Text column | Horizontal scrollbar |
|-------:|--------------:|-----------------:|------------:|:--------------------:|
| 320 | 305 | −7 → 313 | 225 | none |
| 375 | 360 | −7 → 368 | 266 | none |
| 800 | 785 | −7 → 793 | 600 | none |
| 1024 | 1009 | −7 → 1017 | 600 | none |
| 1600 | 1585 | −7 → 1593 | 600 | none |

- The block always covers the whole visible window. The extra 7.5px on each side is the scrollbar width split in two, clipped away.
- With a scrollbar showing, the phone column is narrower (225px at 320 instead of 240px), because `100%` excludes the scrollbar while
  `vw` includes it. With macOS overlay scrollbars it's 240px, matching chunk 2.
- Nu HTML Checker: no errors.

## Concepts learned

- **Centering on the viewport from inside a column:** `left: 50%` moves the left edge to the parent's center, and `translateX(-50%)` moves
  it back by half its own width. That's centered on the viewport whatever the parent's width.
- **`100vw` ≠ the visible width** when a classic scrollbar is showing. It's 15px wider on Windows and Linux. macOS hides this with overlay scrollbars,
  which is why the bug often ships unnoticed. To see it on a Mac: System Settings → Appearance → Show scroll bars: Always.
- **`clip` vs `hidden`:** `hidden` makes an element a scroll container, so `position: sticky` sticks to *it* instead of the page. Proven
  above: the sticky test element moved −1000px with `hidden` and stayed at 0 with `clip`. Chunk 8 depends on this.
- **A clip on `body` alone still leaves programmatic overflow**, which `scrollTo`, `scrollIntoView` or find-in-page can trigger. Clipping `html` too closes it.
- **Transforms create a containing block for `position: fixed` children.** Noted in the CSS, so nobody puts a fixed element inside `.bleed`.

## Next

[Chunk 4: The header](../plan/phase-1/04-the-header.md).
