<!-- Root layout: the mock PLATFORM SHELL. Compiles to _app.<hash>/immutable/nodes/0.<hash>.js.
     On the real site, the story (built by the graphics desk) is dropped into a page the platform owns: masthead, share
     tools, recirculation, ads, footer. The story never edits the shell, and the shell never styles the story.
     S2 built a simple sticky bar. S4b replaces it with a replica measured from the shipped page: a transparent masthead
     that floats over the story and scrolls away, then share tools, related content, an ad slot and the footer.
     Each region is one component in src/lib/shell/; the platform's tokens live in shell.css, apart from the story's. -->
<script>
  import '../app.css';
  import '$lib/shell/shell.css';
  import { page } from '$app/state';
  import Masthead from '$lib/shell/Masthead.svelte';
  import ShareTools from '$lib/shell/ShareTools.svelte';
  import Recirc from '$lib/shell/Recirc.svelte';
  import AdSlot from '$lib/shell/AdSlot.svelte';
  import SiteFooter from '$lib/shell/SiteFooter.svelte';

  let { children } = $props();
  // The masthead floats over the story's header, so its wordmark must contrast with it. Only the light "opinion"
  // theme has a light header; diatour (the default) is dark, and so is the error page.
  const inverse = $derived(page.data.doc?.theme !== 'opinion');
</script>

<div id="app">
  <Masthead {inverse} />
  <main id="site-content">{@render children()}</main>
  <div id="standalone-footer">
    <ShareTools comments={0} />
    <Recirc />
    <AdSlot />
    <SiteFooter />
  </div>
</div>
