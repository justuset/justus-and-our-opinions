# Phase 2 · Chunk 12: Package the template for other people

**Goal:** Turn the project into something a designer or editor can use without you: docs, a block catalog,
a scaffold command, a public preview and a retrospective.

**Reference:** diatour-nyt §VI.VII ("the process behind every tool": spot the repeat, build it in a real story,
extract, document for designers, put it where people work, check back after five uses), §I.VII (onboarding
designers), §VII.IV (PR titles become release notes, tools graduate).

## Tasks
- [ ] `npm run new-story -- "slug"` (`scripts/new-story.mjs`): copies `content/stories/_template.aml`, fills in the date and opens the file path in the terminal output.
- [ ] `docs/blocks.md`: one section per block, with what it's for, its ArchieML fields (required/optional), one screenshot, and **one thing not to do**.
- [ ] Block catalog page `/blocks`: every block rendered with example data in both themes (it doubles as a visual-test fixture).
- [ ] `docs/for-designers.md`: the token ↔ Figma variable mapping, export sizes for lead art and posters, and how to request a new block.
- [ ] Deploy previews: Netlify, Vercel or GitHub Pages (React Router `prerender` for the story routes, with the graphics embeds copied into `public/embeds/`; or a Node host for full SSR). Link the preview URL in the README.
- [ ] `CHANGELOG.md` written from merged PR titles.
- [ ] Ask someone else to make a new story from the docs alone, timed. Goal: **under 10 minutes**. Note every question they ask and fix the docs.
- [ ] `docs/learning-log/12-retro.md`: what went well, what you'd change, Svelte vs React in your own words, and the next three blocks you'd build (cycle diagram from §VI.IV? audio-synced transcript? reader highlights with the Custom Highlight API?).

## Done when
- Milestone **M4**: green CI, a public preview URL, and a stranger can publish a story from the docs.
- The README explains the project in under one screen and links everything else.

## Concepts to write about
- Systems over one-offs: which blocks earned their place, and which should be cut
- Documentation as part of shipping
