// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { axiosGet } = vi.hoisted(() => ({ axiosGet: vi.fn() }))
vi.mock('axios', () => ({ default: { get: axiosGet } }))

// Namespace imports: page modules export the component as default plus the
// data loaders.
import * as discovery from '@/pages/[type]'
import * as search from '@/pages/search/[title]'
import * as detail from '@/pages/info/[mediaType]/[mediaId]'

import { propsOf, ssgContext, ssvContext } from './helpers'

beforeEach(() => {
  axiosGet.mockReset()
  vi.unstubAllEnvs()
})

describe('data pages use the server TMDB key', () => {
  it('discovery and search pass the key as a request param', async () => {
    axiosGet.mockResolvedValue({ data: { results: [] } })
    vi.stubEnv('API_KEY', 'test-tmdb-key')

    await discovery.getStaticProps(ssgContext({ type: 'movies' }))
    await discovery.getStaticProps(ssgContext({ type: 'series' }))
    await search.getServerSideProps(ssvContext({ title: 'space' }))

    expect(axiosGet).toHaveBeenCalledTimes(3)
    for (const call of axiosGet.mock.calls) {
      expect(call[1].params.api_key).toBe('test-tmdb-key')
    }
    expect(axiosGet.mock.calls[0][0]).toBe('https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc')
    expect(axiosGet.mock.calls[1][0]).toBe('https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc')
    expect(axiosGet.mock.calls[2][1].params.query).toBe('space')
  })

  it('discovery preserves the TMDB page shape and revalidate window', async () => {
    const page = {
      page: 1,
      results: [{ id: 101, title: 'Space & Time' }],
      total_pages: 3
    }
    axiosGet.mockResolvedValue({ data: page })

    const props = await propsOf(discovery.getStaticProps(ssgContext({ type: 'movies' })))
    expect(props).toEqual({ initialData: [page] })
    expect(await discovery.getStaticPaths(ssgContext({}))).toEqual({
      paths: [{ params: { type: 'movies' } }, { params: { type: 'series' } }],
      fallback: false
    })
  })
})

describe('detail page IMDb rating', () => {
  it('requests an optional rating server-side without returning keys', async () => {
    axiosGet
      .mockResolvedValueOnce({ data: { imdb_id: 'tt1234567' } })
      .mockResolvedValueOnce({ data: { ratings: { rating: 7.5 } } })
    vi.stubEnv('API_KEY', 'test-tmdb-key')
    vi.stubEnv('RAPIDAPI_KEY', 'test-rapidapi-key')

    const props = await propsOf(
      detail.getServerSideProps(ssvContext({ mediaType: 'movie', mediaId: '1' }))
    )

    expect(axiosGet.mock.calls[0][1].params.api_key).toBe('test-tmdb-key')
    expect(axiosGet.mock.calls[1][1].headers['x-rapidapi-key']).toBe('test-rapidapi-key')
    expect(axiosGet.mock.calls[1][1].timeout).toBe(3000)
    expect(props.imdbRating).toBe(7.5)
    expect(JSON.stringify(props)).not.toMatch(/test-(tmdb|rapidapi)-key/)
  })

  it('keeps the page available without an IMDb key or when IMDb fails', async () => {
    for (const rapidKey of [undefined, 'test-rapidapi-key']) {
      axiosGet
        .mockImplementationOnce(async () => ({ data: { imdb_id: 'tt1234567' } }))
        .mockImplementationOnce(async () => {
          throw new Error('IMDb unavailable')
        })
      vi.stubEnv('API_KEY', 'test-tmdb-key')
      vi.stubEnv('RAPIDAPI_KEY', rapidKey ?? '')

      const props = await propsOf(
        detail.getServerSideProps(ssvContext({ mediaType: 'movie', mediaId: '1' }))
      )
      expect(props.imdbRating).toBe(null)
      expect(axiosGet).toHaveBeenCalledTimes(rapidKey ? 2 : 1)
      axiosGet.mockReset()
    }
  })
})

describe('page errors do not expose upstream request credentials', () => {
  const secret = 'test-tmdb-secret'

  it('swallow the upstream error and throw a generic message', async () => {
    axiosGet.mockRejectedValue(new Error(`upstream error containing ${secret}`))
    vi.stubEnv('API_KEY', secret)

    const cases: Array<[unknown, RegExp]> = [
      [discovery.getStaticProps(ssgContext({ type: 'movies' })), /Unable to load discovery data/],
      [search.getServerSideProps(ssvContext({ title: 'space' })), /Unable to load search data/],
      [
        detail.getServerSideProps(ssvContext({ mediaType: 'movie', mediaId: '1' })),
        /Unable to load title data/
      ]
    ]
    for (const [loader, pattern] of cases) {
      const error = await (async () => {
        try {
          await loader
          throw new Error('expected the loader to fail')
        } catch (e) {
          return e
        }
      })()
      expect(error.message).toMatch(pattern)
      expect(String(error)).not.toMatch(secret)
    }
  })
})
