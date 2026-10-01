# Chunk 08: React islands: Quiz and Roundtable

**Goal:** Build two recurring "product format" widgets in React 19, the way the Times's product front end would:
an accessible **quiz** and a **roundtable** ("Three writers, one question") that loads lazily with error isolation.

**Reference:** diatour-nyt §VIII.VI (React fundamentals, derived state, accessible quiz), §VIII.VII (React 19
and 19.2: Actions, `useEffectEvent`, `Activity`, Compiler 1.0), §VIII.VIII (block map, ErrorBoundary + Suspense +
`lazy`), §VIII.X (INP, `useTransition`, focus management, `aria-live`).

## Learn first
- [react.dev: Learn](https://react.dev/learn), then [Thinking in React](https://react.dev/learn/thinking-in-react) and [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React 19.2 release post](https://react.dev/blog) (`Activity`, `useEffectEvent`)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary)

## Tasks
### Quiz (`src/components/react/Quiz.tsx`)
- [ ] Typed props: `questions: { id, prompt, options: string[], correct, explain }[]`, from a `{.quiz}` ArchieML block.
- [ ] One `<fieldset>` + `<legend>` per question, real radio inputs with labels. No clickable `div`s.
- [ ] Keep only `answers` in state. Score and "done" are **derived** during render.
- [ ] Reveal the explanation after answering. Announce the result in `aria-live="polite"`.
- [ ] On "Next question," move focus to the next legend or heading (`useRef` + `focus()`).
- [ ] Server-rendered fallback: the questions and options show as a list, with answers in a `<details>`.
- [ ] Add the React Compiler (`babel-plugin-react-compiler`) and remove any manual `useMemo`.

### Roundtable (`src/components/react/Roundtable.tsx`)
- [ ] Data from `[+writers]` (name, stance, quote, avatar). The demo uses invented writers.
- [ ] Tabs or a stance filter (Yes / No / It's complicated). Use `<Activity>` to keep hidden panels mounted with their state.
- [ ] Each writer card is wrapped in an `ErrorBoundary`. A broken card shows "This response could not load," and the rest still render.
- [ ] Load it with `lazy()` + `Suspense`, with a placeholder that reserves its height (no layout shift).

### Wiring
- [ ] `BlockRenderer`: `quiz` → `<Quiz client:visible />`, `roundtable` → `<Roundtable client:idle />`. Write down why each directive was chosen.
- [ ] Unit tests in `tests/unit/` (Vitest + Testing Library): query **by role**, answer with `user-event`, assert the live-region text.

## Done when
- The quiz is fully playable by keyboard alone and by screen reader alone.
- The INP of answering a question is under 200ms with 6× CPU throttling.
- A deliberately thrown error in one roundtable card doesn't take down the page.
- Svelte and React islands work on the **same page** (milestone M3 🎉).

## Concepts to write about
- Derived state vs stored state (and the bug class it removes)
- What the React Compiler memoizes for you
- `client:visible` vs `client:idle` vs `client:load`
- How the React mental model differs from Svelte's (rendering runs again vs fine-grained signals)
