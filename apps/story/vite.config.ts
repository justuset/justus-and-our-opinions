import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  // The story app owns :5173; the graphics desk owns :5174. strictPort fails loudly instead of drifting to another port.
  server: { port: 5173, strictPort: true },
  resolve: { tsconfigPaths: true },
  // light-dark() must reach the browser as written. With an older CSS target, Lightning CSS rewrites it as a variable
  // switch set once on :root, so every --color-* role resolves dark there and a story's color-scheme can't flip it.
  // These are the first versions with light-dark() (2024).
  build: { cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5'] },
});
