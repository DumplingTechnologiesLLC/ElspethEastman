import { defineConfig, mergeConfig } from 'vitest/config';
import vite from './vite.config.ts';
export default mergeConfig(
  vite,
  defineConfig({
    root: '.',
    test: {
      environment: 'jsdom',
      include: [
        'frontend/src/**/__test__/*.test.{ts,tsx}',
        'test/**/*.test.{ts,tsx}',
      ],
      setupFiles: ['./test/setup.ts'],
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        include: [
          'frontend/src/**/*.{ts,tsx}',
          'tooling/**/*.ts',
          '*.config.ts',
          '.storybook/**/*.ts',
        ],
        exclude: [
          '**/*.wired.tsx',
          '**/*.d.ts',
          '**/__test__/**',
          '**/*.test.{ts,tsx}',
        ],
        reporter: ['text', 'html', 'json', 'json-summary'],
        thresholds: {
          perFile: true,
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 100,
        },
      },
    },
  }),
);
