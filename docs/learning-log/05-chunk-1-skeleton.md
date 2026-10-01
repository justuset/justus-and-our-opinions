# Learning log 05: Phase 1, chunk 1: Skeleton and content model

**Date:** 2026-10-01  **Chunk:** Phase 1 · 1  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

Semantic markup only, with no CSS and no JavaScript. Prove the page is a **flat list of sibling blocks** that reads
correctly as a plain document.

## What I did

- Created `prototype/index.html`:
  - `<article class="story">` → `<header>` (kicker, `h1.headline`, `p.subtitle`, empty `.header-art`) → `p.byline` with a `<time>`
    → **10 `p.g-text`** → 6 empty `<section>`s → `<footer class="credits">`.
  - Each placeholder section has a `data-block` (`two-up`, `diagram`, `scrolly-a` … `scrolly-d`) and an `aria-label` that describes what it will show.
- Wrote an invented demo essay, "The Second Draft Is Where the Argument Lives," whose blocks line up with the reference's visual
  sections: a two-up of two drafts, a four-stage diagram (Idea → Draft → Revise → Ship), and four scroll scenes (six versions of a paragraph,
  five marked-up pages, three arguments competing for the lead, and a draft condensing). The credits label it a demo.
- Wrote the page **as data** in an HTML comment above the article: the content model chunk 11 will render from.
- Added one thing the plan didn't list: a kicker (`Our Opinions | Guest Essay · Demo`) above the headline, because Opinion pages
  label the piece's type there.

## Checkpoint results

| Check | Result | How |
|-------|--------|-----|
| Reads as a well-formed unstyled document | ✅ | Headless Chromium screenshot at 800px |
| Accessibility-tree order: headline → dek → byline → text → named sections → credits | ✅ | Playwright `ariaSnapshot()` (the kicker reads first, before the headline, which is intended) |
| Nu HTML Checker: no errors | ✅ No errors, no warnings | `vnu.jar`, the same engine as validator.w3.org, run locally because the session's network blocks the website |
| Screen reader read-through | ⏳ For you | VoiceOver (⌘F5) or NVDA, top to bottom |

## What broke, and the fix

- **The byline ran together**, "By A. Writer Oct. 1, 2026", because unstyled inline text has no visual separator.
  Added a `·` between the name and the `<time>`. Small, but it's the kind of thing CSS would have hidden until a screen reader or reader mode exposed it.
- **html-validate** flagged `<!doctype html>` as "should be uppercase." That's a style rule in its default preset. Lowercase is valid HTML,
  and the Nu checker (the authority the checkpoint names) passes it. Kept lowercase.

## Concepts learned

- **`header` and `footer` inside an `article` are not page landmarks.** They're the article's own header and footer, so the accessibility tree
  shows no "banner" or "contentinfo." That's correct here. A site-wide masthead would be a separate `header` outside the article.
- **A `section` with an accessible name becomes a "region" landmark.** Without `aria-label` (or a heading) it's just a generic container.
  That's why every placeholder got a descriptive label: a screen-reader user can jump between regions and hear what each visual is about.
- **Flat siblings:** no wrapper divs, so each block can choose its own width later (chunk 2: column, chunk 3: bleed).

## Next

[Chunk 2: Tokens and the text column](../plan/phase-1/02-tokens-and-text-column.md), once you've done the screen-reader pass.
