# Chunk 1: Skeleton and content model

**One new idea:** the page is a **flat list of sibling blocks**: text, visual, text, visual. The Times stores that list
as data (ArchieML or JSON) and loops over it to render the page.

**Reference:** breakdown §1 (page anatomy), §15 #1 (content as data). Look at `scrolly-template.html` with CSS
disabled: in DevTools, ⌘⇧P → "Disable CSS" isn't built in, so just read its `<body>` in the Elements panel.

## Build
Semantic markup only, **no CSS**:

- [x] `prototype/index.html` with `<!doctype html>`, `<html lang="en">`, `<meta charset>`, the viewport meta and a `<title>`.
- [x] `<article class="story">` containing, in order:
  - [x] `<header class="header">` with `<h1 class="headline">`, `<p class="subtitle">` (the dek) and an empty `<div class="header-art">`.
  - [x] `<p class="byline">By … <time datetime="2026-10-01">Oct. 1, 2026</time></p>`.
  - [x] About **10 `<p class="g-text">`** of invented demo copy, spread between the visual blocks.
  - [x] Empty placeholder `<section>`s for each visual block, each with an `aria-label` and a `data-block` name:
        `two-up`, `diagram`, `scrolly-a`, `scrolly-b`, `scrolly-c`, `scrolly-d`.
  - [x] `<footer class="credits">`.
- [x] Above the article, add a comment that writes the page **as data**, the shape the Times would store:
  ```js
  /* content model
  [
    { type: "header", headline: "…", dek: "…" },
    { type: "text", value: "…" },
    { type: "two-up", images: [...], caption: "…" },
    { type: "text", value: "…" },
    { type: "diagram", nodes: ["Idea", "Draft", "Revise", "Ship"] },
    { type: "scrolly", scene: "a", steps: [...] },
    …
  ] */
  ```
  You'll render from data like this in chunk 11. For now it's documentation that keeps you honest.

## Learn
- Why the blocks are **siblings**, not nested in layout wrappers. Later chunks let each block decide its own width.
- The landmarks you get for free: `article`, `header`, `footer`, `section` with a name. The heading order is one `h1`, then `h2`s if needed.
- ArchieML in two minutes: [archieml.org](http://archieml.org/). The same list, written by an editor in a Google Doc.

## Checkpoint
- [x] With no CSS at all, the page reads like a well-formed document: headline, dek, byline, paragraphs, credits.
- [x] DevTools → Elements → Accessibility → **full-page accessibility tree**: the order is headline → dek → byline → text → each named section → credits.
- [x] [Nu HTML Checker](https://validator.w3.org/nu/#textarea): no errors.
- [ ] Turn on VoiceOver (⌘F5) or NVDA and read the page top to bottom. Nothing surprising.

## Watch out
- Don't add `div` wrappers "for layout later." Chunk 3 shows why you won't need them.
- Breakdown §19 #8: when the diagram gets content (chunk 7), its nodes become an `<ol>`, because a process is an ordered list.
