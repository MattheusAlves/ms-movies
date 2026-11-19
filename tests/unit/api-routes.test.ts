// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { axiosGet } = vi.hoisted(() => ({ axiosGet: vi.fn() }))
vi.mock('axios', () => ({ default: { get: axiosGet } }))

import { GET as moviesPopular } from '@/app/api/movies/popular/route'
import { GET as seriesPopular } from '@/app/api/series/popular/route'
import { GET as search } from '@/app/api/search/route'
import { GET as cast } from '@/app/api/cast/[mediaType]/[mediaId]/route'
import { GET as trailer } from '@/app/api/info/trailer/[mediaType]/[mediaId]/route'
import { GET as watchProviders } from '@/app/api/info/watchproviders/[mediaType]/[mediaId]/route'

const request = (query = '') => new Request(`http://localhost/api/test${query}`)
const context = (mediaType = 'movie', mediaId = '101') => ({ params: Promise.resolve({ mediaType, mediaId }) })

beforeEach(() => {
  axiosGet.mockReset()
  vi.stubEnv('API_KEY', 'test-key')
})

describe('API routes proxy TMDB', () => {
  it('forwards pages and defaults missing or empty pages to 1', async () => {
    axiosGet.mockResolvedValue({ data: { page: 7, results: [{ id: 44 }] } })
    for (const handler of [moviesPopular, seriesPopular]) {
      const res = await handler(request('?page=7'))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ page: 7, results: [{ id: 44 }] })
      expect(res.headers.get('Cache-Control')).toBe('no-store')
      for (const query of ['', '?page=']) {
        const fallback = await handler(request(query))
        expect(axiosGet.mock.calls.at(-1)![1].params.page).toBe(1)
        expect(fallback.status).toBe(200)
      }
    }
    expect(axiosGet.mock.calls[0][0]).toBe('https://api.themoviedb.org/3/discover/movie')
    expect(axiosGet.mock.calls[3][0]).toBe('https://api.themoviedb.org/3/discover/tv')
    for (const index of [0, 3]) {
      expect(axiosGet.mock.calls[index][1].params).toEqual({
        api_key: 'test-key', sort_by: 'popularity.desc', language: 'en-US', page: 7
      })
    }
  })

  it('filters cast to acting members with a profile', async () => {
    axiosGet.mockResolvedValue({ data: { cast: [
      { id: 1, known_for_department: 'Acting', profile_path: '/a.jpg' },
      { id: 2, known_for_department: 'Directing', profile_path: '/b.jpg' },
      { id: 3, known_for_department: 'Acting', profile_path: null }
    ] } })
    const res = await cast(request(), context())
    expect(axiosGet.mock.calls[0][0]).toContain('/3/movie/101/credits')
    expect(axiosGet.mock.calls[0][1].params.language).toBe('en-US')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([{ id: 1, known_for_department: 'Acting', profile_path: '/a.jpg' }])
  })

  it('forwards encoded search queries and pages without caching', async () => {
    axiosGet.mockResolvedValue({ data: { page: 2, total_pages: 2, results: [] } })
    const res = await search(request('?query=Space%20%26%20Time&page=2'))
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect(axiosGet.mock.calls[0][1].params).toEqual({ api_key: 'test-key', language: 'en-US', query: 'Space & Time', page: 2 })
  })

  it('forwards trailer and watch provider data', async () => {
    axiosGet.mockResolvedValueOnce({ data: { results: [] } }).mockResolvedValueOnce({ data: { results: {} } })
    expect((await trailer(request(), context())).status).toBe(200)
    expect(axiosGet.mock.calls[0][0]).toContain('/3/movie/101/videos')
    expect(axiosGet.mock.calls[0][1].params.language).toBe('en-US')
    expect((await watchProviders(request(), context('tv', '202'))).status).toBe(200)
    expect(axiosGet.mock.calls[1][0]).toContain('/3/tv/202/watch/providers')
  })

  it('returns safe upstream errors and disables caching', async () => {
    axiosGet.mockRejectedValue({ response: { status: 503 }, message: 'sensitive upstream details' })
    const res = await moviesPopular(request('?page=2'))
    expect(res.status).toBe(503)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect(await res.json()).toEqual({ message: 'Api error' })
    axiosGet.mockRejectedValue(new Error('boom'))
    expect((await seriesPopular(request())).status).toBe(502)
  })

  it('sends the server-side key for every route', async () => {
    for (const [handler, payload] of [
      [() => moviesPopular(request('?page=1')), { results: [] }],
      [() => seriesPopular(request('?page=1')), { results: [] }],
      [() => cast(request(), context()), { cast: [] }],
      [() => trailer(request(), context()), { results: [] }],
      [() => watchProviders(request(), context()), { results: {} }]
    ] as const) {
      axiosGet.mockResolvedValue({ data: payload })
      const res = await handler()
      expect(res.status).toBe(200)
      expect(res.headers.get('Cache-Control')).toBe('no-store')
      expect(axiosGet.mock.calls.at(-1)![1].params.api_key).toBe('test-key')
    }
  })

  it('rejects invalid and repeated route parameters without calling TMDB', async () => {
    for (const handler of [
      () => moviesPopular(request('?page=0')),
      () => seriesPopular(request('?page=501')),
      () => moviesPopular(request('?page=1&page=2')),
      () => search(request('?query=test&page=501')),
      () => search(request('?query=test&page=1&page=2')),
      () => search(request('?query=test&query=other')),
      () => search(request('?query=%20')),
      () => cast(request(), context('person', '101')),
      () => trailer(request(), context('movie', '../1'))
    ]) {
      const res = await handler()
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ message: 'Invalid request' })
      expect(res.headers.get('Cache-Control')).toBe('no-store')
    }
    expect(axiosGet).not.toHaveBeenCalled()
  })
})
