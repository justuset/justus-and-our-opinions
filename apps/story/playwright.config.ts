// End-to-end tests for /photo-essay at the three device tiers. `npm run test:e2e` builds, starts the server, runs.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  webServer: {
    command: 'npm run build && PORT=4174 npm start',
    port: 4174,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  use: {
    baseURL: 'http://localhost:4174',
    // Sandboxes can pin a Chromium build; PW_CHROMIUM points at it. Unset = Playwright's own browser.
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }, // smartphone < 740
    { name: 'tablet', use: { viewport: { width: 800, height: 1024 } } }, // tablet 740–1149
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } }, // desktop ≥ 1150
  ],
});
