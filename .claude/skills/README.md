# Project skills (Claude Code)

Claude Code automatically discovers skills in `.claude/skills/<name>/SKILL.md` when it works in this repo. Each
skill's one-line description decides when it loads. Its `references/` files are read only when needed.

## Svelte skills, vendored from svelte-skills-kit

| | |
|---|---|
| Source | <https://github.com/spences10/svelte-skills-kit> (`plugins/svelte-skills/skills/`) |
| Upstream canonical repo | <https://github.com/spences10/skills> |
| Commit vendored | `2a9d88379bf62cee464a16db852edda7790a58f5` (plugin version 1.3.0) |
| Date vendored | 2026-10-01 |
| Author | Scott Spence |
| License | MIT, as declared in the source repo's `.claude-plugin/marketplace.json`. The full text is below |

The files are copied **unchanged**. To update them, re-copy from upstream and bump the commit above. Don't
edit them in place. Project-specific guidance goes in `/CLAUDE.md` instead.

| Skill | Use in this project |
|-------|---------------------|
| `svelte-runes` | **Core.** `$state`, `$derived`, `$effect`, `$props` in every graphic (Phase 1 chunk 11, Phase 2 chunks 05–08) |
| `svelte-template-directives` | **Core.** `{@attach}` for observers and D3, `{@render}` for snippets (scrolly graphic slot) |
| `svelte-styling` | **Core.** Scoped styles, passing design tokens with `style:--var` and `--prop` on components |
| `svelte-layerchart` | Optional. Weighed against hand-rolled `d3-scale` charts in Phase 2 chunk 06 |
| `svelte-components` | Reference. Web components and form patterns |
| `svelte-deployment` | **Used.** Vite and plugin versions, `adapter-static` for the graphics app, library builds for embeds |
| `sveltekit-structure` | **Used.** The graphics app is SvelteKit: preview routes, prerendering, `<svelte:boundary>`, SSR/hydration |
| `sveltekit-data-flow` | Light use. `load` functions for the preview routes (reading ArchieML) |
| `sveltekit-remote-functions` | Not used. Graphics are prerendered, with no server calls |

Not vendored: `ecosystem-guide`. It's about the author's other CLI/MCP tools, not Svelte.

## Install the plugin instead (alternative)

If you'd rather receive upstream updates than vendor the files:

```
/plugin marketplace add spences10/svelte-skills-kit
/plugin install svelte-skills
```

## License (applies to the vendored skill folders above)

```
MIT License

Copyright (c) Scott Spence

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> The source repo declares MIT in its manifest but has no `LICENSE` file. The notice above reproduces the
> standard MIT text with the declared author.
