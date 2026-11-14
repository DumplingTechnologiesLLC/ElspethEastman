const { execFileSync, spawnSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const commit = process.env.SOURCE_VERSION || process.env.GITHUB_SHA
  || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('A full build commit SHA is required');
const env = {
  ...process.env,
  // Webpack 4 needs this flag on supported Node releases.
  NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --openssl-legacy-provider`.trim(),
};
for (const args of [
  ['--cwd', 'public', 'install', '--frozen-lockfile', '--non-interactive', '--production=false'],
  ['--cwd', 'public', 'build'],
]) {
  const result = spawnSync('yarn', args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
writeFileSync(path.join(root, 'public/build/static/revision.json'), `${JSON.stringify({ commit })}\n`);
