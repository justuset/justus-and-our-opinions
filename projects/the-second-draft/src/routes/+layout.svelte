<!-- Root layout: the mock PLATFORM SHELL (NYT sandbox S2). Compiles to _app.<hash>/immutable/nodes/0.<hash>.js.
     On the real site, the story (built by the graphics desk) is dropped into a page the platform owns: masthead, ads,
     comments, recirculation, footer. The story never edits the shell, and the shell never styles the story.
     This mock gives the story the same constraint the real one has: a sticky masthead it must work under.
     Everything here is styled in this file; the story's own rules are scoped under .birdkit-body (app.css). -->
<script>
  import '../app.css';
  let { children } = $props();
</script>

<a class="skip-link" href="#site-content">Skip to the story</a>

<header class="platform-masthead">
  <a class="wordmark" href="./">Our Opinions</a>
  <span class="shell-note">Mock shell · demo</span>
</header>

<main id="site-content">
  {@render children()}
</main>

<footer class="platform-footer">
  <p>Mock platform footer. On a real page, comments, ads and recommended stories live here, owned by the platform, not the story.</p>
</footer>

<style>
  /* The masthead is exactly --masthead-h tall, so the sticky panels can pin right below it. Semi-transparent: on the
     real site, story art scrolls up under it. */
  .platform-masthead {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    block-size: var(--masthead-h);
    padding-inline: var(--gutter);
    background: color-mix(in srgb, var(--paper) 88%, transparent);
    backdrop-filter: blur(8px);
    border-block-end: 1px solid var(--line);
    font: 600 var(--meta-size) / 1 var(--font-body);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  /* One line each, always: the bar is a fixed height. The wordmark never shrinks; the note gives way with an ellipsis. */
  .wordmark { flex: none; color: var(--ink); text-decoration: none; white-space: nowrap; }
  .shell-note {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--faint);
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: none;
  }

  .platform-footer {
    margin-block-start: 80px;
    padding: 24px var(--gutter) 48px;
    border-block-start: 1px solid var(--line);
    color: var(--faint);
    font: var(--meta-size) / 1.4 var(--font-body);
  }
  .platform-footer p { max-inline-size: var(--w-body); margin: 0 auto; }

  /* Hidden until a keyboard user tabs to it: jumps past the masthead to the story. */
  .skip-link {
    position: absolute;
    inset-inline-start: 8px;
    inset-block-start: -100px;
    z-index: 20;
    padding: 8px 12px;
    background: var(--ink);
    color: var(--paper);
    font: 600 var(--meta-size) / 1 var(--font-body);
  }
  .skip-link:focus { inset-block-start: 8px; }
</style>
