const path = require('node:path')
const { spawnSync } = require('node:child_process')
const fixtureEnv = require('./fixtures/env.cjs')

const preload = path.join(__dirname, 'fixtures', 'mock-tmdb.cjs')
const result = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ...fixtureEnv,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require=${JSON.stringify(preload)}`.trim(),
    NEXT_TELEMETRY_DISABLED: '1'
  }
})
if (result.error) throw result.error
process.exit(result.status ?? 1)
