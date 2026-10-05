<!-- ArticleTools: the listen button and share row under the lead photo (Figma header.essay-header, "Frame 2").
     On the shipped page this row is the platform's; here it's a layout replica and the buttons do nothing, like the
     shell's ShareTools. Measured: 1px rule, 21px to 32/34px controls, pills 6px apart. Icons are drawn here, not copied. -->
<script>
  let { listenTime, comments = 0 } = $props();
</script>

<div class="tools" role="toolbar" aria-label="Listen, share, save and comments">
  {#if listenTime}
    <button type="button" class="listen">
      <svg class="play" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path d="M13 10.5v11l9-5.5z" fill="currentColor" />
      </svg>
      Listen · {listenTime} min
    </button>
  {/if}
  <ul class="share">
    <li>
      <button type="button" class="pill">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 8h14v3H3zM4.5 11v7h11v-7M10 8v10M10 8C8 4 5 4 6 6.5S10 8 10 8zM10 8c2-4 5-4 4-1.5S10 8 10 8z" />
        </svg>
        Share full article
      </button>
    </li>
    <li>
      <button type="button" class="pill icon" aria-label="More sharing options">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4l5 5-5 5M17 9h-6c-4 0-7 2-8 7" /></svg>
      </button>
    </li>
    <li>
      <button type="button" class="pill icon" aria-label="Save article for reading later">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h10v14l-5-4-5 4z" /></svg>
      </button>
    </li>
    <li>
      <button type="button" class="pill" aria-label="Read {comments} comments">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4h14v10H8l-4 3v-3H3z" /></svg>
        {comments}
      </button>
    </li>
  </ul>
</div>

<style>
  .tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--size-spacing-1-5);
    padding-top: 21px;
    border-top: var(--rule-horizontal-tertiary);
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 0;
    background: none;
    color: var(--color-content-primary);
    font: var(--type-tool);
    cursor: pointer;
  }
  .listen { gap: 10px; padding: 0; }
  .play { width: 32px; height: 32px; }
  .share { display: flex; gap: 6px; margin: 0; padding: 0; list-style: none; }
  .pill {
    height: 34px;
    padding: 0 10px;
    border: var(--size-border-1) solid var(--color-stroke-tertiary);
    border-radius: 50px;
    background: var(--color-background-primary);
  }
  .pill.icon { width: 34px; padding: 0; justify-content: center; }
  .pill:hover, .pill:focus-visible { background: var(--color-background-secondary); }
  .pill svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linejoin: round; }
</style>
