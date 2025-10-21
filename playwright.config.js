import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  navigationTimeout: 60000, // Increase page load timeout to 60s
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Use 1 worker to avoid conflicts with website navigation */
  workers: 1,

  /* Reporter to use */
  reporter: 'html',

  /* Shared settings for all projects */
  use: {
    baseURL: 'https://next-staging.almosafer.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge', // Explicitly use Microsoft Edge
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'https://next-staging.almosafer.com/mweb',
      },
    },
  ],

  /* Global setup to block analytics / GTM / trackers before any test */
  globalSetup: './global-setup.js',

  /* Optional: local dev server before tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
