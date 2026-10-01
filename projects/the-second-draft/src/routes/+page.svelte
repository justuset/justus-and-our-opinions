<!-- The story page. Compiles to nodes/2.<hash>.js; every component's scoped CSS merges into assets/2.<hash>.css.
     It is a loop: story.json is an ordered list of blocks, and each block type maps to one component.
     Adding a new kind of block = one new component + one line in BLOCKS. -->
<script>
  import Header from '$lib/components/Header.svelte';
  import Byline from '$lib/components/Byline.svelte';
  import Text from '$lib/components/Text.svelte';
  import TwoUp from '$lib/components/TwoUp.svelte';
  import Diagram from '$lib/components/Diagram.svelte';
  import SlidesScrolly from '$lib/components/SlidesScrolly.svelte';
  import CaptionScrolly from '$lib/components/CaptionScrolly.svelte';
  import PaintingsScrolly from '$lib/components/PaintingsScrolly.svelte';
  import ScrubLottie from '$lib/components/ScrubLottie.svelte';
  import Credits from '$lib/components/Credits.svelte';

  let { data } = $props();
  const story = $derived(data.story);

  // block.type (and block.scene for scroll sections) → component
  const BLOCKS = {
    text: Text,
    'two-up': TwoUp,
    diagram: Diagram,
    lottie: ScrubLottie,
    'scrolly:slides': SlidesScrolly,
    'scrolly:captions': CaptionScrolly,
    'scrolly:paintings': PaintingsScrolly
  };
  const componentFor = (block) => BLOCKS[block.type === 'scrolly' ? `scrolly:${block.scene}` : block.type];
</script>

<svelte:head>
  <title>{story.header.headline} · Our Opinions (demo)</title>
  <meta name="description" content={story.header.dek} />
</svelte:head>

<article class="story">
  <Header {...story.header} />
  <Byline {...story.byline} />

  {#each story.blocks as block, i (i)}
    {@const Block = componentFor(block)}
    {#if Block}
      <Block {...block} />
    {/if}
  {/each}

  <Credits text={story.credits} />
</article>
