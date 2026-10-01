# Chunk 5: Intro motion

**One new idea:** **wait for fonts, then animate.** If the headline animates in a fallback font and the web font swaps
in mid-animation, the text reflows and jumps.

**Reference:** breakdown §6 (intro), §18 (motion spec).

## Build
- [ ] Starting state, **only when JS is running** (so the headline never stays invisible if JS fails):
  ```css
  .js .headline { opacity: 0; transform: translateY(15px); transition: opacity .8s var(--ease-intro), transform .8s var(--ease-intro); }
  .js .subtitle { opacity: 0; transform: translateY(10px); transition: opacity .8s var(--ease-intro) .2s, transform .8s var(--ease-intro) .2s; }
  .is-ready .headline, .is-ready .subtitle { opacity: 1; transform: none; }
  ```
- [ ] First line of `<head>`, with a **failsafe**: if the main script never runs, the headline still appears after 2.5s:
  ```html
  <script>
    document.documentElement.classList.add('js');
    setTimeout(() => document.documentElement.classList.add('is-ready'), 2500);
  </script>
  ```
- [ ] In the page script:
  ```js
  (document.fonts ? document.fonts.ready : Promise.resolve())
    .then(() => document.documentElement.classList.add('is-ready'));
  ```
- [ ] Reduced motion: `@media (prefers-reduced-motion: reduce) { .headline, .subtitle { transition: none; } }`.

## Learn
- `document.fonts.ready` resolves once every font in use has loaded (or failed).
- Easing choice: `--ease-intro` (0.25, 1, 0.5, 1) starts fast and lands softly. Compare it with `ease-in`, which feels sluggish because it starts slowly.
  Try each in DevTools → Animations at 10% speed.
- **Stagger:** the dek follows 0.2s later, so the eye reads the headline first.
- Why the `.js` class guard matters: the reference hides the headline in plain CSS and relies on `@media (scripting: none)` to undo it.
  That doesn't cover JS that's enabled but **fails**. The failsafe timeout does.

## Checkpoint
- [ ] Network → "Slow 4G" + "Disable cache", then reload: a clean **staggered fade-up**, with no jump when Newsreader arrives.
- [ ] Animations panel at 10%: the dek visibly starts 0.2s after the headline.
- [ ] Rendering → emulate `prefers-reduced-motion: reduce`: the text appears instantly.
- [ ] Disable JavaScript and reload: the headline and dek are visible immediately.
