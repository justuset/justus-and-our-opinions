<!-- Blocks: the renderer (NYT sandbox alignment, chunk S1).
     Walks the doc's `body` in order: a text block becomes a paragraph, a svelte block becomes the registered component,
     with the block's flat props spread onto it. This is the whole "page template": the doc decides what appears.
     A block the renderer can't draw shows a visible placeholder in dev. In a production build, +page.js stops the
     build instead, so a typo in the doc can never ship as a silently missing section. -->
<script>
  import { dev } from '$app/environment';
  import Text from './components/Text.svelte';
  import { registry } from './blocks.js';

  let { body = [] } = $props();
</script>

{#each body as block, i (i)}
  {#if block.type === 'text'}
    <Text value={block.value} />
  {:else if block.type === 'svelte' && registry[block.value?.component]}
    {@const Component = registry[block.value.component]}
    <Component {...block.value} />
  {:else if dev}
    <p class="missing" role="alert">
      {block.type === 'svelte' ? `Missing component: ${block.value?.component}` : `Unknown block type: ${block.type}`}
    </p>
  {/if}
{/each}

<style>
  .missing {
    width: var(--col);
    margin: 0 auto var(--gap-para);
    padding: 12px 16px;
    border: 2px dashed var(--ink);
    font: 600 var(--meta-size) / 1.4 var(--font-body);
  }
</style>
