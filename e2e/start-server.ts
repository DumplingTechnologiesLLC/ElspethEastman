import { spawn } from 'node:child_process';
import { python, environment, root } from './environment.ts';

const server = spawn(python, ['e2e/server.py'], {
  cwd: root,
  env: environment,
  stdio: 'inherit',
});
server.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
server.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGTERM', 'SIGINT'] as const)
  process.once(signal, () => server.kill(signal));
