# Reference: what the diatour-nyt artifacts tell us

This project takes its requirements from three private Diatour artifacts (Claude artifacts, Sept–Oct 2026):

| Artifact | Title | What we use from it |
|----------|-------|---------------------|
| `diatour-nyt` | *Built on Deadline* | Times tech stack, Opinion desk formats, the "Basic Pistol" page teardown, tool ideas, React template patterns |
| `diatour-nyt-frontend` | *Front End, Line by Line* | Rendering strategy (static text + interactive islands), scrollytelling engine, framework comparison |
| `diatour-nyt-phone` | *The Call With Whitney* | Shares the same visual design system as the other two |

This file condenses the parts that shape **what we build** and **how we build it**. Facts about the Times are
as the artifacts report them, from public sources. Some of those sources are several years old, so treat
platform details as background, not as a spec.

---

## 1. How the Times builds for the web (as the artifacts describe it)

| Layer | Public picture | What it means for this project |
|-------|----------------|--------------------------------|
| Product front end | **React**, with GraphQL (Apollo) and Node SSR; a 2026 posting adds Go, GitHub Actions, GCP and AWS | Recurring "product" formats are React-shaped |
| Graphics / interactives | **Svelte** (Rich Harris worked at the Times), **ai2html**, **ArchieML**, D3, LayerCake | Bespoke visuals are Svelte-shaped |
| Copy | Editors write in Google Docs with **ArchieML**, and code reads the doc as data | Our content model starts as an ArchieML text file |
| CMS | Oak (React + ProseMirror) | Out of scope. We render from files |
| QA | Visual regression, real devices, iOS Safari first | Playwright screenshot matrix in CI |

The artifact's open question for the Opinion desk: *"Which of the two do Opinion's recurring templates use,
or do they span both?"* **This project spans both on purpose**, so we learn where each one fits.

## 2. Five engineering principles (diatour-nyt §III.III)

| Principle | In practice | Where it shows up in our plan |
|-----------|-------------|-------------------------------|
| Performance first | A byte budget per piece, lazy media, no library for what CSS can do | Chunks 02, 04, 10 |
| Accessible by default | Real headings and tables, live text over images, a keyboard path through every control | Every chunk. Enforced in 10 |
| Restraint | One motion idea per piece, and every animation can switch off | Chunks 04–08 |
| Trust the reader | Show the data, label it plainly | Chunks 06, 07 |
| Systems over one-offs | Props and ArchieML fields for everything that changes between uses | Chunks 03, 11 |

## 3. Anatomy of a Times story page (from the "Basic Pistol" teardown, §VI.I)

| Module | What it is | Built by (at the Times) | Our version |
|--------|-----------|-------------------------|-------------|
| Section bar | Sticky nav | Platform | `SiteHeader` (HTML + CSS) |
| Kicker | "Opinion · Guest Essay" | Platform template | `<p class="kicker">` |
| Headline and dek | Display serif headline, serif dek at reading size | Platform template | `<h1>` + `<p class="dek">` with `text-wrap: balance` |
| Listen | Narrated audio player above the fold | Platform audio | `AudioPlayer`, native `<audio>` (chunk 09) |
| Action row | Gift, share, save, comments | Platform | `ActionRow` with the Web Share API (chunk 04) |
| Lead art | Photo or illustration with caption and credit | Photo desk | `<figure><picture>` (chunk 09) |
| Byline | Headshot, dateline, date | Platform | `<address>`-free byline with `<time datetime>` |
| Body | Text column with full-bleed breakouts | Platform | CSS grid with named lines `content` and `full` (chunk 02) |
| Inline media | Tap-to-play video, captions | Video desk | Safe video default (chunk 09) |
| End matter | Comments CTA, recirculation | Platform | `EndMatter`, static |

What the teardown suggested adding, each as a **reusable** block:

1. **Tally**: a count from the headline drawn as marks that fill in as you scroll. *Svelte* (§VI.II)
2. **Stat-to-chart** with a table fallback: accessible SVG plus a `<details>` table. *Svelte + D3 scales* (§VI.III)
3. **Cycle diagram**: a loop drawn with CSS `offset-path`, no JavaScript (§VI.IV)
4. **Media preflight script** and a **breakpoint screenshot matrix** in CI (§VI.VII)

The QA findings worth designing against: a floating share button covering body text on phones, the same image
appearing twice, and a comment count that goes stale.

## 4. Essay skeleton markup (diatour-nyt §VIII.II)

```html
<article class="essay">
  <header>
    <p class="kicker">Opinion | Guest Essay</p>
    <h1>A headline that balances across two lines</h1>
    <p class="dek">The deck sets up the argument in one sentence.</p>
    <p class="byline">By <a href="/by/a-writer">A. Writer</a>
      <time datetime="2026-09-26">Sept. 26, 2026</time></p>
  </header>
  <figure> <picture>…</picture> <figcaption>… <span class="credit">…</span></figcaption> </figure>
  <section aria-labelledby="s1"><h2 id="s1">The first argument</h2><p>Body copy.</p></section>
</article>
```

## 5. Rendering strategy (diatour-nyt-frontend §VI, Q12)

> "Server or static HTML for text; hydrate small islands."
> "Server: headline, dek, byline, body text, images and static charts. Client: only the interactive islands …
> so text never waits on JavaScript."

The frontend artifact lists **Astro** ("mostly static pages with interactive islands in any framework") as
an option next to Next.js, React Router and plain Vite. Astro is the only one of these that runs **Svelte and React
islands on the same page** while shipping zero JavaScript for the text. See `docs/architecture.md`.

## 6. React template pattern (diatour-nyt §VIII.VIII)

A story arrives as **a list of typed blocks**. A map sends each type to a component. Each block sits in its own error
boundary. Heavy blocks load lazily behind a placeholder with a fixed aspect ratio, so nothing shifts when they arrive.

```jsx
const BLOCKS = { text: TextBlock, quote: PullQuote, image: Figure,
                 chart: lazy(() => import('./blocks/Chart')) };
```

We use the same idea at the Astro level: `BlockRenderer.astro` maps `block.type` to an Astro, Svelte or React component.

## 7. Scrollytelling engine (diatour-nyt-frontend §VIII.VI)

- Write the steps as HTML first, so the story reads with no JavaScript.
- Make the graphic `position: sticky; top: 0; height: 100svh`.
- Use an IntersectionObserver with `rootMargin: "-50% 0px -50% 0px"`, so the active step is the one crossing the middle of the screen.
- Keep states declarative: step 3 always looks the same, however you got there.
- Use ResizeObserver for redraws, jump straight to each state under reduced motion, and test on a real phone.

## 8. ArchieML example (diatour-nyt §I.VI)

```
headline: Three Writers, One Question
dek: Should cities ban cars downtown?
[+writers]
name: A. Writer
stance: Yes
{.quote}
Streets are the largest public space we own.
{}
[]
```

## 9. The design system (the "diatour" look)

All three artifacts share one visual system. The full token list is in `docs/design-system.md`. In short:

- **Dark editorial paper**: `--paper #121211`, `--ink #ededeb`, with translucent `--soft` and `--faint` text tiers.
- **Display serif** (Exposure VAR, weight 550, tight tracking) for titles. **System sans** for body text at 17–20px/1.65.
- **Structure**: Roman-numeral parts (`I.`, `II.`) with a 3px double rule, and chapters numbered `I.I`, each with an eyebrow pill,
  an `h3`, a dek, a body capped at `68ch` and a "Read further" refs row.
- **Components**: a TOC drawer (`details`/`summary`), "Refresh" code disclosures, tables with 0.5pt rules, step lists
  with numbered circles, and a byline with a round avatar.

## 10. Guardrails this project adopts

- **No Times branding or fonts.** Cheltenham, Franklin and Imperial are proprietary, and so is the T logo. This is a template *in the style of*
  editorial Opinion pages. It must never pass for the Times itself. The masthead reads **"Our Opinions."**
- **Font licensing.** Exposure VAR is a commercial typeface, embedded in the private artifacts. It is **not** committed
  here. We use a free serif from Google Fonts (Newsreader) through the `--font-display` token, and a licensed font can replace it later.
- **AI stays out of the argument** (diatour-nyt §IX). Tools may help with workflow and QA, with a person approving the output.
