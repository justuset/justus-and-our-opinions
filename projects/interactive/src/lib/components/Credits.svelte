<!-- Credits: the page's footer line, in the text column. -->
<script>
  let { text } = $props();
</script>

<footer class="credits">
  <p>{text}</p>
</footer>

<style>
  .credits {
    width: var(--col);
    margin-inline: auto;
    margin-block: var(--gap-credits);
    font: var(--type-text-14);
    color: var(--color-content-secondary-dim);
  }
  p { margin: 0; }
</style>
