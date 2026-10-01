# Chunk 12 (optional): An AI-assisted newsroom tool, with a human in the loop

**Goal:** One internal tool, not reader-facing: an **alt-text and credit checker** that finds media missing alt
text or credits, streams AI-drafted alt text, and lets a person approve, edit or reject each draft before anything is saved.

**Reference:** diatour-nyt §IX (Times AI principles: AI as a tool, human review, transparency; AI never writes
or edits the argument), §VI.VII.6 (the alt text checker, axe first, AI only for what rules can't do),
§IX.II (keys stay on the server, validate inputs). Guide §1 (loading UX, defensive boundaries, human-in-the-loop, SSE streaming, server-only keys).
**Skills:** `claude-api` (Claude Code built-in) for the model call.

## Tasks
- [ ] Route `apps/story/app/routes/tools.alt-text.tsx`, internal only (dev, or behind basic auth in preview).
- [ ] Server `action`/resource route: collect `img`/`figure` data from a story (Playwright or parsed blocks), and run axe-core first.
- [ ] For missing alt text only, call the AI API **from the server** (the key lives in an env var and is never in the client bundle). Use strict tool use or structured output to get `{ id, alt, confidence }` JSON.
- [ ] Stream the drafts to the client with Server-Sent Events. The UI shows a shimmer skeleton per item, then text as it arrives, in fixed-height cards (`minmax`, `line-clamp` for previews) so streaming doesn't shift the layout.
- [ ] Each draft has Approve, Edit and Reject. Approved alt text is written back to the `.aml` **only on approval**. Log acceptance rates.
- [ ] Error states: timeout (`AbortSignal.timeout`), rate limit, empty output. The tool degrades to "write it yourself."

## Done when
- No key appears in the client bundle (`grep` the build output).
- Nothing changes in `content/` without a person's click.
- The log records whether the AI step earned its place (acceptance rate after 20 images).
