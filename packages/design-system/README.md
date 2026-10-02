# @opinion/design-system

The diatour design system as plain CSS, shared by `apps/story` and `apps/graphics`.

```css
@import '@opinion/design-system/tokens.css';
body { background: var(--paper); color: var(--ink); }
```

There's no build step: the package exports the CSS file itself, and each app's Vite bundles it.
Chunk 00 has only the tokens needed to prove the wiring. [Chunk 01](../../docs/plan/phase-2/01-tokens-and-base-css.md)
fills in the full system.
