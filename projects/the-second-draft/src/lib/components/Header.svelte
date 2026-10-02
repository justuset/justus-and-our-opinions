<!-- Header: headline, dek and the art stage (prototype chunks 4, 5 and 6). ✅ Ported.
     A fixed-height box with two absolutely positioned layers: art behind, copy on top.
     The art scales by height, so it crops at the sides and never squashes.
     The art comes as twins (chunk 6): a portrait artboard for phones and a landscape one for desktop. Only one displays
     at a time (the .mobile-only / .desktop-only utilities at the end of app.css).
     Chunk 11: each twin also gets an intro Lottie that plays once (big_assets/videos/hero/hero-*.json, made by
     scripts/make-hero-lottie.js). Its LAST frame is this SVG, pixel for pixel, so the SVG is the poster: it's what
     no-JS and reduced-motion readers see, and what everyone sees once the animation ends.
     The poster hides only when the animation has drawn its first frame; if the file fails, the poster just stays. -->
<script>
  import { playOnce } from '$lib/lottie.js';
  import { asset } from '$lib/assets.js';
  import { prefersReducedMotion } from 'svelte/motion';

  // url / urlMobile: the hero Lottie twins (flat props from content/doc.json, like the shipped page's Header)
  let { kicker, kind, headline, dek, url, urlMobile } = $props();

  // Which twin's animation is on screen (poster hidden). Keys: 'desktop', 'mobile'.
  let playing = $state({});

  /** Attachment factory: play one twin's intro. A display: none twin never intersects, so it never downloads. */
  const hero = (twin) => (artEl) => {
    const path = twin === 'desktop' ? url : urlMobile;
    if (!path || prefersReducedMotion.current) return; // reduced motion: the poster is the art
    let anim;
    let cancelled = false;
    const seen = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      seen.disconnect();
      playOnce(artEl.querySelector('.hero-anim'), asset(path))
        .then((a) => {
          anim = a;
          if (cancelled) a.destroy();
          else playing[twin] = true;
        })
        .catch(() => {}); // the poster stays
    });
    seen.observe(artEl);
    return () => {
      cancelled = true;
      seen.disconnect();
      anim?.destroy();
    };
  };

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
  <div class="header-art mobile-only" class:playing={playing.mobile} {@attach hero('mobile')}>
    <div class="hero-anim" aria-hidden="true" style:aspect-ratio="800 / 1200"></div>
    <!-- 800×1200 portrait artboard. The copy covers about the top 55% on phones, so the art sits below it. -->
    <svg viewBox="0 0 800 1200" aria-hidden="true" focusable="false">
      <g class="art-page">
        <rect x="120" y="760" width="460" height="560" transform="rotate(-7 350 1040)" />
        <rect x="240" y="720" width="460" height="560" />
      </g>
      <g class="art-lines">
        <path d="M300 820h340M300 870h340M300 920h280M300 1000h340M300 1050h300" />
      </g>
      <g class="art-ring">
        <circle cx="660" cy="1080" r="90" />
        <circle cx="110" cy="130" r="60" />
      </g>
    </svg>
  </div>
  <div class="header-art desktop-only" class:playing={playing.desktop} {@attach hero('desktop')}>
    <div class="hero-anim" aria-hidden="true" style:aspect-ratio="1800 / 1200"></div>
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
  /* The animation sits exactly over the poster: same height, same aspect ratio, centered, so the two line up. */
  .hero-anim { position: absolute; top: 0; left: 50%; height: 100%; transform: translateX(-50%); }
  /* Hide the poster once the animation is drawn. Scoped CSS only matches this component's own <svg>, never the one
     Lottie injects at runtime, so this can't hide the animation. */
  .playing > svg { visibility: hidden; }
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
