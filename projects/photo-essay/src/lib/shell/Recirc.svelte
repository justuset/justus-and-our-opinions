<!-- Recirc: the platform's "related content" area under the story (NYT sandbox S4b). Grey placeholder blocks only,
     no real headlines. Measured: full width with a 45px top margin on phones; from the tablet tier a 1200px-max row with
     20px 3% padding, a main grid and a right rail. -->
<section class="recirc" data-testid="recirculation" aria-labelledby="recirc-title">
  <h2 id="recirc-title" class="visually-hidden">Related content (placeholder)</h2>
  <div class="recirc-main">
    <div class="rule"><span class="bar"></span></div>
    <ul class="cards">
      {#each { length: 6 } as _, i (i)}
        <li class="card"><div class="thumb"></div><div class="line"></div><div class="line short"></div></li>
      {/each}
    </ul>
  </div>
  <aside class="recirc-rail" aria-label="More placeholders">
    <div class="rule"><span class="bar"></span></div>
    {#each { length: 6 } as _, i (i)}<div class="line rail-line"></div>{/each}
  </aside>
</section>

<style>
  .recirc { margin-top: 45px; padding: 0 var(--shell-gutter); background: var(--shell-bg); }
  .rule { margin-bottom: 16px; padding-top: 8px; border-top: 2px solid var(--shell-rule-strong); }
  .bar { display: block; width: 175px; height: 20px; background: var(--shell-bg-secondary); }
  .cards { display: grid; grid-template-columns: 1fr; gap: 20px; margin: 0 0 32px; padding: 0; list-style: none; }
  .thumb { aspect-ratio: 1; margin-bottom: 6px; background: var(--shell-bg-secondary); }
  .line { height: 14px; margin-bottom: 6px; background: var(--shell-bg-secondary); }
  .line.short { width: 60%; }
  .recirc-rail { margin-bottom: 32px; }
  .rail-line { height: 46px; margin-bottom: 15px; }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (min-width: 740px) {
    .recirc { display: flex; gap: 30px; max-width: var(--shell-page-max); margin: 45px auto 0; padding: 20px 3% 0; }
    .recirc-main { width: 70%; }
    .recirc-rail { flex: 1; }
    .rule { border-top-width: 1px; }
    .cards { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1150px) {
    .recirc-main { width: 80%; }
    .cards { grid-template-columns: repeat(3, 1fr); }
  }
</style>
