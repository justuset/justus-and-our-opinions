# Chunk 2: Tokens and the text column

**One new idea:** `clamp()` and `min()` replace media queries. `--col: min(100% − 2·gutter, 600px)` does the work of
two or three breakpoints in one line.

**Reference:** breakdown §2 (tokens), §3 (column math table), §7 (body text). Diatour colors and fonts: `docs/design-system.md`.

## Build
- [x] `:root` tokens:
  ```css
  :root {
    /* layout (measured, from the reference) */
    --gutter: clamp(10px, 12.5vw, 49px);
    --w-body: 600px;
    --col: min(calc(100% - var(--gutter) * 2), var(--w-body));
    /* motion (measured) */
    --ease-settle: cubic-bezier(0.22, 1, 0.36, 1);
    --ease-fade:   cubic-bezier(0.215, 0.61, 0.355, 1);
    --ease-intro:  cubic-bezier(0.25, 1, 0.5, 1);
    /* color and type: diatour */
    --paper: #121211; --ink: #ededeb; --soft: rgba(235,235,240,.66); --faint: rgba(235,235,240,.56);
    --line: rgba(255,255,255,.14); --surface: rgba(255,255,255,.05);
    --font-display: 'Newsreader', Georgia, serif;
    --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-serif-body: 'Newsreader', Georgia, serif;   /* reference uses a serif body; choose one, see below */
  }
  ```
- [x] Load Newsreader from Google Fonts (`display=swap`).
- [x] `html, body { margin: 0; background: var(--paper); color: var(--ink); }` and `*, *::before, *::after { box-sizing: border-box; }`.
- [x] `.g-text { width: var(--col); margin: 0 auto 12.5px; font: 20px/30px var(--font-serif-body); }`, stepping to `18px/27px` below 740px.
- [x] `@supports (text-wrap: pretty) { .g-text { text-wrap: pretty; } }`.
- [x] Style `.byline` and `.credits` the same width (`var(--col)`), in the sans face, in `--soft` and `--faint`.

**Decision to make and log:** the body face. The reference sets body text in **serif 20/30**, while diatour uses a **system
sans**. Diatour wins on looks, but this is a visual essay. Try both and keep one.

## Learn
- `clamp(MIN, PREFERRED, MAX)`: work out where `12.5vw` hits 49px (**392px**) and where the column reaches 600px (**698px**).
  Then check both numbers in DevTools → Computed.
- `min()` picks the smaller value *at that moment*. That's why one expression covers phones and desktops.
- Why `margin: 0 auto` centers a block with a set width.

## Checkpoint
- [x] In responsive mode, drag from **320 to 1600px**. On phones the text runs nearly edge to edge with breathing room, and it
      **locks at 600px and centers** from about 700px.
- [x] The measured column widths match breakdown §3: **240px at 320, 281px at 375, 600px at 800**. (Hover the paragraph and read the box size.)
- [ ] Line length on desktop is roughly 60–75 characters. *(Measured on Linux: sans ~57, serif ~64. Re-check on macOS with Newsreader loaded, see learning log 06.)*
- [x] Text contrast: DevTools color picker shows AA or better for `--ink` and `--soft` on `--paper`.

## Watch out
- Keep every value in `:root`. If you find yourself typing a hex color or a size in a rule, make it a token.
