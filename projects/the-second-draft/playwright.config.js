// End-to-end tests for the mock platform shell (NYT sandbox S4b), at the three NYT device tiers.
// Run with `npm run test:e2e`. Unit tests stay on `npm test` (node --test).
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  use: { baseURL: 'http://localhost:4173' },
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }, // smartphone < 740
    { name: 'tablet', use: { viewport: { width: 800, height: 1024 } } }, // tablet 740–1149
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } }, // desktop ≥ 1150
  ],
});
