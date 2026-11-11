// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { axiosGet } = vi.hoisted(() => ({ axiosGet: vi.fn() }))
vi.mock('axios', () => ({ default: { get: axiosGet } }))

import moviesPopular from '@/pages/api/movies/popular'
import seriesPopular from '@/pages/api/series/popular'
import cast from '@/pages/api/cast/[mediaType]/[mediaId]'
import trailer from '@/pages/api/info/trailer/[mediaType]/[mediaId]'
import watchProviders from '@/pages/api/info/watchproviders/[mediaType]/[mediaId]'

import { apiRequest, recorder } from './helpers'

beforeEach(() => {
  axiosGet.mockReset()
  vi.stubEnv('API_KEY', 'test-key')
})

const castPayload = {
  cast: [
    { id: 1, known_for_department: 'Acting', profile_path: '/a.jpg' },
    { id: 2, known_for_department: 'Directing', profile_path: '/b.jpg' },
    { id: 3, known_for_department: 'Acting', profile_path: null }
  ]
}

describe('API routes proxy TMDB', () => {
  it('forward pages and default missing or empty pages to 1', async () => {
    axiosGet.mockResolvedValue({ data: { page: 7, results: [{ id: 44 }] } })
    for (const handler of [moviesPopular, seriesPopular]) {
      const res = recorder()
      await handler(apiRequest({ page: '7' }), res)
      expect(res.code).toBe(200)
      expect(res.body).toEqual({ page: 7, results: [{ id: 44 }] })

      for (const query of [{}, { page: '' }]) {
        const fallback = recorder()
        await handler(apiRequest(query), fallback)
        expect(axiosGet.mock.calls.at(-1)![1].params.page).toBe(1)
        expect(fallback.code).toBe(200)
      }
    }
    expect(axiosGet.mock.calls[0][0]).toBe('https://api.themoviedb.org/3/discover/movie')
    expect(axiosGet.mock.calls[3][0]).toBe('https://api.themoviedb.org/3/discover/tv')
    expect(axiosGet.mock.calls[0][1].params).toEqual({
      api_key: 'test-key',
      sort_by: 'popularity.desc',
      language: 'en-US',
      page: '7'
    })
  })

  it('cast route filters to acting members with a profile', async () => {
    axiosGet.mockResolvedValue({ data: castPayload })
    const res = recorder()
    await cast(apiRequest({ mediaType: 'movie', mediaId: '101' }), res)
    expect(axiosGet.mock.calls[0][0]).toContain('api.themoviedb.org/3/movie/101/credits')
    expect(res.code).toBe(200)
    expect(res.body).toEqual([
      { id: 1, known_for_department: 'Acting', profile_path: '/a.jpg' }
    ])
  })

  it('trailer and watch provider routes forward the detail data', async () => {
    axiosGet.mockResolvedValue({ data: { results: [] } })
    const res = recorder()
    await trailer(apiRequest({ mediaType: 'movie', mediaId: '101' }), res)
    expect(res.code).toBe(200)
    expect(axiosGet.mock.calls[0][0]).toContain('/3/movie/101/videos')

    const providers = recorder()
    await watchProviders(apiRequest({ mediaType: 'tv', mediaId: '202' }), providers)
    expect(providers.code).toBe(200)
    expect(axiosGet.mock.calls[1][0]).toContain('/3/tv/202/watch/providers')
  })

  it('return the upstream status without exposing the upstream body', async () => {
    axiosGet.mockRejectedValue({
      response: { status: 503, data: { message: 'sensitive upstream details' } }
    })
    const res = recorder()
    await moviesPopular(apiRequest({ page: '2' }), res)
    expect(res.code).toBe(503)
    expect(res.body).toEqual({ message: 'Api error' })
  })

  it('use 500 when the failure carries no upstream status', async () => {
    axiosGet.mockRejectedValue(new Error('boom'))
    const res = recorder()
    await seriesPopular(apiRequest({}), res)
    expect(res.code).toBe(500)
    expect(res.body).toEqual({ message: 'Api error' })
  })

  it('send the server-side key for every route', async () => {
    axiosGet.mockResolvedValue({ data: { cast: [], results: [] } })
    for (const handler of [moviesPopular, seriesPopular, cast, trailer, watchProviders]) {
      const res = recorder()
      await handler(
        apiRequest({ mediaType: 'movie', mediaId: '1', page: '1' }),
        res
      )
      expect(res.code).toBe(200)
      expect(axiosGet.mock.calls.at(-1)![1].params.api_key).toBe('test-key')
    }
  })
})
