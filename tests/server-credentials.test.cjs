const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

// Load the existing Pages Router modules with a mocked HTTP client so these
// tests never send credentials or depend on third-party services.
function loadPage(file, axios, env = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true
    }
  })
  const module = { exports: {} }
  vm.runInNewContext(outputText, {
    module,
    exports: module.exports,
    process: { env },
    require: name => (name === 'axios' ? axios : {}),
    console
  }, { filename: file })
  return module.exports
}

test('discovery and search use the server TMDB key', async () => {
  const calls = []
  const axios = { get: async (url, options) => {
    calls.push({ url, options })
    return { data: { results: [] } }
  } }
  const env = { API_KEY: 'test-tmdb-key' }
  const discovery = loadPage('src/pages/[type].tsx', axios, env)
  const search = loadPage('src/pages/search/[title].tsx', axios, env)

  await discovery.getStaticProps({ params: { type: 'movies' } })
  await discovery.getStaticProps({ params: { type: 'series' } })
  await search.getServerSideProps({ params: { title: 'space' } })

  assert.equal(calls.length, 3)
  for (const call of calls) assert.equal(call.options.params.api_key, env.API_KEY)
  assert.match(calls[0].url, /discover\/movie/)
  assert.match(calls[1].url, /discover\/tv/)
  assert.equal(calls[2].options.params.query, 'space')
})

test('API routes use the server TMDB key', async () => {
  const files = [
    'src/pages/api/movies/popular.ts',
    'src/pages/api/series/popular.ts',
    'src/pages/api/cast/[mediaType]/[mediaId].tsx',
    'src/pages/api/info/trailer/[mediaType]/[mediaId].ts',
    'src/pages/api/info/watchproviders/[mediaType]/[mediaId].ts'
  ]
  for (const file of files) {
    let options
    const axios = { get: async (url, requestOptions) => {
      options = requestOptions
      return { data: { cast: [], results: [] } }
    } }
    const handler = loadPage(file, axios, { API_KEY: 'test-tmdb-key' }).default
    let status
    const response = {
      status(value) { status = value; return this },
      json() {}
    }
    await handler({ query: { mediaType: 'movie', mediaId: '1', page: '1' } }, response)
    assert.equal(status, 200, file)
    assert.equal(options.params.api_key, 'test-tmdb-key', file)
  }
})

test('detail page requests an optional IMDb rating server-side without returning the key', async () => {
  const calls = []
  const axios = { get: async (url, options) => {
    calls.push({ url, options })
    return calls.length === 1
      ? { data: { imdb_id: 'tt1234567' } }
      : { data: { ratings: { rating: 7.5 } } }
  } }
  const page = loadPage('src/pages/info/[mediaType]/[mediaId].tsx', axios, {
    API_KEY: 'test-tmdb-key', RAPIDAPI_KEY: 'test-rapidapi-key'
  })
  const result = await page.getServerSideProps({ params: { mediaType: 'movie', mediaId: '1' } })

  assert.equal(calls[0].options.params.api_key, 'test-tmdb-key')
  assert.equal(calls[1].options.headers['x-rapidapi-key'], 'test-rapidapi-key')
  assert.equal(calls[1].options.timeout, 3000)
  assert.equal(result.props.imdbRating, 7.5)
  assert.doesNotMatch(JSON.stringify(result.props), /test-(tmdb|rapidapi)-key/)
})

test('detail page remains available without an IMDb key or when IMDb fails', async () => {
  for (const rapidKey of [undefined, 'test-rapidapi-key']) {
    let calls = 0
    const axios = { get: async () => {
      calls++
      if (calls === 1) return { data: { imdb_id: 'tt1234567' } }
      throw new Error('IMDb unavailable')
    } }
    const page = loadPage('src/pages/info/[mediaType]/[mediaId].tsx', axios, {
      API_KEY: 'test-tmdb-key', RAPIDAPI_KEY: rapidKey
    })
    const result = await page.getServerSideProps({ params: { mediaType: 'movie', mediaId: '1' } })
    assert.equal(result.props.imdbRating, null)
    assert.equal(calls, rapidKey ? 2 : 1)
  }
})
