<!-- Text: one paragraph in the text column (prototype chunk 2).
     The width comes from --col = min(100% − 2 × gutter, 600px): no media query decides it. -->
<script>
  let { value } = $props();
</script>

<p class="g-text">{value}</p>

<style>
  .g-text {
    width: var(--col);
    margin: 0 auto var(--gap-para);
    font: var(--text-size) / var(--text-leading) var(--font-text);
  }
  @supports (text-wrap: pretty) {
    .g-text { text-wrap: pretty; }
  }
</style>
