<!-- Byline: author and a machine-readable date (prototype chunks 1 and 2). -->
<script>
  let { author, date, dateText } = $props();
</script>

<p class="byline">By {author} · <time datetime={date}>{dateText}</time></p>

<style>
  .byline {
    width: var(--col);
    margin-inline: auto;
    margin-block: var(--gap-byline);
    font: 600 var(--meta-size) / 1.4 var(--font-body);
    color: var(--soft);
  }
  @media screen and (min-width: 740px) and (orientation: landscape) {
    .byline { margin-bottom: var(--gap-byline-desktop); }
  }
</style>
