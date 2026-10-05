<!-- Header: section label and kicker, a short rule, headline and date, the lead photo, then the tools row, byline and
     promo (Figma header.essay-header). Measured: 100px top, 16px under the kicker, 72px rule 24px over the 57/60 headline
     (40/44 on phones), 16px to the date, 52px to the 945px lead photo (full width on phones), 12px to the tools row,
     32px to the promo and 32px below. No intro motion, like the reference.
     `seoTitle` and `dek` aren't drawn: +page.svelte uses them for <title> and the meta description. -->
<script>
  import { photo } from '$lib/media.js';
  import ArticleTools from './ArticleTools.svelte';
  import Byline from './Byline.svelte';
  let {
    section, kicker, headline, date, dateText, url, alt, width, height, caption, credit,
    listenTime, comments, author, bio, promoText, promoCta, promoHref
  } = $props();
</script>

<header class="essay-header">
  <p class="kicker">
    {#if section}<span class="section">{section}</span>{/if}
    <span>{kicker}</span>
  </p>
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
  <div class="meta">
    <ArticleTools {listenTime} {comments} />
    {#if author}<Byline {author} {bio} />{/if}
    {#if promoText}
      <aside class="promo">
        <p>{promoText}</p>
        <a href={promoHref}>
          {promoCta}
          <svg viewBox="0 0 9 9" aria-hidden="true"><path d="M1 8l7-7M2.5 1H8v5.5" /></svg>
        </a>
      </aside>
    {/if}
  </div>
</header>

<style>
  .essay-header { text-align: center; padding-block: var(--header-top) var(--size-spacing-4); }
  .kicker {
    margin: 0 0 var(--size-spacing-2);
    font: var(--type-kicker);
    letter-spacing: var(--type-kicker-ls);
    text-transform: var(--type-kicker-tt);
  }
  .kicker span { display: block; }
  .section { color: var(--color-content-accent); }
  .headline {
    width: var(--col);
    margin: 0 auto var(--size-spacing-2);
    font: var(--type-headline);
    text-wrap: balance;
  }
  .headline::before {
    content: '';
    display: block;
    width: 72px;
    height: 1px;
    margin: 0 auto var(--size-spacing-3);
    background: var(--color-stroke-tertiary);
  }
  .date { display: block; padding-top: 2px; font: var(--type-credit); line-height: normal; color: var(--color-content-primary-dim); }
  .lead { width: var(--col-large); margin: calc(var(--size-spacing-1-5) + var(--space-block)) auto 0; }
  .lead img { width: 100%; }
  figcaption { padding: 9px var(--gutter) 0 0; text-align: start; font: var(--type-caption); color: var(--color-content-secondary); }
  .credit { display: block; margin-top: var(--size-spacing-0-5); font: var(--type-credit); color: var(--color-content-secondary-dim); }
  .meta { width: var(--col); margin: var(--size-spacing-1-5) auto 0; text-align: start; }
  .promo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-top: var(--size-spacing-4);
    padding: var(--size-spacing-2);
    background: var(--color-background-secondary);
    text-align: center;
  }
  .promo p { margin: 0; font: var(--type-text-14); line-height: 1.5; color: var(--color-content-primary); }
  .promo a {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 19px;
    border: var(--size-border-1) solid var(--color-content-primary);
    border-radius: 32px;
    color: var(--color-content-primary);
    font: var(--type-tool-strong);
    text-decoration: none;
  }
  .promo a:hover, .promo a:focus-visible { background: var(--color-background-primary); }
  .promo svg { width: 9px; height: 9px; fill: none; stroke: currentColor; stroke-width: 1.2; }
  @media (max-width: 739.98px) {
    figcaption { padding-inline-start: var(--gutter); }
  }
</style>
