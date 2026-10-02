import type { Config } from '@react-router/dev/config';

export default {
  // Server rendering, like the Times's article pages: Node renders the full HTML for every request, and React
  // hydrates it in the browser. The page is readable before (and without) any JavaScript.
  ssr: true,
} satisfies Config;
