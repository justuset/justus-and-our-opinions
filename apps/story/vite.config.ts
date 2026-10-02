import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  // The story app owns :5173; the graphics desk owns :5174. strictPort fails loudly instead of drifting to another port.
  server: { port: 5173, strictPort: true },
  resolve: { tsconfigPaths: true },
});
