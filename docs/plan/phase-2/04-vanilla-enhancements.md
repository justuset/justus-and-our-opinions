# Phase 2 · Chunk 04: Hydration and page behaviors

**Goal:** Turn on client hydration (as the Times article does) and add the behaviors every story gets: reading
progress, a contents drawer, share and footnotes. Each one must leave the server-rendered page fully usable if JS fails.

**Reference:** diatour-nyt §VIII.V (event loop, observers, rAF, passive listeners), §VIII.VII (`useEffectEvent`),
§VIII.X (INP, focus, `aria-live`), §VIII.IV (popover, anchor positioning, Custom Highlight API), and the diatour
artifacts' own TOC drawer with read dots. Guide §4 (CLS).

## Learn first
- [react.dev: `hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot) and [hydration mismatches](https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content)
- [What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
- [MDN: IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share), [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)

## Tasks
- [ ] Confirm hydration: open `entry.client.tsx` and find the `hydrateRoot` call. Add a deliberate mismatch (`new Date()` in render), read the warning, then fix it the right way: the server renders an absolute `<time>`, and the relative label is set after mount.
- [ ] `app/lib/motion.ts`: a `usePrefersReducedMotion()` hook (SSR-safe, defaults to `true` on the server).
- [ ] `ReadingProgress`: decorative (`aria-hidden`). The scroll listener is passive and throttled with rAF, with the logic in `useEffectEvent`.
- [ ] `ContentsDrawer`: diatour `details`/`summary` built from the story's headings on the server. On the client, it marks the current section with IntersectionObserver and shows "read" dots (`localStorage` in try/catch).
- [ ] `ShareButton`: `navigator.share` when available, otherwise copy to clipboard plus an `aria-live="polite"` "Link copied." The server render is a plain link.
- [ ] Method note: a "How we did this" `popover` (it works before hydration).
- [ ] Footnotes: anchor links with `:target` styling. *Stretch:* CSS anchor positioning for side notes at the ≥75em tier.

## Done when
- With JS off, the page from chunk 02 works fully: anchor links, the contents `details` and the method popover.
- No hydration warnings in the console.
- The Performance panel shows no long tasks over 50ms while scrolling. CLS is 0.00.

## Concepts to write about
- What hydration does, and why a mismatch happens
- `useEffectEvent`: why the listener sees fresh props without re-subscribing
- Progressive enhancement, as seen from React
