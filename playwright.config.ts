import { defineConfig, devices } from '@playwright/test'

/**
 * The survey is answered on phones, so the phone viewport is a first-class run
 * rather than an afterthought. Both projects run the same specs.
 *
 * Specs that need a database skip themselves when SUPABASE_URL is absent, so a
 * developer without credentials still gets the UI suite. CI supplies the
 * staging credentials and runs everything.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // one survey row at a time: these specs share a cookie jar per worker
  workers: 1,
  // These drive a real survey against a real database, so a test can legitimately
  // take longer than the 30s default: walking to a later section is several
  // round trips. The previous timeout masked a hang as a plain timeout.
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000',
    // Use a browser that is already on the machine when one is provided.
    // PLAYWRIGHT_CHROMIUM_PATH lets a container supply its own build instead of
    // downloading one per run, which is what our dev container does.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
