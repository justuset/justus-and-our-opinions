<!-- Error page. Compiles to nodes/1.<hash>.js. Shown if a route fails to load. -->
<script>
  import { page } from '$app/state';
</script>

<main class="error">
  <h1>{page.status}</h1>
  <p>{page.error?.message ?? 'Something went wrong.'}</p>
</main>

<style>
  .error { width: var(--col); margin: 20vh auto; font-family: var(--font-body); }
  h1 { font: var(--headline-weight) var(--headline-size) / 1 var(--font-display); margin: 0 0 12px; }
  p { color: var(--soft); }
</style>
