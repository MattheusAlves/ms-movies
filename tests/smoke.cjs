// Smoke-test a fixture-backed production build, not live TMDB behavior.
const assert = require('node:assert/strict')
const net = require('node:net')
const path = require('node:path')
const { spawn } = require('node:child_process')

async function availablePort() {
  const socket = net.createServer()
  await new Promise((resolve, reject) => socket.once('error', reject).listen(0, '127.0.0.1', resolve))
  const port = socket.address().port
  await new Promise(resolve => socket.close(resolve))
  return port
}

async function main() {
  const port = await availablePort()
  const preload = path.join(__dirname, 'fixtures', 'mock-tmdb.cjs')
  const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', String(port)], {
    env: {
      ...process.env,
      API_KEY: 'fixture-key',
      RAPIDAPI_KEY: '',
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require=${JSON.stringify(preload)}`.trim(),
      NEXT_TELEMETRY_DISABLED: '1'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let output = ''
  child.stdout.on('data', chunk => { output += chunk.toString() })
  child.stderr.on('data', chunk => { output += chunk.toString() })

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server did not start')), 30000)
      child.once('error', error => { clearTimeout(timeout); reject(error) })
      child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited with code ${code}`)) })
      child.stdout.on('data', () => {
        if (output.includes('Ready')) {
          clearTimeout(timeout)
          resolve()
        }
      })
    })
    const base = `http://127.0.0.1:${port}`
    const pages = [
      ['/movies', 'Fixture Movie'],
      ['/series', 'Fixture Series'],
      ['/search/fixture', 'Fixture Movie'],
      ['/info/movie/101', 'Fixture Movie'],
      ['/info/tv/202', 'Fixture Series'],
      ['/to-watch', 'Minha lista']
    ]
    for (const [url, text] of pages) {
      const response = await fetch(base + url)
      assert.equal(response.status, 200, url)
      assert.ok((await response.text()).includes(text), `${url} should contain ${text}`)
      console.log(`OK ${url}`)
    }
    const redirect = await fetch(base + '/', { redirect: 'manual' })
    assert.equal(redirect.status, 308)
    assert.equal(redirect.headers.get('location'), '/movies')
    console.log('OK / redirect')
    const endpoints = [
      ['/api/movies/popular?page=1', data => data.results[0].title === 'Fixture Movie'],
      ['/api/series/popular?page=1', data => data.results[0].name === 'Fixture Series'],
      ['/api/cast/movie/101', data => Array.isArray(data)],
      ['/api/info/trailer/movie/101', data => Array.isArray(data.results)],
      ['/api/info/watchproviders/movie/101', data => typeof data.results === 'object']
    ]
    for (const [url, check] of endpoints) {
      const response = await fetch(base + url)
      assert.equal(response.status, 200, url)
      assert.ok(check(await response.json()), url)
      console.log(`OK ${url}`)
    }
  } catch (error) {
    console.error(output)
    throw error
  } finally {
    child.kill()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
