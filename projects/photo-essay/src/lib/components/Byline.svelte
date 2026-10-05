<!-- Byline: author and a one-line bio between two rules (Figma header.essay-header, "Frame 2"). Measured: 30px above
     the top rule, 102px rule to rule (min), 15/21 bold name, 14/20 bio. -->
<script>
  import { inlineHtml } from '$kit/inline-html.js';
  let { author, bio } = $props();
</script>

<div class="byline">
  <p class="author">By {author}</p>
  {#if bio}<p class="bio">{@html inlineHtml(bio)}</p>{/if}
</div>

<style>
  .byline {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 102px;           /* rule to rule, so a one-line bio doesn't shrink the box */
    margin-top: 30px;
    padding-block: 18px 19px;
    border-block: var(--rule-horizontal-tertiary);
  }
  p { margin: 0; color: var(--color-content-primary); }
  .author { font: var(--type-byline); }
  .bio { margin-top: 2px; font: var(--type-text-14); line-height: 1.4286; }
</style>
