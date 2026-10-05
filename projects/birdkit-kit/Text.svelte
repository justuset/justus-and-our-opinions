<!-- Text: one paragraph in the text column (prototype chunk 2; inline HTML since NYT sandbox chunk S1).
     The width comes from --col = min(100% − 2 × gutter, 600px): no media query decides it.
     Like the shipped NYT payload, a paragraph may carry a little inline HTML (<a href>, <em>, <strong>). It goes through
     an allow-list (./inline-html.js) first, so anything else in the string is shown as text, never run. -->
<script>
  import { inlineHtml } from './inline-html.js';
  let { value } = $props();
</script>

<p class="g-text">{@html inlineHtml(value)}</p>

<style>
  .g-text {
    width: var(--col);
    margin: 0 auto var(--gap-para);
    font: var(--type-body);
  }
  @supports (text-wrap: pretty) {
    .g-text { text-wrap: pretty; }
  }
</style>
