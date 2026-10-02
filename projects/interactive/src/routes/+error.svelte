<!-- Error page. Compiles to nodes/1.<hash>.js. Shown if a route fails to load. It renders inside the layout's <main>,
     on the platform's page, so it uses the shell's colors, not a story theme. -->
<script>
  import { page } from '$app/state';
</script>

<div class="error">
  <h1>{page.status}</h1>
  <p>{page.error?.message ?? 'Something went wrong.'}</p>
</div>

<style>
  .error { width: var(--col); margin: 20vh auto; color: var(--shell-ink); font-family: var(--shell-font-label); }
  h1 { font: 550 var(--headline-size) / 1 var(--shell-font-wordmark); margin: 0 0 12px; }
  p { color: var(--shell-muted); }
</style>
