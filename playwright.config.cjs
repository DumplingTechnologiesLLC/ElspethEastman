const { defineConfig, devices } = require('@playwright/test');
const { baseURL, environment } = require('./e2e/environment.cjs');

module.exports = defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.cjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  maxFailures: process.env.CI ? 1 : undefined,
  forbidOnly: Boolean(process.env.CI),
  timeout: 30_000,
  globalTimeout: 15 * 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixels: 100 },
  },
  updateSnapshots: 'none',
  snapshotPathTemplate: '{testDir}/snapshots/{testFilePath}/{arg}{ext}',
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testMatch: '**/api.spec.cjs', use: { browserName: 'chromium' } },
    ...['chromium', 'firefox', 'webkit'].map(browserName => ({
      name: browserName,
      testIgnore: ['**/visual.spec.cjs', '**/api.spec.cjs'],
      use: { browserName },
    })),
    ...['chromium', 'webkit'].map(browserName => ({
      name: `mobile-${browserName}`,
      testMatch: '**/{public,contact}.spec.cjs',
      use: { ...devices['iPhone 13'], browserName, defaultBrowserType: browserName },
    })),
    ...(process.platform === 'linux' ? [{
      name: 'visual',
      testMatch: '**/visual.spec.cjs',
      use: { browserName: 'chromium', deviceScaleFactor: 1 },
    }] : []),
  ],
  webServer: {
    command: 'node e2e/start-server.cjs',
    url: `${baseURL}/api/skills/`,
    env: environment,
    reuseExistingServer: false,
    timeout: 90_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
  },
});
