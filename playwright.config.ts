import { defineConfig } from "@playwright/test";

/**
 * Kullo e2e suite.
 * Requires a production build (`npm run build`); the config starts its own
 * server on port 3010 and reuses one that is already up.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3010",
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
    trace: "off",
    video: "off",
    screenshot: "off",
  },
  webServer: {
    command: "npx next start -p 3010",
    url: "http://localhost:3010/api/health",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
