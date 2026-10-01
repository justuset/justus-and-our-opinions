<!-- Header: headline, dek and the art stage (prototype chunks 4 and 5).
     A fixed-height box with two absolutely positioned layers: art behind, copy on top.
     The art scales by height, so it crops at the sides and never squashes.
     Planned: the art stage becomes a twin Lottie (big_assets/videos/hero/hero.json) in chunk 10; the SVG stays as the no-JS poster. -->
<script>
  let { kicker, kind, headline, dek } = $props();

  // Reveal the headline once fonts have loaded, so it never animates in a fallback font (chunk 5).
  // An attachment runs in the browser only, after the element exists: the SSR-safe place for DOM work.
  function revealWhenFontsReady() {
    (document.fonts ? document.fonts.ready : Promise.resolve())
      .then(() => document.documentElement.classList.add('is-ready'));
  }
</script>

<header class="header bleed" {@attach revealWhenFontsReady}>
  <div class="header-copy">
    <p class="kicker">{kicker} <span class="bar">|</span> {kind}</p>
    <h1 class="headline">{headline}</h1>
    <p class="subtitle">{dek}</p>
  </div>
  <div class="header-art">
    <!-- 1800×1200 landscape artboard. Key content in the middle 40% (x 540–1260). The circles are the squash test. -->
    <svg viewBox="0 0 1800 1200" aria-hidden="true" focusable="false">
      <g class="art-page">
        <rect x="250" y="260" width="520" height="680" transform="rotate(-6 510 600)" />
        <rect x="1030" y="230" width="520" height="680" transform="rotate(5 1290 570)" />
        <rect x="640" y="330" width="520" height="680" />
      </g>
      <g class="art-lines">
        <path d="M700 420h400M700 470h400M700 520h340M700 600h400M700 650h380M700 700h400M700 750h220M700 830h400M700 880h300" />
      </g>
      <g class="art-ring">
        <circle cx="1380" cy="900" r="120" />
        <circle cx="430" cy="300" r="90" />
      </g>
    </svg>
  </div>
</header>

<style>
  .header {
    position: relative;                 /* explicit: the copy layer is positioned against this box */
    height: var(--header-h);
    margin-top: var(--header-mt);
    overflow: hidden;                   /* crops the art at the sides */
  }
  .header-copy {
    position: absolute;
    top: var(--header-copy-top);
    left: 0;
    right: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 var(--header-pad);
    pointer-events: none;               /* clicks reach any interactive art underneath */
  }
  .kicker { margin: 0 0 var(--kicker-gap); font: 600 var(--kicker-size) / 1.4 var(--font-body); color: var(--soft); }
  .kicker .bar { color: var(--faint); font-weight: 400; }
  .headline {
    max-width: var(--headline-measure); /* sized in characters: 6ch ≈ one word per line on phones */
    margin: 2px auto 6px;
    font: var(--headline-weight) var(--headline-size) / var(--headline-leading) var(--font-display);
    letter-spacing: var(--headline-tracking);
    color: var(--ink);
  }
  .subtitle {
    max-width: var(--dek-measure);
    margin: 0 auto;
    font: var(--dek-size) / 1.4 var(--font-body);
    color: var(--soft);
    text-wrap: balance;
  }
  .header-art { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .header-art svg { height: 100%; width: auto; max-width: none; flex: none; }   /* height-driven scale */
  .art-page  { fill: var(--surface); stroke: var(--line); stroke-width: 3; }
  .art-lines { fill: none; stroke: var(--line); stroke-width: 10; stroke-linecap: round; }
  .art-ring  { fill: none; stroke: var(--line); stroke-width: 14; }

  @media screen and (min-width: 1024px) {
    .header-copy { top: 0; bottom: 0; justify-content: center; }
  }

  /* Intro motion (chunk 5): hidden start state only when JS runs (.js is set in app.html). */
  :global(.js) .headline {
    opacity: 0;
    transform: translateY(var(--intro-rise));
    transition: opacity var(--intro-dur) var(--ease-intro), transform var(--intro-dur) var(--ease-intro);
  }
  :global(.js) .subtitle {
    opacity: 0;
    transform: translateY(var(--intro-rise-dek));
    transition: opacity var(--intro-dur) var(--ease-intro) var(--intro-stagger),
                transform var(--intro-dur) var(--ease-intro) var(--intro-stagger);
  }
  :global(.is-ready) .headline, :global(.is-ready) .subtitle { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    :global(.js) .headline, :global(.js) .subtitle { opacity: 1; transform: none; transition: none; }
  }
</style>
