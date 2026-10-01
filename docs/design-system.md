# Design system: the "diatour" editorial look

These tokens come from the CSS of the `diatour-nyt` artifacts. The dark theme is the source. The light theme is
derived from it (one light rule in the source uses `#121212` ink). Chunk 01 turns this file into `src/styles/tokens.css`.

## Color

| Token | Dark (source) | Light (derived) | Use |
|-------|---------------|-----------------|-----|
| `--paper` | `#121211` | `#fbfbf8` | Page background |
| `--ink` | `#ededeb` | `#121212` | Headlines, strong text, icons |
| `--soft` | `rgba(235,235,240,.66)` | `rgba(18,18,18,.72)` | Body text, deks |
| `--faint` | `rgba(235,235,240,.56)` | `rgba(18,18,18,.56)` | Meta, numbers, captions, credits |
| `--line` | `rgba(255,255,255,.14)` | `rgba(0,0,0,.12)` | Rules, table borders |
| `--surface` | `rgba(255,255,255,.05)` | `rgba(0,0,0,.04)` | Pills, cards, step markers |
| `--surface-2` | `#1b1b1a` | `#f0efea` | Disclosure headers |
| `--accent` | `#ffd666` | `#8a6100` | Highlights, the "designer note" callout (use sparingly) |
| `--shadow` | `0 1px 2px rgba(0,0,0,.4), 0 16px 40px rgba(0,0,0,.5)` | `0 1px 2px rgba(0,0,0,.08), 0 12px 32px rgba(0,0,0,.08)` | Lifted media |

Check every pair against WCAG AA (4.5:1 for body text, 3:1 for large text and chart marks). Test `--faint` on `--paper` first.

## Type

| Token | Value | Notes |
|-------|-------|-------|
| `--font-display` | `'Newsreader', Georgia, 'Times New Roman', serif` | Source uses **Exposure VAR** (commercial, not committed). Swap it in here if you license it |
| `--font-body` | `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif` | As in the source |
| `--font-mono` | `ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | Code |

| Role | Size | Weight / style | Line-height | Extras |
|------|------|----------------|-------------|--------|
| Headline (`h1`) | `clamp(42px, 4.4vw + 22px, 76px)` | 550 | 1.04 | `letter-spacing: -0.02em; text-wrap: balance` |
| Part title (`h2`) | `clamp(38px, 3vw + 20px, 54px)` | 550 | 1.12 | balance |
| Part number | 18px | 550 *italic*, display | — | `--faint` |
| Section head (`h3`) | 28–36px | 550 | 1.12 | balance |
| Dek | 18–19px | 400 | 1.5 | `--soft`, `max-width: 60ch` |
| Body | 17px (phone), up to 20px | 400 | 1.65 | `text-wrap: pretty`, `max-width: 68ch` |
| Kicker | 13px | 600 | — | `--soft`, with a `|` separator in `--faint` |
| Eyebrow pill | 11–13px | 500 | — | `border-radius: 999px; background: var(--surface)` |
| Table head | 12.5px | 600 | — | `--soft` |
| Refs / meta | 13.5–14.5px | 400 | 1.5 | `--faint`, underline offset 3px |

## Space and shape

| Token | Value |
|-------|-------|
| `--space-1` … `--space-8` | `4, 8, 12, 16, 24, 34, 56, 96px` (34px and 96px appear often in the source) |
| `--radius-s` / `--radius-m` / `--radius-l` / `--radius-pill` | `8px / 12px / 16px / 999px` |
| `--rule` | `0.5pt solid var(--line)` |
| `--rule-part` | `3px double var(--line)` |
| `--measure` | `68ch` |

## Motion

| Token | Value |
|-------|-------|
| `--ease` | `ease` (the source uses `.18s`–`.2s ease` for hovers and chevrons) |
| `--dur-fast` / `--dur` | `180ms / 200ms` |

Rule: **one motion idea per piece.** Every animation must stop under `prefers-reduced-motion: reduce`, in both CSS and JS.

## Signature components (from the source)

| Component | Recipe |
|-----------|--------|
| Part divider | `.part-rule` (3px double) → italic number `I.` → `h2` → `.part-intro` in `--soft` |
| Eyebrow pill | `.enum` (tabular numbers, `--ink`, 600) + `.kind` (`--soft`) |
| TOC drawer | `details`/`summary` with a rotating chevron. Rows are a 66px number column plus the title. A dot marks chapters you've read |
| Refresh disclosure | Rounded `summary` on `--surface-2`. The open state squares off the bottom corners, and `pre.code` follows |
| Step list | Numbered circles 22–26px, `--surface` fill, tabular numbers |
| Byline | 40px round avatar, name 16px/700, dateline 15px `--faint` |
| Table | 15px/1.45, rows separated by `--rule`, first column in `--ink` |

## Theming mechanics

```css
:root { color-scheme: light dark; /* light values */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* dark values */ } }
:root[data-theme="dark"] { /* dark values */ }
```

The dark theme is the "house" look, so the demo page sets `data-theme="dark"` by default and keeps a toggle.
