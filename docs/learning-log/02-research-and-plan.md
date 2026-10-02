# Learning log 02: Researching the reference and writing the plan

**Date:** 2026-10-01  **Chunk:** pre-00  **Branch:** `claude/wonderful-knuth-w43l2c`

## Goal

Before writing any code, read the existing analysis (the *diatour-nyt* artifacts), decide on an architecture, and
break the build into chunks small enough to learn from one at a time.

> **Update (same day):** the architecture below was superseded. See [log 03](03-times-shaped-stack.md).

## What I did

1. **Read three artifacts:** `diatour-nyt` (*Built on Deadline*), `diatour-nyt-frontend` (*Front End, Line by
   Line*) and `diatour-nyt-phone` (*The Call With Whitney*). They are single HTML files of 0.5–1.1 MB, mostly
   embedded fonts. To read them, I stripped the base64 data and HTML tags with a short Python script and searched
   the resulting text for stack terms (Svelte, React, ArchieML, scrollytelling…).
2. **Pulled out the design system** by reading the artifacts' CSS: `:root` color tokens, font stacks, and the
   rules for `.part`, `.eyebrow`, `.toc`, `.refresh` and `.byline`. → [`docs/design-system.md`](../design-system.md)
3. **Summarized the analysis** that shapes this build: the Times stack, the five principles, the "Basic Pistol"
   page anatomy, the React block-template pattern and the scrollytelling engine.
   → [`docs/reference/diatour-nyt-analysis.md`](../reference/diatour-nyt-analysis.md)
4. **Chose an architecture.** Astro with Svelte and React islands. → [`docs/architecture.md`](../architecture.md)
5. **Wrote a 12-chunk plan** with milestones. → [`docs/plan/`](../plan/README.md)

## Decisions and why

| Decision | Why |
|----------|-----|
| Astro as the shell | It's the only option that renders text with zero JS **and** hosts Svelte and React islands on one page. The frontend artifact's own advice is "static HTML for text; hydrate small islands." |
| Svelte for graphics, React for product formats | This mirrors the split the artifact describes at the Times, so each framework is learned in its real role. |
| ArchieML for content | The Times invented it. Editors write in a doc and code reads it as data, which is the "systems over one-offs" principle. |
| No Times fonts or logos | They're proprietary, and the project must not pass for the Times. The masthead is "Our Opinions." |
| Newsreader instead of Exposure VAR | Exposure is a commercial font embedded in private artifacts. Committing it to a public repo would breach its license. |
| Static page before any framework (chunk 02) | Proves the page works without JS and gives every island a baseline to enhance. |

## Concepts learned

- **Islands architecture:** most of the page is static HTML, and only the interactive parts ship JavaScript, each on its own schedule.
- **Content as data:** the template maps block types to components, so a new story is a new text file, not new code.
- **Read sources before planning:** the artifacts already answered "Svelte or React?" with "both, for different jobs."

## Next

[Chunk 00: Project foundation](../plan/phase-2/00-foundation.md).
