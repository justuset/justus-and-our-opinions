# Chunk 6: Two-up images and desktop/mobile twins

**One new idea:** **mobile-first `min-width` queries**, and swapping **whole components** (twins) instead of
reflowing one.

**Reference:** breakdown §5 (twins, and the cascade bug), §8 (two-up).

## Build
### Two-up
- [x] Markup, written valid (the reference's caption sits outside a `<figure>`, breakdown §19 #7). `<figcaption>` must be a
      **direct child** of `<figure>`, so the figure itself is the flex container, with no inner wrapper div:
  ```html
  <figure class="two-up bleed">
    <img src="assets/a.jpg" alt="…" width="800" height="1000">
    <img src="assets/b.jpg" alt="…" width="800" height="1000">
    <figcaption class="group-caption">One caption for both images. <span class="credit">Demo image</span></figcaption>
  </figure>
  ```
  (Placeholders are fine: a 4:5 `div` with a gradient, or CC0 images.)
- [x] Phones (base): the figure is a flex column with `gap: 12px`, `margin: 40px 0; padding: 0 20px;` (reset figure's default side margin), `aspect-ratio: 4 / 5` on the images.
- [x] `@media (min-width: 640px)`: `flex-flow: row wrap`, images `flex: 1 1 0; min-width: 0`, caption **`flex: 0 0 100%`** (forced onto its own row), `margin: 70px 0`.
- [x] `@media (min-width: 1250px)`: `padding: 0 64px; max-width: 1440px; margin: 100px auto;`.

### Twins
- [x] Utilities, **declared at the end of the stylesheet**. They only ever *hide*, so each component keeps its own `display` (the header art stays `flex`):
  ```css
  @media (max-width: 1023.98px) { .desktop-only { display: none !important; } }
  @media (min-width: 1024px)    { .mobile-only  { display: none !important; } }
  ```
- [x] Give the header **two** art layers: `.header-art.desktop-only` (landscape `viewBox="0 0 1800 1200"`) and `.header-art.mobile-only`
      (portrait `0 0 800 1200`), each composed differently.

## Learn
- Mobile-first: base styles = phone, then each `min-width` query **adds** layout. Read the CSS top to bottom like the screen growing.
- `flex: 1 1 0` (basis 0) makes the figures exactly equal. `flex: 0 0 100%` plus `wrap` pushes the caption onto its own line without a wrapper.
- Twins = **ai2html artboards**: re-composing for a portrait screen beats shrinking a landscape picture.
- The **cascade bug** in the reference: `.header-art { display: flex }` comes later with the same specificity, so **both** header twins show at
  every width (breakdown §5). That's why the twin utilities go last here, with `!important` (fine for single-purpose utilities), and why they only hide: a "show" rule like `display: block` would override the header art's `flex`.

## Checkpoint
- [x] **< 640px:** the images stack, with the caption below.
- [x] **≥ 640px:** side by side, equal widths, the caption on its own row.
- [x] **≥ 1250px:** padding grows and the block caps at 1440px (try 1600 and 1920).
- [x] Twins: Elements → each `.header-art` → Computed `display`. **Exactly one** is visible at 375 and at 1280.
- [x] Elements → Layout → flex overlay shows the wrapping caption row.

## Port (after the checkpoint passes)
Into `projects/interactive/`: `src/lib/components/TwoUp.svelte` (640px row, 1250px cap) and the twin utilities in `src/app.css`, declared last. Give `Header.svelte` its mobile and desktop art twins. Rebuild with `npm run build`, check JS on and off, and mark the component ✅ (see [`docs/project-structure.md`](../../project-structure.md) §11).
