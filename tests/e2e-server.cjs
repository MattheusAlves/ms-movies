// Serve the fixture build to Playwright without exposing provider credentials.
const path = require('node:path')
const { spawn } = require('node:child_process')
const fixtureEnv = require('./fixtures/env.cjs')

const preload = path.join(__dirname, 'fixtures', 'mock-tmdb.cjs')
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', process.env.E2E_PORT || '3210'], {
  env: {
    ...process.env,
    ...fixtureEnv,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require=${JSON.stringify(preload)}`.trim(),
    NEXT_TELEMETRY_DISABLED: '1'
  },
  stdio: 'inherit'
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}
child.on('error', error => { console.error(error.message); process.exitCode = 1 })
child.on('exit', code => { process.exitCode = code ?? 1 })
