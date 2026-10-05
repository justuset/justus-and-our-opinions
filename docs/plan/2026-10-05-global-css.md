# Global CSS: replicating how NYT Opinion's page CSS works

**Status (2026-10-05):** G1 done ([learning log 33](../learning-log/33-g1-color-roles.md)), G2 done ([log 34](../learning-log/34-g2-scales.md)), G3 done ([log 35](../learning-log/35-g3-type-roles.md)). Open decisions settled: no prefix, `Dark.json` greys. G4 is next. The 480px question is still open: the NYT domain is blocked for Claude's web tools, so it needs a manual measurement (see log 35).
**Source:** the global stylesheet of a shipped NYT Opinion page, pasted by the project owner on 2026-10-05 (not committed:
it's NYT's code. This doc describes it in our own words).

## 1. What the NYT file is, decoded

The file is not one stylesheet. It's six layers stacked in one bundle, each from a different owner at the Times:

| # | Layer | What it does | Prefix |
|---|-------|--------------|--------|
| A | **Color tokens** | Semantic colors in light and dark, plus `always-light`, `always-dark` and `user-inverse` variants of each | `--tpl-color-*` |
| B | **Primitive tokens** | Font families, weights, letter-spacing, line-heights, font sizes (rem), spacing (rem, 8px base), border widths, rule shorthands | `--tpl-font-*`, `--tpl-size-*`, `--tpl-rule-*` |
| C | **Typography roles** | One `font` shorthand per role (`body`, `headline-opinion-36`, `label-regular` …), each with `-ls` (letter-spacing) and `-tt` (text-transform) companions | `--tpl-typography-*` |
| D | **Component themes** | Button, dialog, story list, tile, toast: every size, color and spacing as a token | `--tpl-theme-*` |
| E | **Legacy color set** | An older, overlapping palette (`content-quaternary`, `signal-editorial` …) kept for old components | `--color-*` |
| F | **Base CSS** | Meyer reset, form normalize, focus ring, body color, print styles, native-app font scaling, view transitions | none |

### The three tricks worth learning

1. **The space toggle (light/dark without duplicating tokens).** Every themed color is written once:
   `--x: var(--tpl-pvt-light, #121212) var(--tpl-pvt-dark, #f8f8f8);`
   A switch variable is either `initial` (invalid, so `var()` uses its fallback: the color) or empty (valid, so it
   contributes nothing). Light mode sets `--tpl-pvt-light: initial; --tpl-pvt-dark: ;` and only the light color
   survives. Classes (`.tpl-always-dark`, `.tpl-user-inverse`, `.tpl-user-default`) flip the switches on any subtree,
   so a dark section can sit in a light page. It predates `light-dark()`, which now does the same thing natively.
2. **Typography as one shorthand.** `font: var(--tpl-typography-body)` sets weight, size, line-height and family in
   one line. `font` can't carry letter-spacing or case, so those ride alongside as `-ls` and `-tt`. Components never
   pick a size; they pick a role.
3. **Responsive type by toggle, not media query per component.** `--tpl-typography-body` holds two values behind the
   `--tpl-pvt-ui-size-compact/regular` switch, which flips at **480px**: 18/1.39 below, 20/1.5 above. The block is
   declared on `:root, :where(:root *)` so every element re-resolves it against the switch.

## 2. What applies to this project

Rules that decide it: diatour wins visual conflicts, no NYT fonts or branding, rem/logical properties, text renders
without JS, story CSS scoped under `:where(.birdkit-body)`.

| NYT layer | Verdict | Why |
|-----------|---------|-----|
| A. Semantic color **names** (`content/stroke/background` × `primary/secondary/dim/accent`) | **Adopt** | `photo-essay` already uses these names via `Dark.json`/`Light.json`. Make both templates use them |
| A. Color **values** | **Adopt for the light (`opinion`) theme only** | The light values match `Light.json`. Dark stays diatour (`#121211` / `#ededeb`), per CLAUDE.md |
| A. Space-toggle mechanism | **Replace with `light-dark()` + `color-scheme`** | Same result, native, readable. Both `app.css` files currently repeat every color twice (`:root` and the theme class): this removes that |
| A. `always-light` / `always-dark` scopes | **Adopt** as two classes (`color-scheme: light/dark`) | A dark scrolly inside a light story. `light-dark()` gives this free |
| A. `user-inverse`, `user-default` (follows the OS) | **Skip** | The story picks its theme in `doc.json`, like the shipped pages. Add `user-default` if a story ever needs to follow the reader's OS |
| B. Font families (Cheltenham, Franklin, Imperial, Karnak) | **Map to roles, never the faces** | `--font-headline` → Newsreader, `--font-ui` → system sans (Franklin's job), `--font-body` → `--font-text` (Imperial's job). Karnak: skip |
| B. Font-size scale in rem | **Adopt** (only the steps we use) | Already rem in both templates. Name them `--size-font-14` etc. so they match `Dark.json` |
| B. Spacing scale (`.5rem` steps) | **Adopt** | `photo-essay` has `--space-*` in px. Convert to the rem scale |
| B. Border widths + `--rule-*` shorthands | **Adopt** | Recirc and byline rules repeat `1px solid …` by hand today |
| B. Weight, letter-spacing, line-height scales | **Skip as tokens** | A token named `--line-height-1-3` is just `1.3`. Use the numbers inside the role tokens |
| C. Typography role shorthands + `-ls`/`-tt` | **Adopt, ~10 roles** | `body`, `headline` (Opinion's condensed bold, set in Newsreader 550), `dek`, `kicker`/`label` (uppercase, `.1em`), `byline`, `caption`, `credit`, `text-14`, `text-12`. Not the 80 the NYT ships |
| C. 480px body toggle | **Verify first** | Our templates switch body type at 740px. Measure the shipped page at 600px wide: if body is 20px there, move the switch to 480px |
| C. `:where(:root *)` re-declaration | **Skip** | Only needed for toggles that change per element. We set the responsive value on `:root` in one media query |
| C. System scale (`xxs`…`l`) | **Skip** | The native apps' text-size setting. rem already follows the browser's |
| D. Button, story-list themes | **Adopt into `shell.css` only** | The shell has a comment button, share tools and Recirc (a story list). Use the measured heights (44/32/24px), 3px radius, divider and padding values |
| D. Dialog, tile, toast | **Skip** | No such components |
| E. Legacy `--color-*` | **Skip** | Duplicates A |
| F. Focus ring | **Adopt** | Accent outline, `2px` with `2px` offset, only on `:focus-visible`, with the fade-in transition under `prefers-reduced-motion: no-preference` and a `forced-colors` guard. Plus the `a:has(p, div)` fix for block links (Recirc cards) |
| F. Body color = `content-primary-dim` | **Adopt** | `photo-essay` already does it on `.g-text`. Move it to the story root |
| F. Meyer reset | **Adopt the safe part** | `margin: 0`, `font: inherit` on form controls, `text-size-adjust: 100%`, `img { max-width: 100%; height: auto }`. **Not** `body { line-height: 1 }` or `ul { list-style: none }` globally: they break no-JS reading of plain text |
| F. Print styles | **Adopt** | Black on white, no shadows, avoid breaks inside figures and after headings. Cheap and very newspaper |
| F. `overflow-x: hidden`, `height: 100%` on `html/body/main` | **Skip** | We use `overflow-x: clip`, which keeps `position: sticky` working. `height: 100%` fights the scroll runways |
| F. `scroll-padding-top: 50px` | **Keep ours** | Same idea, already `var(--masthead-h)` |
| F. `.NYTApp`, `.IOS`/`.ANDROID[data-base-font-size]`, `-apple-system-body` | **Skip, note in the log** | How the Times' native apps scale web type inside their webviews. No app here |
| F. `body.dark`, `body.transparent` | **Skip** | Embed modes for iframes (the hot pink is a debugging tell) |
| F. `@view-transition { navigation: auto }` | **Skip for now** | One page per template. One line to add when there are two |
| F. `-ms-*`, `-moz-focus-inner`, `.hasNoSvg` | **Skip** | Dead browsers |

## 3. Where it goes

One shared file, because the reset, focus ring, print rules and theme mechanics are identical in both templates today
(CLAUDE.md: shared code lives once in `projects/birdkit-kit/`).

```
projects/birdkit-kit/
  tpl.css          NEW  layers A, B, C, F: color roles, scales, type roles, base, focus, print
  shell/shell.css       --shell-* aliases point at tpl tokens; adds the button and story-list values (D)
projects/<template>/src/
  app.css               template-only: measured layout (column, header, gaps), motion, components' sizes
  routes/+layout.svelte imports $kit/tpl.css, then ../app.css
```

Cascade layers keep the order explicit, so a template's rule always beats a kit rule without specificity games:
`@layer tpl.tokens, tpl.base, app;` declared once at the top of `tpl.css`. `shell.css` sits in `tpl.base`.

## 4. Chunks

One idea each. Build and test **both** templates after every chunk (`npm run build` must end with "verified N media
URLs"; `npm run test:e2e` at 390 / 800 / 1440; page with JS on and off).

| # | Chunk | The one idea | Checkpoint |
|---|-------|--------------|-----------|
| G1 | **Color roles with `light-dark()`** | One declaration per color; the theme class only sets `color-scheme` | `.g-theme-diatour` and `.g-theme-opinion` pixel-match today's screenshots in both templates. Each theme block is one line. AA contrast table in the log |
| G2 | **Scales** | rem font-size, spacing and border scales, `--rule-*` shorthands | No px left in `--space-*`. Layout unchanged at three widths |
| G3 | **Typography roles** | `font: var(--type-body)` + `-ls`/`-tt`; components pick a role, not a size | Every text component in both templates uses a role. Computed styles unchanged. 200% zoom scales everything |
| G4 | **Base, focus, print** | One shared reset, focus ring and print sheet in `tpl.css`; both `app.css` files lose their copies | Tab through the page: every control shows the ring, mouse clicks don't. Print preview is readable black on white |
| G5 | **Shell component themes** | Button and story-list tokens drive the shell | Shell e2e passes with the measured heights; Recirc dividers come from `--rule-tertiary` |

Before G3: measure body type on the shipped page at 600px (§2, the 480px question) and record the answer.

Each chunk gets a `docs/learning-log/NN-*.md` entry. G1's entry explains the space toggle and why `light-dark()`
replaces it. `docs/project-structure.md` and `docs/design-system.md` get the new token names in the same PR.

## 5. Overlap with Phase 2 chunk 01

[Chunk 01](phase-2/01-tokens-and-base-css.md) plans the same thing for `packages/design-system/` (React + SvelteKit
apps). This plan is its Birdkit-side rehearsal: when chunk 01 starts, `tpl.css` moves into the package mostly as is,
and chunk 01's `data-theme` + `prefers-color-scheme` task becomes "add `user-default`", which §2 skipped.

## Open decisions for the owner

1. **Token prefix.** `--tpl-*` mirrors the Times' naming for learning value; short names (`--color-content-primary`)
   read better. Recommendation: no prefix, NYT role names (`--color-content-primary`, `--type-body`).
2. **Dark values.** Keep diatour (`#121211`, `--soft` as rgba) or switch to `Dark.json`'s solid greys (`#acacac`,
   `#969696`) everywhere, as `photo-essay` already does? Recommendation: `Dark.json` greys; solid colors make the
   contrast table exact.
