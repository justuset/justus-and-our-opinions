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
    font: var(--meta-size) / 1.4 var(--font-body);
    color: var(--faint);
  }
  p { margin: 0; }
</style>
