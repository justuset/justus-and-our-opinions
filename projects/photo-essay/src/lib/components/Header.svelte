<!-- Header: kicker, headline, date and the lead photo, centered (measured: 57/60 headline in the 600px column, 40/44
     on phones; 16px caps kicker; lead photo 945px wide, full width on phones). No intro motion, like the reference.
     `seoTitle` and `dek` aren't drawn: +page.svelte uses them for <title> and the meta description. -->
<script>
  import { photo } from '$lib/media.js';
  let { kicker, headline, date, dateText, url, alt, width, height, caption, credit } = $props();
</script>

<header class="essay-header">
  <p class="kicker">{kicker}</p>
  <h1 class="headline">{headline}</h1>
  <time class="date" datetime={date}>{dateText}</time>
  {#if url}
    <figure class="lead">
      <img {...photo(url, width)} sizes="(min-width: 945px) 945px, 100vw" {alt} {width} {height} fetchpriority="high" />
      {#if caption || credit}
        <figcaption>
          {#if caption}{caption}{/if}
          {#if credit}<span class="credit"><span class="visually-hidden">Credit:</span> {credit}</span>{/if}
        </figcaption>
      {/if}
    </figure>
  {/if}
</header>

<style>
  .essay-header { text-align: center; padding-top: var(--header-top); }
  .kicker {
    margin: 0 0 16px;
    font: 600 var(--kicker-size) / 1.2 var(--font-display);
    letter-spacing: var(--kicker-tracking);
    text-transform: uppercase;
  }
  .headline {
    width: var(--col);
    margin: 0 auto 18px;
    font: 550 var(--headline-size) / var(--headline-leading) var(--font-display);
    text-wrap: balance;
  }
  .date { display: block; margin-bottom: 28px; font-size: var(--credit-size); color: var(--soft); }
  .lead { width: var(--col-large); margin: 0 auto var(--gap-photo); }
  .lead img { width: 100%; }
  figcaption { padding: 9px var(--gutter) 0 0; text-align: start; font: var(--caption-size) / 1.4 var(--font-text); color: var(--soft); }
  .credit { display: block; margin-top: 4px; font-size: var(--credit-size); color: var(--faint); }
  @media (max-width: 739.98px) {
    figcaption { padding-inline-start: var(--gutter); }
  }
</style>
