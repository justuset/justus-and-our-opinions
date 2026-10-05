<!-- Masthead: the platform's top bar, as on the shipped interactive page (NYT sandbox S4b). Measured:
     a transparent, absolutely positioned container 6px from the top, so the bar floats over the story's header and
     scrolls away with the page. It is NOT sticky, which is why story panels pin to the top of the screen (--masthead-h: 0).
     The section is 47px tall on phones (padding 8 15 3) and 42px from the tablet tier (padding 4 15 2, nudged up 7px).
     `inverse` gives a light wordmark for stories with a dark header (diatour). Placeholder wordmark, no logo.
     Colors and fonts are diatour (shell.css); only the layout is measured. -->
<script>
  let { name = 'Our Opinions', inverse = false } = $props();
</script>

<div class="masthead-container" data-testid="masthead-container">
  <header class="masthead-wrapper">
    <section class="masthead-section" aria-label="Site masthead">
      <a class="skip-link" href="#site-content">Skip to content</a>
      <a class="wordmark" class:inverse href="./">{name}</a>
    </section>
  </header>
</div>

<style>
  .masthead-container { position: absolute; top: 6px; left: 0; right: 0; height: 0; z-index: 1000; background: transparent; }
  .masthead-wrapper { position: absolute; top: 0; left: 0; right: 0; }
  .masthead-section {
    position: relative;
    top: 0;
    box-sizing: border-box;
    height: 47px;
    padding: 8px 15px 3px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media (min-width: 740px) {
    .masthead-section { top: -7px; height: 42px; padding: 4px 15px 2px; }
  }
  .wordmark {
    font: 550 1.375rem / 1 var(--shell-font-wordmark); /* diatour's display weight */
    color: var(--shell-wordmark);
    text-decoration: none;
    white-space: nowrap;
  }
  .wordmark.inverse { color: var(--shell-wordmark-inverse); }
  /* Off screen until a keyboard user tabs to it. */
  .skip-link {
    position: absolute;
    left: -9999px;
    padding: 11px 12px 8px;
    border-radius: 3px;
    background: var(--shell-bg);
    color: var(--shell-ink);
    font: 700 0.6875rem / 1 var(--shell-font-label);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .skip-link:focus { left: 15px; }
</style>
