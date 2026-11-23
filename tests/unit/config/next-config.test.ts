// @vitest-environment node
import { createRequire } from 'node:module'
import { afterEach, expect, it, vi } from 'vitest'

const load = createRequire(import.meta.url)
const configFile = load.resolve('../../../next.config.js')

afterEach(() => {
  delete load.cache[configFile]
  vi.unstubAllEnvs()
})

it('restricts image optimization to the configured HTTPS host and path', () => {
  vi.stubEnv('NEXT_PUBLIC_TMDB_IMAGE_BASE_URL', 'https://images.example.test:8443/custom/posters/')
  delete load.cache[configFile]
  const config = load(configFile)
  expect(config.images.remotePatterns).toEqual([
    { protocol: 'https', hostname: 'images.example.test', port: '8443', pathname: '/custom/posters/**' }
  ])
})

it('fails early when an external base is missing or unsafe', () => {
  vi.stubEnv('NEXT_PUBLIC_TMDB_IMAGE_BASE_URL', '')
  delete load.cache[configFile]
  expect(() => load(configFile)).toThrow('Missing required environment variable: NEXT_PUBLIC_TMDB_IMAGE_BASE_URL')
  vi.stubEnv('NEXT_PUBLIC_TMDB_IMAGE_BASE_URL', 'http://images.example.test/private')
  delete load.cache[configFile]
  expect(() => load(configFile)).toThrow('Invalid NEXT_PUBLIC_TMDB_IMAGE_BASE_URL')
})
