// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { axiosGet } = vi.hoisted(() => ({ axiosGet: vi.fn() }))
vi.mock('axios', () => ({ default: { get: axiosGet } }))

import { tmdb, TmdbError, tmdbErrorStatus } from '@/util/tmdb'

describe('server-only TMDB client', () => {
  beforeEach(() => {
    axiosGet.mockReset()
    vi.stubEnv('API_KEY', 'test-key')
  })

  it('sends the server key, locale, sort, page, and bounded timeout', async () => {
    axiosGet.mockResolvedValue({ data: { page: 7, results: [{ id: 1 }] } })
    expect(await tmdb.discover('movie', '7')).toEqual({ page: 7, results: [{ id: 1 }] })
    expect(axiosGet).toHaveBeenCalledWith('https://api.themoviedb.org/3/discover/movie', {
      timeout: 8000,
      params: { api_key: 'test-key', sort_by: 'popularity.desc', language: 'en-US', page: 7 }
    })
  })

  it('uses an explicit default page and validates inputs before any request', async () => {
    axiosGet.mockResolvedValue({ data: { results: [] } })
    await tmdb.discover('tv')
    expect(axiosGet.mock.calls[0][1].params.page).toBe(1)
    axiosGet.mockClear()
    for (const operation of [
      () => tmdb.discover('person'),
      () => tmdb.discover('movie', '501'),
      () => tmdb.discover('movie', ['1']),
      () => tmdb.title('movie', '../1'),
      () => tmdb.credits('person', '1'),
      () => tmdb.search('   '),
      () => tmdb.search('x'.repeat(501))
    ]) {
      await expect(operation()).rejects.toMatchObject({ status: 400 })
    }
    expect(axiosGet).not.toHaveBeenCalled()
  })

  it('validates provider response shapes', async () => {
    axiosGet.mockResolvedValue({ data: { results: 'not-an-array' } })
    await expect(tmdb.search('space')).rejects.toMatchObject({ status: 502 })
    axiosGet.mockResolvedValue({ data: { results: [{}] } })
    await expect(tmdb.search('space')).rejects.toMatchObject({ status: 502 })
    axiosGet.mockResolvedValue({ data: { results: [] } })
    await expect(tmdb.watchProviders('movie', '1')).rejects.toMatchObject({ status: 502 })
    axiosGet.mockResolvedValue({ data: { title: 'Missing ID' } })
    await expect(tmdb.title('movie', '1')).rejects.toMatchObject({ status: 502 })
    axiosGet.mockResolvedValue({ data: { id: 2 } })
    await expect(tmdb.title('movie', '1')).rejects.toMatchObject({ status: 502 })
  })

  it('returns safe upstream statuses without exposing credential-bearing errors', async () => {
    const secret = 'sensitive-test-key'
    vi.stubEnv('API_KEY', secret)
    axiosGet.mockRejectedValue({ response: { status: 503 }, message: `request includes ${secret}` })
    const error = await tmdb.discover('movie').catch(error => error)
    expect(error).toBeInstanceOf(TmdbError)
    expect(tmdbErrorStatus(error)).toBe(503)
    expect(String(error)).not.toContain(secret)
    axiosGet.mockRejectedValue({ code: 'ECONNABORTED', message: secret })
    await expect(tmdb.discover('movie')).rejects.toMatchObject({ status: 504 })
    axiosGet.mockRejectedValue(new Error(secret))
    await expect(tmdb.discover('movie')).rejects.toMatchObject({ status: 502 })
  })

  it('rejects a missing server key without making a request', async () => {
    vi.stubEnv('API_KEY', '')
    await expect(tmdb.search('space')).rejects.toMatchObject({ status: 503 })
    expect(axiosGet).not.toHaveBeenCalled()
  })
})
