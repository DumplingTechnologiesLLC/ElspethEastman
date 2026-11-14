const { spawn } = require('node:child_process');
const { python, environment, root } = require('./environment.cjs');

const server = spawn(python, ['e2e/server.py'], { cwd: root, env: environment, stdio: 'inherit' });
server.on('error', error => { console.error(error); process.exit(1); });
server.on('exit', code => process.exit(code ?? 1));
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.kill(signal));
