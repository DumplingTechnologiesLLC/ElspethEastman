import type { Plugin } from 'vite';
import { execFileSync } from 'node:child_process';
export function revision(
  environment: NodeJS.ProcessEnv,
  readCommit: () => string,
): string {
  const commit =
    environment.SOURCE_VERSION || environment.GITHUB_SHA || readCommit();
  if (!/^[a-f0-9]{40}$/.test(commit))
    throw new Error('A full build commit SHA is required');
  return commit;
}
export function deploymentArtifacts(): Plugin {
  return {
    name: 'django-deployment-artifacts',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        if (!context.bundle) return html.replace('{% csrf_token %}', '');
        return html;
      },
    },
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find(
        (item) => item.type === 'chunk' && item.isEntry,
      );
      if (!entry) throw new Error('Missing client entry');
      this.emitFile({
        type: 'asset',
        fileName: 'asset-manifest.json',
        source: JSON.stringify({ files: { 'main.js': `/${entry.fileName}` } }),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'static/revision.json',
        source: JSON.stringify({
          commit: revision(process.env, () =>
            execFileSync('git', ['rev-parse', 'HEAD'], {
              encoding: 'utf8',
            }).trim(),
          ),
        }),
      });
    },
  };
}
