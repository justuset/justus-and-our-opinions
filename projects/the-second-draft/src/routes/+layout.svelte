<!-- Root layout. Compiles to _app.<hash>/immutable/nodes/0.<hash>.js.
     Imports the global tokens once; every page renders inside it. -->
<script>
  import '../app.css';
  let { children } = $props();
</script>

{@render children()}
