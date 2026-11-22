import { defineConfig, devices } from '@playwright/test';
import { baseURL, environment } from './e2e/environment.ts';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  maxFailures: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 30_000,
  globalTimeout: 15 * 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 100,
    },
  },
  updateSnapshots: 'none',
  snapshotPathTemplate: '{testDir}/snapshots/{testFilePath}/{arg}{ext}',
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
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
    {
      name: 'storybook',
      testMatch: '**/storybook.spec.ts',
      use: { browserName: 'chromium', baseURL: 'http://127.0.0.1:6006' },
    },
    {
      name: 'api',
      testMatch: '**/api.spec.ts',
      use: { browserName: 'chromium' },
    },
    ...(process.platform === 'linux'
      ? [
          {
            name: 'visual',
            testMatch: '**/visual.spec.ts',
            use: { browserName: 'chromium' as const, deviceScaleFactor: 1 },
          },
        ]
      : []),
    ...(['chromium', 'firefox', 'webkit'] as const).map((browserName) => ({
      name: browserName,
      testIgnore: [
        '**/visual.spec.ts',
        '**/api.spec.ts',
        '**/storybook.spec.ts',
      ],
      use: { browserName },
    })),
    ...(['chromium', 'webkit'] as const).map((browserName) => ({
      name: `mobile-${browserName}`,
      testMatch: '**/{public,contact}.spec.ts',
      use: {
        ...devices['iPhone 13'],
        browserName,
        defaultBrowserType: browserName,
      },
    })),
  ],
  webServer: [
    {
      command: 'node e2e/start-server.ts',
      url: `${baseURL}/api/skills/`,
      env: environment,
      reuseExistingServer: false,
      timeout: 90_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    },
    {
      command:
        'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 6006 --strictPort --outDir ../storybook-static',
      url: 'http://127.0.0.1:6006',
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
