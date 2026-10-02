# Chunk 4: The header

**One new idea:** size type **by characters** (`6ch` forces one word per line) and scale art **by height**
(`height: 100%; width: auto`), so it crops at the sides and never squashes.

**Reference:** breakdown §6 (header, size table, hidden coupling), §17 (breakpoints).

## Build
- [x] Header box: `.header.bleed { height: 675px; margin-top: 90px; overflow: hidden; position: relative; }`.
      (Set `position: relative` **explicitly**. The reference gets it only by accident from `.bleed`, breakdown §19 #11.)
- [x] Copy layer: `.header-copy { position: absolute; top: 12%; left: 0; right: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 20px; pointer-events: none; }`.
- [x] Headline: `max-width: 6ch; font: 700 58px/1 var(--font-display); text-transform: uppercase; margin: 2px auto 6px;`.
- [x] Dek: `max-width: 30ch; font: italic 1.1rem/1.4 var(--font-serif-body);`.
- [x] Art layer: `.header-art { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }` holding a placeholder
      SVG (`viewBox="0 0 1800 1200"`, a few `--surface` shapes, `aria-hidden="true"`), with `.header-art svg { height: 100%; width: auto; }`.
- [x] **≤ 359px:** `height: 67vh`, copy at `top: 13%`, headline 44px, dek `.85rem`.
- [x] **≥ 1024px:** copy vertically centered (`top: 0; bottom: 0; justify-content: center`), headline `max-width: 12ch; font-size: clamp(72px, 7.2vw, 96px); line-height: .92`,
      dek `max-width: 32ch; font-size: clamp(16px, 1.4vw, 20px)`.
- [x] Byline below: `margin: 24px auto 32px`. At ≥1024px in landscape, `margin-bottom: 100px`.

## Learn
- `ch` = the width of the "0" glyph in the current font. `6ch` fits about one short uppercase word.
- Why a **fixed** 675px height instead of `100vh`: tall phones show the start of the article under the header, which invites the reader to scroll.
- Height-driven art: the SVG always fills the header's height. On narrow screens its sides fall outside and `overflow: hidden` crops them.
  Designers keep key content in the middle ~40%.
- Work out `clamp(72px, 7.2vw, 96px)`: it's 72px until 1000px and 96px from 1333px.

## Checkpoint
- [x] **340px:** the headline stacks one word per line. The header is **67vh** tall, because 340 is below the 360px threshold. It's 675px from 360px up.
- [x] **800px:** still stacked at 58px. The art is centered and cropped at the sides.
- [x] **1440px:** the headline widens to two or three words per line at 96px, and the copy is vertically centered.
- [x] Drag 1024 → 1440: the headline **scales smoothly** (Computed: 73.7px at 1024, 92.2px at 1280).
- [x] The art **never squashes**. Check the circles stay round at every width.

## Watch out
- **Found while building:** `6ch` only means "one word per line" for a narrow face. The reference used a *condensed* uppercase font. In Newsreader, uppercase words overflow `6ch`, so we follow diatour (mixed case, weight 550), where `ch` ≈ 0.6em and the widest word fits. We also shortened the headline to three words (see learning log 08).
- Real header art should keep the band behind the dek clear. Our placeholder lines pass behind it at about 4.9:1 contrast, just over AA.
- `pointer-events: none` on the copy is deliberate: it lets clicks reach interactive art underneath.
- Phase 2 converts these px values to rem (breakdown §19 #5). Leave them as measured for now.
