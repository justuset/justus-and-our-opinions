<!-- The story page. Compiles to nodes/2.<hash>.js; every component's scoped CSS merges into assets/2.<hash>.css.
     All it does is hand the doc's `body` to the renderer: the doc decides what's on the page, in what order. -->
<script>
  import Blocks from '$lib/Blocks.svelte';

  let { data } = $props();
  // The page title and description come from the Header block's props
  const header = $derived(data.doc.body.find((b) => b.value?.component === 'Header')?.value ?? {});
</script>

<svelte:head>
  <title>{header.headline} · Our Opinions (demo)</title>
  <meta name="description" content={header.dek} />
</svelte:head>

<article class="story">
  <Blocks body={data.doc.body} />
</article>
