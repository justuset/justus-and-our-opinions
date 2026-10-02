<!-- Bio: the contributor note at the end of the essay, in the text column, smaller sans type. -->
<script>
  import { inlineHtml } from '$lib/inline-html.js';
  let { text, note } = $props();
</script>

<footer class="bio">
  <p>{@html inlineHtml(text)}</p>
  {#if note}<p><em>{@html inlineHtml(note)}</em></p>{/if}
</footer>

<style>
  .bio { width: var(--col); margin: var(--gap-photo) auto; padding-top: 20px; border-top: 1px solid var(--line); }
  p { margin: 0 0 12px; font: var(--bio-size) / var(--bio-leading) var(--font-body); color: var(--soft); }
</style>
