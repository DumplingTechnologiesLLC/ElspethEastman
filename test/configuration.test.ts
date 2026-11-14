import { it, expect, vi } from 'vitest';
import { deploymentArtifacts, revision } from '../tooling/deploymentArtifacts';
import viteConfig from '../vite.config';
import vitestConfig from '../vitest.config';
import storybook from '../.storybook/main';
import preview from '../.storybook/preview';
vi.mock('../e2e/environment.ts', () => ({
  baseURL: 'http://127.0.0.1:8765',
  environment: {},
  python: 'python3',
}));
it('pins production build paths, unit coverage, and isolated Storybook stories', async () => {
  expect(viteConfig.root).toBe('frontend');
  expect(vitestConfig.test?.coverage?.thresholds).toMatchObject({
    lines: 100,
    branches: 100,
    functions: 100,
    statements: 100,
    perFile: true,
  });
  expect(storybook.stories).toContain('../frontend/src/**/*.stories.tsx');
  expect(preview.parameters?.layout).toBe('padded');
  const config = await storybook.viteFinal!(
    { root: 'old' } as never,
    {} as never,
  );
  expect(config.root).toContain('/frontend');
});
it('chooses and validates a full deployment revision', () => {
  const read = vi.fn(() => 'a'.repeat(40));
  expect(revision({ SOURCE_VERSION: 'b'.repeat(40) }, read)).toBe(
    'b'.repeat(40),
  );
  expect(revision({ GITHUB_SHA: 'c'.repeat(40) }, read)).toBe('c'.repeat(40));
  expect(revision({}, read)).toBe('a'.repeat(40));
  expect(() => revision({ SOURCE_VERSION: 'short' }, read)).toThrow(
    'full build commit SHA',
  );
});
it('emits Django-compatible deployment manifests and rejects a build with no entry', () => {
  const plugin = deploymentArtifacts();
  const generate = plugin.generateBundle as Function;
  const emitFile = vi.fn();
  const original = process.env.SOURCE_VERSION;
  process.env.SOURCE_VERSION = 'a'.repeat(40);
  try {
    expect(() => generate.call({ emitFile }, {}, {})).toThrow(
      'Missing client entry',
    );
    generate.call(
      { emitFile },
      {},
      {
        style: { type: 'asset' },
        entry: { type: 'chunk', isEntry: true, fileName: 'static/js/app.js' },
      },
    );
    delete process.env.SOURCE_VERSION;
    delete process.env.GITHUB_SHA;
    generate.call(
      { emitFile },
      {},
      { entry: { type: 'chunk', isEntry: true, fileName: 'static/js/app.js' } },
    );
    expect(emitFile).toHaveBeenCalledWith({
      type: 'asset',
      fileName: 'asset-manifest.json',
      source: JSON.stringify({ files: { 'main.js': '/static/js/app.js' } }),
    });
  } finally {
    if (original === undefined) delete process.env.SOURCE_VERSION;
    else process.env.SOURCE_VERSION = original;
  }
});
it('loads every CSF story without mounting a wired component or requiring services', () => {
  const stories = import.meta.glob('../frontend/src/**/*.stories.tsx', {
    eager: true,
  });
  expect(Object.keys(stories).length).toBeGreaterThanOrEqual(15);
  for (const story of Object.values(stories)) {
    expect(
      (story as { default: { component: unknown } }).default.component,
    ).toBeTypeOf('function');
  }
});
it('keeps required browser projects, snapshot controls and local server boundaries', async () => {
  const original = process.platform;
  try {
    for (const [platform, ci] of [
      ['darwin', ''],
      ['linux', 'true'],
    ] as const) {
      Object.defineProperty(process, 'platform', { value: platform });
      vi.stubEnv('CI', ci);
      vi.resetModules();
      const { default: config } = await import('../playwright.config');
      expect(config.retries).toBe(0);
      expect(config.maxFailures).toBe(ci ? 1 : 0);
      expect(
        config.projects!.some((project) => project.name === 'visual'),
      ).toBe(platform === 'linux');
      expect(
        config.projects!.some((project) => project.name === 'storybook'),
      ).toBe(true);
      expect(config.webServer).toHaveLength(2);
    }
  } finally {
    Object.defineProperty(process, 'platform', { value: original });
    vi.unstubAllEnvs();
  }
});
it('rewrites image metadata and preload URLs to the emitted asset', () => {
  const plugin = deploymentArtifacts();
  const hook = plugin.transformIndexHtml as { handler: Function };
  const html = '<meta content="/static/media/hero2.84ac3292.webp">';
  expect(hook.handler(html, {})).toBe(html);
  expect(() =>
    hook.handler(html, {
      bundle: { entry: { type: 'chunk', isEntry: false } },
    }),
  ).toThrow('Missing hero image');
  expect(
    hook.handler(html, {
      bundle: {
        entry: { type: 'chunk' },
        other: { type: 'asset', names: ['font.woff'] },
        hero: {
          type: 'asset',
          names: ['hero2.webp'],
          fileName: 'static/media/hero2-hash.webp',
        },
      },
    }),
  ).toBe('<meta content="/static/media/hero2-hash.webp">');
});
