# Chunk 08: Product formats: Quiz and Roundtable (React)

**Goal:** Two recurring Opinion formats built the way the Times's product front end would build them: React components in the
story app, server-rendered and hydrated, fed by ArchieML blocks.

**Reference:** diatour-nyt §VIII.VI (derived state, the accessible quiz), §VIII.VII (React 19.2 `Activity`,
`useEffectEvent`, Compiler 1.0), §VIII.VIII (ErrorBoundary + Suspense + `lazy`), §VIII.X (INP, `useTransition`,
focus, `aria-live`). §I.VIII lists quizzes as an Opinion format.

## Learn first
- [react.dev: Learn](https://react.dev/learn), [Thinking in React](https://react.dev/learn/thinking-in-react), [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React Compiler](https://react.dev/learn/react-compiler)

## Tasks
### Quiz (`app/components/blocks/Quiz.tsx`)
- [ ] Props from `{.quiz}`: `questions: { id, prompt, options, correct, explain }[]`.
- [ ] `<fieldset>` + `<legend>` with real radios and labels. Only `answers` is state. Score and "done" are derived.
- [ ] The explanation appears after answering. The result goes in `aria-live="polite"`. Focus moves to the next legend.
- [ ] Server render without JS: a plain list of questions with answers in `<details>`, so it's useful without JavaScript.
- [ ] Enable the React Compiler (`babel-plugin-react-compiler` in the Vite config). Remove any manual `useMemo`.

### Roundtable (`app/components/blocks/Roundtable.tsx`)
- [ ] Props from `[+writers]` (invented writers): name, stance, quote, avatar.
- [ ] A stance filter (Yes / No / It's complicated). `<Activity>` keeps hidden panels' state.
- [ ] Each card sits in its own `ErrorBoundary`. Lazy-load the component with `lazy` + `Suspense`, with a placeholder that reserves its height.
- [ ] Diatour styling: eyebrow pills for stance, the byline pattern for writers, `--rule` separators.

### Tests
- [ ] Vitest + Testing Library: query by role, answer with `user-event`, assert the live region. A thrown card error leaves the others rendered.

## Done when
- The quiz works with the keyboard alone and with a screen reader alone. INP is under 200ms at 6× CPU throttling.
- **Milestone M3:** the React quiz and a hydrated SvelteKit graphic work on the same story page.

## Concepts to write about
- Derived vs stored state
- What the compiler memoizes
- React re-rendering vs Svelte's fine-grained updates, seen in DevTools for one interaction each
