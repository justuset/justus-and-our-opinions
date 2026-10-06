# Learning log 40: Aligning the React photo essay with the reference article's structure

**Date:** 2026-10-05  **Step:** structure review, live page vs `apps/story`  **Branch:** `feat/story-align-reference`

## Goal

Walk the live reference article's DOM (masthead to footer) and bring `/photo-essay` as close to it as the repo's
rules allow.

## What the reference does (measured at 1595 × 1056, `tpl-always-light`)

- **Masthead:** `position: fixed`, top 0, 43px, opaque. The article header starts 100px down. (The Birdkit page's
  masthead floats and scrolls away; this is the article-page version.)
- **Article:** `article#story` > top ad (empty) > `header` > `section[name=articleBody]` > the article's own bottom
  (today's date, share tools with the comment button, recirculation, bottom ad). Then `nav#site-index` and `footer`
  outside `<main>`.
- **Header order:** brand bar (section link), kicker, `h1[data-testid=headline]`, `time`, lead photo, share tools
  with a listen button, byline ("By" + name, then a one-line enhanced byline).
- **Body:** a run of paragraphs is one `div.StoryBodyCompanionColumn[data-testid=companionColumn-N]`; every other block
  is wrapped as `<__typename>-<position>` (`DiptychBlock-3`, `UnstructuredBlock-4`, `Dropzone-7`…). Dropzones at
  positions 1, 7, 13, 18; related links just before the closing bio.
- **Diptych:** two whole image figures, each with its own caption.
- **Scroller credit:** inside the sticky stage, absolute, 20px from the bottom, 11px serif, near-white.
- **Bio:** sans 16/22, weight 500, not italic, in the last companion column.

## What I changed

- Fixed 43px masthead for article pages (`Masthead fixed`); header padding 100px; anchors scroll below the masthead.
- Header: not changed. The patch moved it to the reference order, but the Figma header (entry 37) is kept (see below).
- `Body`: companion columns and `<__typename>-<position>` wrappers, `section[name=articleBody]`.
- `Diptych` = two `MediaFigure`s; the doc's one credit goes under the right photo.
- Scroller credit moved into the stage.
- Bio is a `variant: 'bio'` paragraph (sans 16/22), no longer italic.
- Dropzone rule: after the first paragraph run, then every 5 rendered units.
- `ArticleBottom` (date, share tools, recirculation, bottom ad) now closes `article#story`; `SiteIndex` added.
- Tests: 14 × 3 tiers, including the structure order, the fixed masthead, the bio and the credit position.

## Kept different on purpose

- No `role="group" aria-label="media"` on figures and no hidden "Image" label: native `<figure>` semantics.
- No empty `<aside aria-label="companion column">`: an empty landmark is noise for screen readers.
- No Times colors or fonts (the section link uses diatour's link color), no listen button, no empty top or sponsor
  ad slots.

## What broke and how I fixed it

- The Diptych test still selected `[data-testid=diptych]` after the rename: Prettier had wrapped the old line, so my
  scripted replace missed it. Fixed by hand.

## Applying it to main
This was written against an older base and applied to `main` by hand (3-way merge). Choices made then:
- **Header:** the Figma header (entry 37) stays: section and kicker, headline, date, lead photo, then the tools row,
  byline with bio and promo. The reference's order (brand bar, share row, "By" + one-line byline) is listed above for
  the record but isn't drawn. The structure test checks the Figma order, and `ShareTools` lost its unused `header`
  variant.
- The patch's `--link` and `--ink-dim` became `--color-content-accent` and `--color-content-primary-dim` (entry 38).
- `main`'s spacing tokens, its theme-flip test and its photo-essay README were kept.
